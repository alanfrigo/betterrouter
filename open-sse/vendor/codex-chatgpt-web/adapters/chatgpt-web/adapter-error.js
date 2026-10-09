export class ChatGptWebAdapterError extends Error {
    status;
    errorType;
    code;
    retryable;
    constructor(message, options) {
        super(message);
        this.name = "ChatGptWebAdapterError";
        this.status = options.status;
        this.errorType = options.errorType;
        this.code = options.code;
        this.retryable = options.retryable;
    }
}
export function chatGptBrowserTabClosedError() {
    return new ChatGptWebAdapterError("The ChatGPT browser tab was closed, so the Codex turn was cancelled.", {
        status: 499,
        errorType: "client_closed_request",
        code: "client_cancelled",
        retryable: false,
    });
}
export function chatGptStoppedThinkingError() {
    return new ChatGptWebAdapterError("ChatGPT remained in 'Stopped thinking' for 5 seconds, so the Codex turn was cancelled.", {
        status: 499,
        errorType: "client_closed_request",
        code: "client_cancelled",
        retryable: false,
    });
}
export function chatGptRetainedConversationUnavailableError() {
    return new ChatGptWebAdapterError("The retained ChatGPT conversation is no longer available.", {
        status: 409,
        errorType: "invalid_request_error",
        code: "compaction_source_unavailable",
        retryable: false,
    });
}
