/* Adapted from miuuyy/codex-chatgpt-web commit 09877fa21ffdbf20979623ef501046fc02a750d7 (MIT). */
import { parseDataUrl } from "../image.js";
import { extractChatGptCompactionSourceRevision } from "./environment.js";
import { activeCompactionToolResultInstruction, structuredCompactionHandoffInstruction, } from "./native-compaction-control.js";
export const LATEST_USER_PROMPT_MARKER = "CODEX_LATEST_USER_PROMPT_JSON";
function brokerContent(content) {
    if (typeof content === "string")
        return [{ type: "text", text: content }];
    return content.map((part) => {
        if (part.type === "text")
            return { type: "text", text: part.text };
        if (part.type === "file") {
            const parsed = parseDataUrl(part.fileData);
            return {
                type: "resource",
                resource: {
                    uri: `file:///${encodeURIComponent(part.filename)}`,
                    mimeType: parsed?.mediaType ?? "application/octet-stream",
                    blob: parsed?.base64 ?? part.fileData,
                },
            };
        }
        const parsed = parseDataUrl(part.imageUrl);
        if (parsed)
            return { type: "image", data: parsed.base64, mimeType: parsed.mediaType };
        return {
            type: "resource_link",
            uri: part.imageUrl,
            name: "Codex tool image",
            mimeType: "image/*",
        };
    });
}
function structuredContent(text) {
    try {
        const parsed = JSON.parse(text);
        return parsed !== null && typeof parsed === "object" ? parsed : undefined;
    }
    catch {
        return undefined;
    }
}
function toolResult(message) {
    const content = brokerContent(message.content);
    const text = typeof message.content === "string"
        ? message.content
        : message.content
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("\n");
    const structured = structuredContent(text);
    return {
        content,
        ...(structured !== undefined ? { structuredContent: structured } : {}),
        ...(message.isError ? { isError: true } : {}),
    };
}
function withActiveCompactionInstruction(result) {
    return {
        ...result,
        content: [...result.content, { type: "text", text: activeCompactionToolResultInstruction() }],
    };
}
function interruptedByActiveCompaction() {
    return {
        content: [{ type: "text", text: activeCompactionToolResultInstruction(false) }],
        isError: true,
    };
}
function userPromptText(content) {
    if (typeof content === "string")
        return content;
    if (!Array.isArray(content))
        return undefined;
    const text = content
        .flatMap((part) => {
        if (!part || typeof part !== "object" || Array.isArray(part))
            return [];
        const value = part;
        return (value.type === "input_text" || value.type === "text") &&
            typeof value.text === "string"
            ? [value.text]
            : [];
    })
        .join("\n");
    return text || undefined;
}
export function canonicalizeCompactionHandoff(parsed, summary) {
    const normalized = summary.trim();
    if (!normalized)
        throw new Error("ChatGPT returned an empty structured compaction handoff");
    const latestUserPrompt = userPromptText(extractChatGptCompactionSourceRevision(parsed).content);
    if (latestUserPrompt === undefined) {
        throw new Error("ChatGPT compaction source has no canonical latest user prompt");
    }
    const appendix = `${LATEST_USER_PROMPT_MARKER}\n${JSON.stringify(latestUserPrompt)}`;
    const markerOffset = normalized.lastIndexOf(`\n${LATEST_USER_PROMPT_MARKER}\n`);
    if (markerOffset < 0)
        return `${normalized}\n\n${appendix}`;
    if (normalized.slice(markerOffset + 1).trimEnd() !== appendix) {
        throw new Error("ChatGPT compaction handoff contains a conflicting latest-user marker");
    }
    return normalized;
}
function currentToolResults(parsed, session) {
    const results = new Map();
    for (const message of parsed.context.messages) {
        if (message.role !== "toolResult" || !session.hasOutstanding(message.toolCallId))
            continue;
        if (results.has(message.toolCallId)) {
            throw new Error(`Codex returned duplicate results for tool call ${message.toolCallId}`);
        }
        results.set(message.toolCallId, message);
    }
    return results;
}
export async function settleActiveCompactionSource(parsed, source, broker) {
    if (!source.isActive() || source.runtime.mode !== "tools") {
        throw new Error("The active ChatGPT compaction source has no MCP tool boundary");
    }
    const outstanding = source.outstanding();
    const results = currentToolResults(parsed, source);
    if (results.size !== outstanding.length) {
        throw new Error(`Codex supplied ${results.size} of ${outstanding.length} required tool results for compaction`);
    }
    let token;
    try {
        token = await source.runtime.token;
        const interruptedQueued = broker.requestCompaction(token, interruptedByActiveCompaction());
        for (const [index, request] of outstanding.entries()) {
            const result = results.get(request.callId);
            const canonical = toolResult(result);
            await broker.completeTool(token, request.callId, interruptedQueued === 0 && index === outstanding.length - 1
                ? withActiveCompactionInstruction(canonical)
                : canonical);
            source.runtime.externalProgress.recordToolResult();
            source.markResultDelivered(request.callId);
        }
        const browserOutcome = await source.browserOutcome;
        if (browserOutcome.type === "error")
            throw browserOutcome.error;
        // The retained checkpoint message must not race the helper's /turn/end handshake for the
        // just-completed response. Physical settlement retains the same tab before it is rebound.
        await source.physicalSettlement;
        const instructionDelivered = outstanding.length > 0 || broker.compactionDeliveryCount(token) > 0;
        if (!instructionDelivered)
            return undefined;
        const summary = browserOutcome.answer.trim();
        if (!summary)
            throw new Error("The active ChatGPT response returned an empty compaction summary");
        return summary;
    }
    finally {
        if (token)
            await broker.revoke(token);
    }
}
export const MAX_COMPACTION_HANDOFF_TIMEOUT_MS = 5 * 60000;
function boundedCompactionTimeout(timeoutMs) {
    return Math.min(timeoutMs, MAX_COMPACTION_HANDOFF_TIMEOUT_MS);
}
export async function requestRetainedCompactionHandoff(worker, parsed, source, broker, capabilities, traceId, signal, timeoutMs = MAX_COMPACTION_HANDOFF_TIMEOUT_MS) {
    const conversationKey = source.conversationKey();
    if (!conversationKey)
        throw new Error("The completed ChatGPT source has no retained conversation identity");
    const transaction = await broker.beginCompactionTransaction(traceId, boundedCompactionTimeout(timeoutMs));
    const instruction = structuredCompactionHandoffInstruction(transaction);
    const prepare = async () => ({ text: instruction, images: [], files: [], release: () => { } });
    const browserAbort = new AbortController();
    const abortBrowser = () => browserAbort.abort(signal?.reason);
    let browser;
    if (signal?.aborted)
        abortBrowser();
    else
        signal?.addEventListener("abort", abortBrowser, { once: true });
    try {
        browser = worker.run({
            traceId,
            modelId: parsed.modelId,
            reasoning: parsed.options.reasoning,
            // The retained connector exposes only the one-shot control token embedded above. It does
            // not receive an ordinary Codex tool environment for this checkpoint message.
            capabilities: { ...capabilities, localToolsEnabled: false },
            nativeConnector: true,
            prepare,
            prepareResume: prepare,
            conversationKey,
            requireRetainedConversation: true,
            abortSignal: browserAbort.signal,
            onTextDelta: () => { },
        });
        const [summary] = await Promise.all([
            broker.waitForCompactionHandoff(transaction.token, signal),
            browser,
        ]);
        return summary;
    }
    finally {
        browserAbort.abort();
        broker.abortCompactionTransaction(transaction.token);
        if (browser)
            await browser.then(() => undefined, () => undefined);
        signal?.removeEventListener("abort", abortBrowser);
    }
}
const structuredCompactionRuns = new Map();
const STRUCTURED_COMPACTION_RUN_TTL_MS = 30 * 60000;
function pruneStructuredCompactionRuns() {
    const cutoff = Date.now() - STRUCTURED_COMPACTION_RUN_TTL_MS;
    for (const [candidate, run] of structuredCompactionRuns) {
        if (run.createdAt < cutoff)
            structuredCompactionRuns.delete(candidate);
    }
}
/** Return the canonical result of an exact compact request, even after its source was retired. */
export function existingStructuredCompactionRun(key) {
    pruneStructuredCompactionRuns();
    return structuredCompactionRuns.get(key)?.promise;
}
export function runStructuredCompactionOnce(key, start) {
    pruneStructuredCompactionRuns();
    const existing = structuredCompactionRuns.get(key);
    if (existing)
        return existing.promise;
    const promise = Promise.resolve().then(start);
    structuredCompactionRuns.set(key, { createdAt: Date.now(), promise });
    return promise;
}
