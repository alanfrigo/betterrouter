import { errorResponse } from "./error.js";
import { sanitizeErrorMessage } from "./errorSanitization.js";
export { buildErrorBody, errorResponse } from "./error.js";
export { sanitizeErrorMessage } from "./errorSanitization.js";

export function makeExecutorErrorResult(status, message, body, url, extraResponseHeaders) {
  return { response: errorResponse(status, sanitizeErrorMessage(message), extraResponseHeaders), url, headers: {}, transformedBody: body };
}
export function normalizeCookie(raw) {
  return String(raw || "").replace(/^cookie:\s*/i, "").trim();
}
