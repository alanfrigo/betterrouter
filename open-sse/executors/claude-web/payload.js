// Pure Claude-web payload construction (types + transforms + default tools/style).
// Extracted verbatim from claude-web.ts. No host state, no fetch/auth.
import { extractClaudeWebAttachments } from "./attachments.js";
import { randomUUID } from "crypto";
// Default model when not specified
export const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";
function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function transformOpenAiTool(candidate) {
    if (!isRecord(candidate) || candidate.type !== "function" || !isRecord(candidate.function)) {
        return null;
    }
    const definition = candidate.function;
    if (typeof definition.name !== "string" || !definition.name.trim())
        return null;
    const description = typeof definition.description === "string" && definition.description.trim()
        ? definition.description
        : undefined;
    const schemaCandidate = definition.parameters ?? definition.input_schema;
    const inputSchema = isRecord(schemaCandidate) ? schemaCandidate : undefined;
    return {
        name: definition.name.trim(),
        ...(description ? { description } : {}),
        ...(inputSchema ? { input_schema: inputSchema } : {}),
    };
}
/**
 * Generate UUIDs for turn message tracking
 */
export function generateMessageUUIDs() {
    return {
        human_message_uuid: randomUUID(),
        assistant_message_uuid: randomUUID(),
    };
}
/**
 * Convert caller-provided OpenAI function tools to Claude Web tool definitions.
 *
 * Claude's own browser tools are account- and rollout-dependent. Inventing a
 * static list makes the request diverge from the authenticated UI, so only
 * explicit, structurally valid caller tools are forwarded here.
 */
export function transformOpenAiTools(tools) {
    if (!Array.isArray(tools))
        return [];
    const transformed = [];
    for (const candidate of tools) {
        const transformedTool = transformOpenAiTool(candidate);
        if (transformedTool)
            transformed.push(transformedTool);
    }
    return transformed;
}
/**
 * Get default personalized style
 */
export function getDefaultPersonalizedStyle() {
    return [
        {
            type: "default",
            key: "Default",
            name: "Normal",
            nameKey: "normal_style_name",
            prompt: "Normal\n",
            summary: "Default responses from Claude",
            summaryKey: "normal_style_summary",
            isDefault: true,
        },
    ];
}
/**
 * Detect whether an OpenAI-shape request body signals a desire for
 * reasoning / extended thinking — a top-level `reasoning_effort` string,
 * a Responses-API-style `reasoning.effort`, or a native Claude
 * `thinking: { type: "enabled" }` passthrough. Mirrors the same
 * effort-extraction shape used by `sanitizeReasoningEffortForProvider`
 * (open-sse/executors/base/reasoningEffort.ts) so a client already setting
 * reasoning_effort for other providers gets the same signal here.
 *
 * Before this, `transformToClaude` hardcoded `thinking_mode: "off"` —
 * Claude Web could never be asked for extended thinking, and any
 * `thinking_delta` reasoning the upstream might otherwise emit was moot
 * because it was never requested in the first place (#6662).
 */
export function wantsExtendedThinking(body) {
    return resolveClaudeWebReasoningEffort(body) !== null;
}
const CLAUDE_WEB_REASONING_EFFORTS = ["low", "medium", "high", "xhigh", "max"];
const CLAUDE_WEB_OPUS_5_MODEL = "claude-opus-5";
/**
 * Resolve the caller's explicit reasoning level into the effort values
 * accepted by Claude Web. An explicit `none` disables thinking, while a
 * native `thinking: { type: "enabled" }` request uses the existing low
 * default when no graduated effort was supplied.
 */
