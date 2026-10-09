import { CORS_HEADERS } from "./cors.js";
import { errorResponse } from "./error.js";
import { sanitizeErrorMessage } from "./errorSanitization.js";
function extractUpstreamErrorMessage(parsed) {
  const detail = parsed?.detail;
  const candidates = [
    parsed?.err_msg,
    parsed?.error?.message,
    typeof parsed?.error === "string" ? parsed.error : null,
    parsed?.message,
    typeof detail === "string" ? detail : detail?.message
  ];
  const raw = candidates.find(Boolean);
  return raw ? String(raw) : null;
}
export function upstreamErrorResponse(res, errText) {
  const status = res.status;
  const fallbackMessage = `Upstream error (${status})`;
  const text = errText ?? "";
  let upstreamMessage = null;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      upstreamMessage = extractUpstreamErrorMessage(parsed);
    }
  } catch {
    upstreamMessage = null;
  }
  const safeMessage = upstreamMessage ? sanitizeErrorMessage(upstreamMessage) : "";
  const response = errorResponse(status, safeMessage || fallbackMessage);
  for (const [header, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(header, value);
  }
  return response;
}
export function audioStreamResponse(res, defaultContentType = "audio/mpeg") {
  const contentType = res.headers.get("content-type") || defaultContentType;
  return new Response(res.body, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": contentType,
      "Transfer-Encoding": "chunked"
    }
  });
}
