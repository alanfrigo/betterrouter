import { fetchPublic } from "../../src/shared/utils/ssrfGuard.js";
import { sanitizeErrorMessage, buildErrorBody } from "../utils/mediaProtocolErrors.js";
const ANYSEARCH_EXTRACT_URL = "https://api.anysearch.com/v1/extract";
const ANYSEARCH_TIMEOUT_MS = 30000;
export async function anysearchFetch(opts) {
  const { url, includeMetadata, credentials } = opts;
  const controller = new AbortController;
  const timeoutId = setTimeout(() => {
    const err = new Error(`anysearch-fetch timeout after ${ANYSEARCH_TIMEOUT_MS}ms`);
    err.name = "TimeoutError";
    controller.abort(err);
  }, ANYSEARCH_TIMEOUT_MS);
  try {
    const response = await fetchPublic(ANYSEARCH_EXTRACT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...credentials.apiKey ? { Authorization: `Bearer ${credentials.apiKey}` } : {}
      },
      body: JSON.stringify({ url }),
      signal: controller.signal
    });
    if (!response.ok) {
      const rawError = await response.text().catch(() => `HTTP ${response.status}`);
      const msg = sanitizeErrorMessage(`AnySearch error ${response.status}: ${rawError}`);
      const body = buildErrorBody(response.status, msg);
      return { success: false, status: response.status, error: body.error.message };
    }
    const data = await response.json();
    const envelope = data.data && typeof data.data === "object" && !Array.isArray(data.data) ? data.data : data;
    const code = typeof data.code === "number" ? data.code : 0;
    if (code !== 0) {
      const errorMsg = String(data.error_code ?? data.message ?? code);
      const isQuota = /quota|exceed|limit|balance|credit|exhaust/i.test(errorMsg);
      const status = isQuota ? 402 : 422;
      const msg = sanitizeErrorMessage(`AnySearch extract failed: ${errorMsg}`);
      const body = buildErrorBody(status, msg);
      return { success: false, status, error: body.error.message };
    }
    const content = String(envelope.content ?? "");
    const title = envelope.title != null ? String(envelope.title) : null;
    const metadata = includeMetadata ? { title, description: null } : null;
    return {
      success: true,
      data: {
        provider: "anysearch-search",
        url,
        content,
        links: [],
        metadata,
        screenshot_url: null
      }
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      const body = buildErrorBody(504, "AnySearch request timed out");
      return { success: false, status: 504, error: body.error.message };
    }
    const msg = err instanceof Error ? sanitizeErrorMessage(err.message) : sanitizeErrorMessage(String(err));
    const body = buildErrorBody(502, msg);
    return { success: false, status: 502, error: body.error.message };
  } finally {
    clearTimeout(timeoutId);
  }
}
