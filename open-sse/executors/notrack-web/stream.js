import { estimateTokens } from "./cjk.js";
import { consumeNotrackSse, processNotrackSseLine } from "./sse.js";
export function transformNotrackStream(upstream, model, id, created, userInput, includeUsage, signal, log) {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            const state = { roleEmitted: false, anyDelta: false, totalChars: 0, fullText: "" };
            const emit = makeChunkEmitter(encoder, controller, { id, created, model });
            await consumeNotrackSse(upstream, signal, (rawLine) => processNotrackSseLine(rawLine, (event) => handleStreamEvent(event, state, emit)), "Stream parse error", log);
            finishStream(state, emit, encoder, controller, {
                id,
                created,
                model,
                userInput,
                includeUsage,
            });
        },
    });
}
function makeChunkEmitter(encoder, controller, meta) {
    return (delta, finish) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            id: meta.id,
            object: "chat.completion.chunk",
            created: meta.created,
            model: meta.model,
            system_fingerprint: "fp_notrack",
            choices: [{ index: 0, delta, finish_reason: finish ?? null }],
        })}\n\n`));
    };
}
function handleStreamEvent(event, state, emit) {
    const ensureRole = () => {
        if (!state.roleEmitted) {
            state.roleEmitted = true;
            emit({ role: "assistant", content: "" });
        }
    };
    if (event.type === "thinking") {
        ensureRole();
        emit({ reasoning: "[thinking]" });
        return;
    }
    if (event.type === "delta" && typeof event.chunk === "string") {
        appendStreamDelta(state, event.chunk, ensureRole, emit);
        return;
    }
    if (event.type === "message" && typeof event.content === "string" && !state.anyDelta) {
        appendStreamDelta(state, event.content, ensureRole, emit);
    }
}
function appendStreamDelta(state, text, ensureRole, emit) {
    state.anyDelta = true;
    state.totalChars += text.length;
    state.fullText += text;
    ensureRole();
    emit({ content: text });
}
function finishStream(state, emit, encoder, controller, meta) {
    if (!state.roleEmitted)
        emit({ role: "assistant", content: "" });
    emit({}, "stop");
    if (meta.includeUsage) {
        const completionTokens = estimateTokens(state.fullText || "x".repeat(state.totalChars));
        const promptTokens = estimateTokens(meta.userInput);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            id: meta.id,
            object: "chat.completion.chunk",
            created: meta.created,
            model: meta.model,
            system_fingerprint: "fp_notrack",
            choices: [],
            usage: {
                prompt_tokens: promptTokens,
                completion_tokens: completionTokens,
                total_tokens: promptTokens + completionTokens,
            },
        })}\n\n`));
    }
    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
    controller.close();
}
export async function collectNotrackResponse(upstream, signal, log) {
    const acc = {
        content: "",
        fallback: "",
        chatMeta: null,
        userMsgId: null,
        assistantTurn: null,
        anyDelta: false,
    };
    await consumeNotrackSse(upstream, signal, (rawLine) => processNotrackSseLine(rawLine, (event) => handleCollectEvent(event, acc)), "Collect parse error", log);
    return {
        content: acc.anyDelta ? acc.content : acc.content || acc.fallback,
        chatMeta: acc.chatMeta,
        userMsgId: acc.userMsgId,
        assistantTurn: acc.assistantTurn,
    };
}
function handleCollectEvent(event, acc) {
    if (event.type === "chat_meta" && typeof event.chat_id === "string") {
        acc.chatMeta = event.chat_id;
        return;
    }
    if (event.type === "user" && typeof event.message_id === "string") {
        acc.userMsgId = event.message_id;
        return;
    }
    if (event.type === "delta") {
        if (typeof event.chunk === "string") {
            acc.anyDelta = true;
            acc.content += event.chunk;
        }
        if (typeof event.turn === "number")
            acc.assistantTurn = event.turn;
        return;
    }
    if (event.type === "message") {
        if (typeof event.content === "string")
            acc.fallback = event.content;
        if (typeof event.turn === "number")
            acc.assistantTurn = event.turn;
    }
}
