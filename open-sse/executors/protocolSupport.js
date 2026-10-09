import { assertPublicUrlResolved } from "../../src/shared/utils/ssrfGuard.js";

export { BaseExecutor } from "./base.js";
export { buildErrorBody, errorResponse } from "../utils/error.js";

// Bound client-visible errors; redact credentials and local filesystem paths.
export function sanitizeErrorMessage(value) {
  return String(value ?? "").split(/\r?\n/)[0]
    .replace(/\b(Bearer|token|api[_-]?key|password|secret)\s*[:=]?\s+[\w.+/=-]+/gi, "$1 [REDACTED]")
    .replace(/\b(?:sk|ghp|gho|glpat)-[\w-]+/g, "[REDACTED]")
    .replace(/(?:\/home\/|\/Users\/|[A-Z]:\\)[^\s"']+/gi, "[PATH]").slice(0, 1000);
}

export function mergeUpstreamExtraHeaders(headers, extra) {
  if (extra) Object.assign(headers, extra);
  return headers;
}

export function mergeAbortSignals(...signals) {
  return AbortSignal.any(signals.filter(Boolean));
}

export function shouldUseShellForCommand(command) {
  return process.platform === "win32" && /\.(cmd|bat)$/i.test(command);
}

export async function publicProtocolFetch(url, options = {}) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error("Provider requires HTTPS URL without embedded credentials");
  await assertPublicUrlResolved(url);
  return fetch(url, { ...options, redirect: "error" });
}