export function resolveClaudeWebReasoningEffort(body) {
    const reasoning = body.reasoning && typeof body.reasoning === "object" && !Array.isArray(body.reasoning)
        ? body.reasoning
        : null;
    const effort = body.reasoning_effort ?? reasoning?.effort;
    if (typeof effort === "string" && effort.trim()) {
        const normalized = effort.trim().toLowerCase();
        if (normalized === "none")
            return null;
        if (CLAUDE_WEB_REASONING_EFFORTS.includes(normalized)) {
            return normalized;
        }
    }
    const thinking = body.thinking;
    if (thinking && typeof thinking === "object" && !Array.isArray(thinking)) {
        if (thinking.type === "enabled")
            return "low";
    }
    return null;
}
function contentPartText(part) {
    if (!isRecord(part))
        return "";
    return typeof part.text === "string" ? part.text : "";
}
function messageText(content) {
    if (typeof content === "string")
        return content;
    if (!Array.isArray(content))
        return "";
    return content.map(contentPartText).filter(Boolean).join("\n");
}
function buildPromptFromMessages(messages) {
    const parts = [];
    for (const candidate of messages) {
        if (!isRecord(candidate))
            continue;
        const role = candidate.role;
        const text = messageText(candidate.content);
        if (!text)
            continue;
        if (role === "user" || role === "tool") {
            parts.push(text);
        }
    }
    return parts.join("\n\n");
}
function latestUserPrompt(messages) {
    let prompt = "";
    for (const candidate of messages) {
        if (!isRecord(candidate) || candidate.role !== "user")
            continue;
        prompt = messageText(candidate.content);
    }
    return prompt;
}
function defaultTurn(prompt) {
    const messageUuids = generateMessageUUIDs();
    return {
        operation: "completion",
        prompt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        locale: "en-US",
        humanMessageUuid: messageUuids.human_message_uuid,
        assistantMessageUuid: messageUuids.assistant_message_uuid,
        isNewConversation: true,
    };
}
function createConversationParams(model) {
    return {
        name: "",
        model,
        include_conversation_preferences: true,
        paprika_mode: null,
        compass_mode: null,
        is_temporary: false,
        enabled_imagine: true,
        tool_search_mode: "auto",
    };
}
function resolveClaudeWebThinkingMode(model, reasoningEffort) {
    if (model.trim().toLowerCase() === CLAUDE_WEB_OPUS_5_MODEL) {
        return { effort: reasoningEffort ?? "high", thinkingMode: "auto" };
    }
    if (reasoningEffort) {
        return { effort: reasoningEffort, thinkingMode: "extended" };
    }
    return { effort: "low", thinkingMode: "off" };
}
function buildClaudeWebPayload(body, model, reasoningEffort, turn) {
    const thinking = resolveClaudeWebThinkingMode(model, reasoningEffort);
    return {
        prompt: turn.prompt,
        model,
        timezone: turn.timezone,
        personalized_styles: getDefaultPersonalizedStyle(),
        locale: turn.locale,
        tools: transformOpenAiTools(body.tools),
        turn_message_uuids: {
            ...(turn.humanMessageUuid ? { human_message_uuid: turn.humanMessageUuid } : {}),
            assistant_message_uuid: turn.assistantMessageUuid,
        },
        ...(turn.parentMessageUuid ? { parent_message_uuid: turn.parentMessageUuid } : {}),
        attachments: extractClaudeWebAttachments(Array.isArray(body.messages) ? body.messages : []),
        effort: thinking.effort,
        files: [],
        sync_sources: [],
        rendering_mode: "messages",
        thinking_mode: thinking.thinkingMode,
        ...(turn.toolStates ? { tool_states: turn.toolStates } : {}),
        ...(turn.isNewConversation
            ? { create_conversation_params: createConversationParams(model) }
            : {}),
    };
}
/**
 * Transform OpenAI format to Claude Web format
 */
export function transformToClaude(body, model, turn) {
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const reasoningEffort = resolveClaudeWebReasoningEffort(body);
    const resolvedModel = model || DEFAULT_CLAUDE_MODEL;
    const prompt = turn?.prompt ?? (buildPromptFromMessages(messages) || latestUserPrompt(messages));
    const resolvedTurn = turn ?? defaultTurn(prompt);
    if (resolvedTurn.operation === "completion" && !resolvedTurn.prompt.trim()) {
        throw new Error("No user message found in request");
    }
    return buildClaudeWebPayload(body, resolvedModel, reasoningEffort, resolvedTurn);
}
/**
 * Transform Claude Web response to OpenAI format.
 *
 * `kind` selects which delta field carries `claudeContent`: `"content"`
 * (default, preserves the original call sites) or `"reasoning"` — the
 * latter maps Claude's `thinking_delta` text onto `delta.reasoning_content`,
 * the same field the real-Anthropic-API translator uses
 * (open-sse/translator/response/claude-to-openai.ts) so downstream clients
 * (Claude Code, Cursor, etc.) render it as the thinking panel instead of
 * silently dropping it (#6662).
 */
export function transformFromClaude(claudeContent, model, stopReason, kind = "content") {
    const delta = kind === "reasoning" ? { reasoning_content: claudeContent } : { content: claudeContent };
    return {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
            {
                index: 0,
                delta,
                finish_reason: stopReason === "end_turn" ? "stop" : null,
                logprobs: null,
            },
        ],
    };
}
