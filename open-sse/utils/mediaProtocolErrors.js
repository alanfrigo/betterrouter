import { buildErrorBody as buildCurrentErrorBody } from "./error.js";
import { sanitizeErrorMessage } from "./errorSanitization.js";
export { sanitizeErrorMessage };
export { errorResponse } from "./error.js";
export { sanitizeUpstreamDetails } from "./errorSanitization.js";

export function buildErrorBody(status, message) {
  return buildCurrentErrorBody(status, sanitizeErrorMessage(message));
}

export function makeExecutorErrorResult(status, message, body, url, extraResponseHeaders = {}) {
  return {
    response: new Response(JSON.stringify(buildErrorBody(status, message)), {
      status,
      headers: { "Content-Type": "application/json", ...extraResponseHeaders },
    }),
    url,
    headers: {},
    transformedBody: body,
  };
}
