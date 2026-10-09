/* Adapted from miuuyy/codex-chatgpt-web commit 09877fa21ffdbf20979623ef501046fc02a750d7 (MIT). */
import { estimateTokens } from "../../lib/token-estimate.js";
import { CHATGPT_WEB_BACKEND_MODEL, resolveChatGptWebContextLimits, } from "../../chatgpt-web-models.js";
import { estimateCompiledChatGptWebInputTokens } from "./input-tokens.js";
import { CHATGPT_BIGGER_CONTEXT_PARTS, compileChatGptWebPrompt, } from "./prompt.js";
import { extractChatGptTurnIdentity } from "./environment.js";
import { CHATGPT_WEB_LUNA_MODEL_ID, resolveChatGptWebModelMode, } from "./model.js";
// The real capability has the same length. Keeping it out of usage accounting would make
// estimates differ slightly between the prepared browser prompt and later Codex tool rounds.
const ESTIMATE_TURN_TOKEN = "turn_00000000000000000000000000000000";
function conservativeTextTokens(text, modelId) {
    return estimateTokens(text, modelId);
}
export function estimateChatGptWebInputTokens(parsed, capabilities) {
    const mode = resolveChatGptWebModelMode(parsed.modelId, parsed.options.reasoning, capabilities);
    const identity = extractChatGptTurnIdentity(parsed);
    const compiled = compileChatGptWebPrompt(parsed, capabilities, mode.localTools ? ESTIMATE_TURN_TOKEN : undefined, {
        captureLunaCheckpoint: parsed.modelId === CHATGPT_WEB_LUNA_MODEL_ID &&
            !parsed._compactionRequest &&
            Boolean(identity.threadId && identity.turnId),
    });
    return estimateCompiledChatGptWebInputTokens(compiled, parsed.modelId);
}
/**
 * Use the existing model/account compaction threshold as the size of one context part. Normal
 * turns stay on the original one-message transport until they actually need the experiment;
 * compaction itself always receives all three parts so it can summarize the expanded window.
 */
export function resolveBiggerContextMultipartParts(parsed, capabilities) {
    if (parsed.modelId === CHATGPT_WEB_LUNA_MODEL_ID) {
        throw new Error("Bigger Context is unavailable for Luna because its accumulated browser transcript still shares one 28,000-token transport budget");
    }
    const mode = resolveChatGptWebModelMode(parsed.modelId, parsed.options.reasoning, capabilities);
    const onePartLimit = resolveChatGptWebContextLimits(CHATGPT_WEB_BACKEND_MODEL, mode.effort, capabilities).autoCompactTokenLimit;
    const inputTokens = estimateChatGptWebInputTokens(parsed, capabilities);
    return biggerContextPartCount(inputTokens, onePartLimit, parsed._compactionRequest === true);
}
export function biggerContextPartCount(inputTokens, onePartLimit, compaction) {
    if (compaction)
        return CHATGPT_BIGGER_CONTEXT_PARTS;
    if (inputTokens < onePartLimit)
        return undefined;
    if (inputTokens < onePartLimit * 2)
        return 2;
    return CHATGPT_BIGGER_CONTEXT_PARTS;
}
function roundEvidenceText(evidence) {
    return JSON.stringify({
        reasoning: evidence.reasoning ?? [],
        ...(evidence.answer !== undefined ? { answer: evidence.answer } : {}),
        ...(evidence.toolRequests
            ? {
                tool_calls: evidence.toolRequests.map((request) => ({
                    call_id: request.callId,
                    name: request.wireName,
                    ...(request.freeform
                        ? { input: request.input ?? "" }
                        : { arguments: request.arguments ?? {} }),
                })),
            }
            : {}),
    });
}
export function estimateChatGptWebUsage(parsed, evidence, capabilities) {
    const inputTokens = estimateChatGptWebInputTokens(parsed, capabilities);
    const outputTokens = conservativeTextTokens(roundEvidenceText(evidence), parsed.modelId);
    return {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimated: true,
    };
}
