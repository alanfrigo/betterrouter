import { fetchPublic } from "../../src/shared/utils/ssrfGuard.js";
import { sanitizeErrorMessage, buildErrorBody } from "../utils/mediaProtocolErrors.js";
import { NIMBLE_CLIENT_SOURCE, NIMBLE_CLIENT_SOURCE_HEADER } from "../config/nimble.js";
const NIMBLE_EXTRACT_URL = "https://sdk.nimbleway.com/v1/extract";
const NIMBLE_TIMEOUT_MS = 30000;
const META_MAX_CHARS = 500;
const TITLE_RE = /<title[^>]{0,200}>([^<]*)<\/title>/i;
const META_DESCRIPTION_DOUBLE_RE = /<meta[^>]{0,200}name=["']description["'][^>]{0,200}content="([^"]*)"/i;
const META_DESCRIPTION_SINGLE_RE = /<meta[^>]{0,200}name=["']description["'][^>]{0,200}content='([^']*)'/i;
function mapFormat(format) {
  switch (format) {
    case "html":
      return "html";
    case "links":
      return "links";
    case "screenshot":
      return "screenshot";
    case "markdown":
    default:
      return "markdown";
  }
}
function readString(source, key) {
  const value = source[key];
  return value != null ? String(value) : "";
}
function parseHtmlMetadata(html) {
  if (!html)
    return { title: null, description: null };
  const title = TITLE_RE.exec(html)?.[1]?.trim().slice(0, META_MAX_CHARS);
  const rawDescription = META_DESCRIPTION_DOUBLE_RE.exec(html)?.[1] ?? META_DESCRIPTION_SINGLE_RE.exec(html)?.[1];
  const description = rawDescription?.trim().slice(0, META_MAX_CHARS);
  return {
    title: title ? title : null,
    description: description ? description : null
  };
}
export async function nimbleFetch(opts) {
  const { url, format, includeMetadata, credentials } = opts;
  if (!credentials.apiKey) {
    const body = buildErrorBody(401, "Nimble API key required");
    return { success: false, status: 401, error: body.error.message };
  }
  const requested = mapFormat(format);
  const formats = [...new Set([requested, "links", ...includeMetadata ? ["html"] : []])];
  const requestBody = {
    url,
    formats,
    render: "auto"
  };
  const controller = new AbortController;
  const timeoutId = setTimeout(() => {
    const err = new Error(`nimble-fetch timeout after ${NIMBLE_TIMEOUT_MS}ms`);
    err.name = "TimeoutError";
    controller.abort(err);
  }, NIMBLE_TIMEOUT_MS);
  try {
    const response = await fetchPublic(NIMBLE_EXTRACT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credentials.apiKey}`,
        [NIMBLE_CLIENT_SOURCE_HEADER]: NIMBLE_CLIENT_SOURCE
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    if (!response.ok) {
      const rawError = await response.text().catch(() => `HTTP ${response.status}`);
      const msg = sanitizeErrorMessage(`Nimble error ${response.status}: ${rawError}`);
      const body = buildErrorBody(response.status, msg);
      return { success: false, status: response.status, error: body.error.message };
    }
    const payload = await response.json();
    const taskStatus = typeof payload.status === "string" ? payload.status : "";
    const taskStatusCode = typeof payload.status_code === "number" ? payload.status_code : null;
    if (taskStatus && taskStatus !== "success" || taskStatusCode !== null && taskStatusCode >= 400) {
      const detail = taskStatus || `status ${taskStatusCode}`;
      const msg = sanitizeErrorMessage(`Nimble extraction did not succeed: ${detail}`);
      const body = buildErrorBody(502, msg);
      return { success: false, status: 502, error: body.error.message };
    }
    const data = payload.data ?? {};
    const rawLinks = data.links;
    const links = Array.isArray(rawLinks) ? rawLinks.map((l) => String(l)) : [];
    const screenshot = readString(data, "screenshot");
    const screenshotUrl = format === "screenshot" && screenshot ? screenshot.startsWith("data:") ? screenshot : `data:image/png;base64,${screenshot}` : null;
    if (!(requested in data)) {
      const msg = sanitizeErrorMessage(`Nimble returned no ${requested} content for the request`);
      const body = buildErrorBody(502, msg);
      return { success: false, status: 502, error: body.error.message };
    }
    let content;
    switch (format) {
      case "html":
        content = readString(data, "html");
        break;
      case "links":
        content = JSON.stringify(links);
        break;
      case "screenshot":
        content = "";
        break;
      case "markdown":
      default:
        content = readString(data, "markdown");
        break;
    }
    const metadata = includeMetadata ? parseHtmlMetadata(readString(data, "html")) : null;
    return {
      success: true,
      data: {
        provider: "nimble-search",
        url,
        content,
        links,
        metadata,
        screenshot_url: screenshotUrl
      }
    };
  } catch (err) {
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      const body = buildErrorBody(504, "Nimble request timed out");
      return { success: false, status: 504, error: body.error.message };
    }
    const msg = err instanceof Error ? sanitizeErrorMessage(err.message) : sanitizeErrorMessage(String(err));
    const body = buildErrorBody(502, msg);
    return { success: false, status: 502, error: body.error.message };
  } finally {
    clearTimeout(timeoutId);
  }
}
