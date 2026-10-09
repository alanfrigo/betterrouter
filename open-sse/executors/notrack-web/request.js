import { mergeUpstreamExtraHeaders } from "../webCookieBase.js";
import { buildErrorBody, sanitizeErrorMessage } from "../../utils/webCookieError.js";
import { NOTRACK_BASE, NOTRACK_DISPATCH_URL, NOTRACK_USER_AGENT } from "./constants.js";
import { messagesToInput, messagesToInputWithTools } from "./messages.js";
import { buildSamplingPrefix } from "./sampling.js";
import { buildToolSystemPrompt } from "./tools.js";
export function notrackErrorResponse(status, message, details) {
    return {
        response: new Response(JSON.stringify(buildErrorBody(status, message, details)), {
            status,
            headers: { "Content-Type": "application/json" },
        }),
        url: NOTRACK_DISPATCH_URL,
        headers: {},
        transformedBody: undefined,
    };
}
export function buildNotrackUserInput(messages, bodyObj) {
    const toolsRaw = Array.isArray(bodyObj.tools) ? bodyObj.tools : [];
    const toolChoice = bodyObj.tool_choice;
    const useTools = toolsRaw.length > 0 && toolChoice !== "none";
    const toolSystemPrompt = useTools ? buildToolSystemPrompt(toolsRaw, toolChoice) : "";
    const baseInput = useTools
        ? messagesToInputWithTools(messages, toolSystemPrompt)
        : messagesToInput(messages);
    return { userInput: `${buildSamplingPrefix(bodyObj)}${baseInput}`, useTools };
}
export function buildDispatchPayload(userInput, bodyObj) {
    return {
        user_input: userInput,
        mode: typeof bodyObj.notrack_mode === "string" ? bodyObj.notrack_mode : "usual",
        model: "C",
        persona: "normal",
        max_turns: typeof bodyObj.notrack_max_turns === "number" && Number.isFinite(bodyObj.notrack_max_turns)
            ? bodyObj.notrack_max_turns
            : 6,
        chat_id: typeof bodyObj.notrack_chat_id === "string" && bodyObj.notrack_chat_id
            ? bodyObj.notrack_chat_id
            : null,
        attachments: Array.isArray(bodyObj.notrack_attachments) ? bodyObj.notrack_attachments : [],
        regenerate: bodyObj.notrack_regenerate === true,
        edit: false,
        edit_mid: null,
    };
}
export function buildUpstreamHeaders(cookie, upstreamExtraHeaders) {
    const baseHeaders = {
        "content-type": "application/json",
        accept: "*/*",
        "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        origin: NOTRACK_BASE,
        referer: `${NOTRACK_BASE}/zh-CN/chat`,
        "user-agent": NOTRACK_USER_AGENT,
        cookie,
    };
    mergeUpstreamExtraHeaders(baseHeaders, upstreamExtraHeaders);
    return baseHeaders;
}
export function mapUpstreamHttpError(upstreamStatus, text) {
    const status = upstreamStatus >= 500 ? 502 : upstreamStatus;
    let message = `Notrack returned HTTP ${upstreamStatus}`;
    if (upstreamStatus === 401 || upstreamStatus === 403) {
        message =
            "Notrack auth failed — your uid/si_usr_id/si_ses_id cookies may be missing or expired. " +
                "Log in to notrack.ai and re-paste your Cookie header.";
    }
    else if (upstreamStatus === 429) {
        message = "Notrack rate limited. Wait a moment and retry.";
    }
    else if (upstreamStatus >= 500) {
        message = "Notrack upstream is currently unavailable. Try again in a moment.";
    }
    if (text) {
        const sanitized = sanitizeErrorMessage(text);
        if (sanitized)
            message = `${message}: ${sanitized}`;
    }
    return notrackErrorResponse(status, message, { body: text.slice(0, 500) });
}
/** Resolve the model id we echo back in the OpenAI response (canonicalize aliases). */
export function resolvedModel(model) {
    if (!model)
        return "notrack-c";
    const lower = model.toLowerCase();
    if (lower === "ntw" || lower === "notrack" || lower === "c" || lower === "notrack-c") {
        return "notrack-c";
    }
    return model;
}
