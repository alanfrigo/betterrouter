/* Adapted from miuuyy/codex-chatgpt-web commit 09877fa21ffdbf20979623ef501046fc02a750d7 (MIT). */
import { createHash } from "node:crypto";
import { SUMMARY_PREFIX } from "../../responses/compaction.js";
import { extractChatGptTurnIdentity } from "./environment.js";
function messageText(item) {
    const content = item.content;
    if (typeof content === "string")
        return content;
    if (!Array.isArray(content))
        return undefined;
    return content
        .flatMap((block) => {
        if (!block || typeof block !== "object" || Array.isArray(block))
            return [];
        const text = block.text;
        return typeof text === "string" ? [text] : [];
    })
        .join("\n");
}
/** Native compaction remains part of the exact identity of a replayed Codex turn. */
function compactionEpoch(input) {
    return (input?.findLast((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item))
            return false;
        const record = item;
        return (record.type === "compaction" ||
            record.type === "compaction_summary" ||
            record.type === "context_compaction" ||
            (record.role === "user" && messageText(record)?.startsWith(`${SUMMARY_PREFIX}\n`)));
    }) ?? null);
}
export function chatGptConversationKey(parsed, namespace) {
    const identity = extractChatGptTurnIdentity(parsed);
    if (!identity.threadId)
        return undefined;
    const raw = parsed._rawBody;
    return createHash("sha256")
        .update(JSON.stringify({
        namespace,
        threadId: identity.threadId,
        modelId: parsed.modelId,
        reasoning: parsed.options.reasoning,
        compaction: compactionEpoch(raw?.input),
    }))
        .digest("hex");
}
/** Full history remains canonical; a retained epoch receives only the suffix after its last assistant reply. */
export function retainedConversationResumeRequest(parsed) {
    const lastAssistant = parsed.context.messages.findLastIndex((message) => message.role === "assistant");
    if (lastAssistant < 0 || lastAssistant === parsed.context.messages.length - 1)
        return undefined;
    return {
        ...parsed,
        context: {
            ...parsed.context,
            messages: parsed.context.messages.slice(lastAssistant + 1),
        },
    };
}
