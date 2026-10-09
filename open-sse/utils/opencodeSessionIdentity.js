/** Explicit conversation identity, before the existing fingerprint fallback. */
const HEADER_NAMES = [
    "x-opencode-session",
    "x-session-affinity",
    "x-session-id",
    "x-claude-code-session-id",
    "session_id",
    "session-id",
    "x-session_id",
    "thread_id",
    "thread-id",
    "x-thread-id",
];
const BODY_NAMES = [
    "session_id",
    "sessionId",
    "thread_id",
    "threadId",
    "conversation_id",
    "conversationId",
];
function record(value) {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : undefined;
}
function identity(value) {
    if (typeof value !== "string" || value.length > 256 || /[\u0000-\u001f\u007f]/.test(value))
        return undefined;
    return value.trim() || undefined;
}
function bodyIdentity(value) {
    const input = record(value);
    if (!input)
        return undefined;
    for (const key of BODY_NAMES) {
        const id = identity(input[key]);
        if (id)
            return id;
    }
    return undefined;
}
function claudeIdentity(value) {
    if (typeof value !== "string" || value.length > 4096)
        return undefined;
    try {
        return bodyIdentity(JSON.parse(value));
    }
    catch {
        return undefined;
    }
}
/** Headers win over metadata; an opaque user/account ID is never a session ID. */
export function resolveOpencodeSessionIdentity(headers, body) {
    const normalized = new Map(Object.entries(headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
    for (const name of HEADER_NAMES) {
        const id = identity(normalized.get(name));
        if (id)
            return id;
    }
    const input = record(body);
    const metadata = record(input?.metadata);
    return bodyIdentity(metadata) || claudeIdentity(metadata?.user_id) || bodyIdentity(input);
}
export function preserveOpencodeSessionIdentity(headers, request) {
    if (request?.provider !== "opencode" && request?.provider !== "opencode-go")
        return;
    const sessionId = resolveOpencodeSessionIdentity(headers, request.body);
    if (sessionId)
        headers["x-opencode-session"] = sessionId;
}
/** Keep only fingerprint/identity inputs; never add this projection to an upstream body. */
export function projectOpencodeSessionBody(body) {
    const input = record(body);
    if (!input)
        return undefined;
    return {
        model: typeof input.model === "string" ? input.model : undefined,
        system: input.system,
        messages: Array.isArray(input.messages) ? input.messages : undefined,
        input: Array.isArray(input.input) ? input.input : undefined,
        tools: Array.isArray(input.tools) ? input.tools : undefined,
        metadata: input.metadata,
        session_id: input.session_id,
        thread_id: input.thread_id,
    };
}
