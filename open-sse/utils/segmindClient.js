import { fetchPublic } from "../../src/shared/utils/ssrfGuard.js";

import { sanitizeErrorMessage } from "./errorSanitization.js";
export function isSegmindFailure(result) {
  return !result.ok;
}
async function logSegmindFailure(opts, status, errorText) {
  if (opts.log) {
    opts.log.error(opts.scope, `${opts.provider} error ${status}: ${errorText.slice(0, 200)}`);
  }
  return {
    ok: false,
    status,
    error: sanitizeErrorMessage(errorText) || `Segmind request failed (${status})`
  };
}
export async function segmindRequest(opts) {
  try {
    const response = await fetchPublic(`${opts.baseUrl.replace(/\/$/, "")}/${opts.model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": opts.token },
      body: JSON.stringify(opts.upstreamBody)
    });
    if (!response.ok) {
      const errorText = await response.text();
      return logSegmindFailure(opts, response.status, errorText);
    }
    const contentType = response.headers.get("content-type") || "";
    const buffer = Buffer.from(await response.arrayBuffer());
    return { ok: true, buffer, contentType };
  } catch (err) {
    const message = err?.message ?? String(err);
    if (opts.log)
      opts.log.error(opts.scope, `${opts.provider} fetch error: ${message}`);
    return {
      ok: false,
      status: 502,
      error: `${opts.scope === "IMAGE" ? "Image" : "Video"} provider error: ${sanitizeErrorMessage(message)}`
    };
  }
}
