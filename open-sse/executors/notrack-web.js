import { webCookieFetch } from "../utils/webCookieProxy.js";
/**
 * NotrackWebExecutor — notrack.ai cookie-auth Web Provider
 *
 * Routes chat requests through notrack.ai's `/api/dispatch` endpoint using the
 * user's logged-in browser session cookies (uid, si_usr_id, si_ses_id).
 *
 * API flow (verified against the upstream Python reference at /var/folders/.../notrack_main.py):
 *   1. POST /api/dispatch with formatted user_input → SSE stream
 *
 * Streaming format (SSE, `data: {json}` lines):
 *   - { type: "chat_meta",   chat_id }                    -- session id
 *   - { type: "user",        message_id }                -- user-message id
 *   - { type: "thinking" }                                -- reasoning tick
 *   - { type: "delta",       chunk: "..." }              -- content delta
 *   - { type: "message",      content: "...", turn: N }  -- full-snapshot fallback
 *
 * References (endpoint/payload shape lifted from the Python proxy):
 *   - /var/folders/.../notrack_main.py                    — endpoint, body shape, SSE event taxonomy
 */
import { BaseExecutor, mergeAbortSignals } from "./webCookieBase.js";
import { FETCH_TIMEOUT_MS } from "../config/webCookieConstants.js";
import { sanitizeErrorMessage } from "../utils/webCookieError.js";
import { estimateTokens } from "./notrack-web/cjk.js";
import { NOTRACK_DISPATCH_URL } from "./notrack-web/constants.js";
import { buildNotrackCookie, isEncryptedCredentialBlob, resolveNotrackCookieSource, } from "./notrack-web/cookie.js";
import { buildDispatchPayload, buildNotrackUserInput, buildUpstreamHeaders, mapUpstreamHttpError, notrackErrorResponse, resolvedModel, } from "./notrack-web/request.js";
import { collectNotrackResponse, transformNotrackStream } from "./notrack-web/stream.js";
import { extractJsonObject, parseToolCallBlocks } from "./notrack-web/tools.js";
export class NotrackWebExecutor extends BaseExecutor {
    constructor() {
        super("notrack-web", { id: "notrack-web", baseUrl: NOTRACK_DISPATCH_URL });
    }
    async execute(input) {
        const prepared = this.prepare(input);
        if ("error" in prepared)
            return prepared.error;
        const fetched = await this.dispatch(input, prepared);
        if ("error" in fetched)
            return fetched.error;
        return this.complete(input, prepared, fetched.response);
    }
    prepare(input) {
        const bodyObj = (input.body || {});
        const messages = bodyObj.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
            return { error: notrackErrorResponse(400, "Missing or empty messages array") };
        }
        const cookie = this.resolveCookie(input.credentials);
        if ("error" in cookie)
            return cookie;
        const { userInput, useTools } = buildNotrackUserInput(messages, bodyObj);
        if (!userInput.trim()) {
            return { error: notrackErrorResponse(400, "Empty prompt after processing messages") };
        }
        const dispatchPayload = buildDispatchPayload(userInput, bodyObj);
        return {
            cookie: cookie.cookie,
            userInput,
            useTools,
            dispatchPayload,
            headers: buildUpstreamHeaders(cookie.cookie, input.upstreamExtraHeaders),
        };
    }
    resolveCookie(credentials) {
        const rawCookieSource = resolveNotrackCookieSource(credentials);
        if (isEncryptedCredentialBlob(rawCookieSource)) {
            return {
                error: notrackErrorResponse(401, "Notrack credentials are encrypted but STORAGE_ENCRYPTION_KEY is not loaded. " +
                    "Restore the encryption key or re-save the Notrack cookie."),
            };
        }
        const { cookie, hasSession } = buildNotrackCookie(rawCookieSource);
        if (!hasSession) {
            return {
                error: notrackErrorResponse(401, "Notrack requires a session cookie. Log in to notrack.ai, open " +
                    "DevTools → Network → any /api request → Request Headers → Cookie, " +
                    "and paste the full Cookie header (it must contain uid, si_usr_id, and si_ses_id)."),
            };
        }
        return { cookie };
    }
    async dispatch(input, prepared) {
        const timeoutSignal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
        const combinedSignal = input.signal
            ? mergeAbortSignals(input.signal, timeoutSignal)
            : timeoutSignal;
        try {
            const upstreamResponse = await webCookieFetch(NOTRACK_DISPATCH_URL, {
                method: "POST",
                headers: prepared.headers,
                body: JSON.stringify(prepared.dispatchPayload),
                signal: combinedSignal,
            });
            if (!upstreamResponse.ok) {
                const text = await upstreamResponse.text().catch(() => "");
                return { error: mapUpstreamHttpError(upstreamResponse.status, text) };
            }
            if (!upstreamResponse.body) {
                return { error: notrackErrorResponse(502, "Notrack returned empty response body") };
            }
            return { response: upstreamResponse };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            input.log?.error?.("NOTRACK-WEB", `Fetch failed: ${message}`);
            const status = err instanceof Error && err.name === "TimeoutError" ? 504 : 502;
            return {
                error: notrackErrorResponse(status, `Notrack connection failed: ${sanitizeErrorMessage(message)}`),
            };
        }
    }
    complete(input, prepared, upstreamResponse) {
        const bodyObj = (input.body || {});
        const id = `chatcmpl-notrack-${crypto.randomUUID().slice(0, 12)}`;
        const created = Math.floor(Date.now() / 1000);
        const modelOut = resolvedModel(input.model);
        if (input.stream) {
            return this.streamResult(input, prepared, upstreamResponse, id, created, modelOut, bodyObj);
        }
        return this.collectResult(input, prepared, upstreamResponse, id, created, modelOut, bodyObj);
    }
    streamResult(input, prepared, upstreamResponse, id, created, modelOut, bodyObj) {
        const streamOptions = bodyObj.stream_options && typeof bodyObj.stream_options === "object"
            ? bodyObj.stream_options
            : null;
        return {
            response: new Response(transformNotrackStream(upstreamResponse.body, modelOut, id, created, prepared.userInput, streamOptions?.include_usage === true, input.signal, input.log), {
                status: 200,
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "X-Accel-Buffering": "no",
                },
            }),
            url: NOTRACK_DISPATCH_URL,
            headers: prepared.headers,
            transformedBody: prepared.dispatchPayload,
        };
    }
    async collectResult(input, prepared, upstreamResponse, id, created, modelOut, bodyObj) {
        const collected = await collectNotrackResponse(upstreamResponse.body, input.signal, input.log);
        const shaped = shapeNonStreamContent(collected.content, prepared.useTools, id, bodyObj);
        return {
            response: new Response(JSON.stringify(buildNonStreamBody(id, created, modelOut, shaped, prepared.userInput, collected)), { status: 200, headers: { "Content-Type": "application/json" } }),
            url: NOTRACK_DISPATCH_URL,
            headers: prepared.headers,
            transformedBody: prepared.dispatchPayload,
        };
    }
}
function shapeNonStreamContent(content, useTools, id, bodyObj) {
    let finalContent = content;
    let parsedToolCalls = null;
    let finishReason = "stop";
    if (useTools) {
        const parsed = parseToolCallBlocks(finalContent, `call-${id.slice(-8)}`);
        finalContent = parsed.content;
        parsedToolCalls = parsed.toolCalls;
        if (parsedToolCalls && parsedToolCalls.length > 0)
            finishReason = "tool_calls";
    }
    finalContent = applyResponseFormat(finalContent, bodyObj.response_format);
    return { finalContent, parsedToolCalls, finishReason };
}
function applyResponseFormat(content, responseFormat) {
    if (!responseFormat || typeof responseFormat !== "object")
        return content;
    const type = responseFormat.type;
    if (type !== "json_object" && type !== "json_schema")
        return content;
    const extracted = extractJsonObject(content);
    if (extracted === null)
        return content;
    try {
        return JSON.stringify(extracted);
    }
    catch {
        return content;
    }
}
function buildNonStreamBody(id, created, modelOut, shaped, userInput, collected) {
    const completionTokens = estimateTokens(shaped.finalContent);
    const promptTokens = estimateTokens(userInput);
    const messagePayload = { role: "assistant", refusal: null };
    if (shaped.parsedToolCalls && shaped.parsedToolCalls.length > 0) {
        messagePayload.content = shaped.finalContent || null;
        messagePayload.tool_calls = shaped.parsedToolCalls;
    }
    else {
        messagePayload.content = shaped.finalContent;
    }
    return {
        id,
        object: "chat.completion",
        created,
        model: modelOut,
        system_fingerprint: "fp_notrack",
        choices: [
            { index: 0, message: messagePayload, logprobs: null, finish_reason: shaped.finishReason },
        ],
        usage: {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: promptTokens + completionTokens,
        },
        notrack: {
            chat_id: collected.chatMeta,
            user_message_id: collected.userMsgId,
            assistant_turn: collected.assistantTurn,
        },
    };
}
