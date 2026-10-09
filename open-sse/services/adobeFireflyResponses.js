import { browserHeaders } from "./adobeFireflyArp.js";
import { DEFAULT_USER_AGENT, FIREFLY_REFERER } from "./adobeFireflyCatalog.js";
import {
  adobeFireflyApiKey,
  adobeFireflyBalanceApiKey,
  extractAdobeAccountIdFromToken
} from "./adobeFireflyCredentials.js";
export function isAdobeTransientSubmitError(status, bodyText) {
  if (status === 408 || status === 429 || status === 502 || status === 503 || status === 504) {
    return true;
  }
  const t = (bodyText || "").toLowerCase();
  return t.includes("timeout_error") || t.includes("system under load") || t.includes("try again") || t.includes("temporarily") || t.includes("overloaded");
}
export function buildAdobePollHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    accept: "*/*",
    "cache-control": "no-cache",
    pragma: "no-cache",
    "user-agent": DEFAULT_USER_AGENT,
    referer: FIREFLY_REFERER
  };
}
export function buildAdobeBalanceHeaders(accessToken) {
  const accountId = extractAdobeAccountIdFromToken(accessToken);
  const headers = {
    ...browserHeaders(),
    Authorization: `Bearer ${accessToken}`,
    accept: "application/json",
    "content-type": "application/json",
    "x-api-key": adobeFireflyBalanceApiKey()
  };
  if (accountId)
    headers["x-account-id"] = accountId;
  return headers;
}
export function buildAdobeDiscoveryHeaders(accessToken) {
  return {
    ...browserHeaders(),
    Authorization: `Bearer ${accessToken}`,
    "x-api-key": adobeFireflyApiKey(),
    "content-type": "application/json",
    accept: "*/*"
  };
}
export function formatAdobeSystemUnderLoadError(kind, attempts, opts) {
  const hadArp = opts?.hadBrowserArp === true;
  if (!hadArp) {
    return `Adobe Firefly ${kind} generation failed (HTTP 408 "system under load", after ${attempts} attempt` + `${attempts === 1 ? "" : "s"}). Your credential is missing a browser x-arp-session-id / sherlockToken ` + `(JWT alone almost always 408s even when credits/Limits work). Re-open the Adobe Firefly account and paste ` + `TWO lines from a SUCCESSFUL firefly-3p.ff.adobe.io generate-async request (F12 → Network): ` + `(1) Authorization token AFTER "Bearer " (eyJ… JWT), (2) the raw x-arp-session-id header value ` + `OR Cookie containing sherlockToken. Use the multi-line credential box so both lines are kept.`;
  }
  return `Adobe Firefly ${kind} generation failed (HTTP 408 "system under load", after ${attempts} attempt` + `${attempts === 1 ? "" : "s"}). JWT was accepted for balance/discovery but colligo rejected the risk session ` + `(Forter/Arkose stale or rate-limited). The app spaces submits, sticks to the last working x-arp-session-id, ` + `and on 408 auto-warms Forter/ARP via off-screen Chrome CDP (true headless is rejected by colligo — set ADOBE_FIREFLY_CHROME_HEADLESS=1 only for debug). ` + `Paste the full firefly.adobe.com Cookie once with the JWT so recovery can run. If it still fails after that, ` + `open firefly.adobe.com, generate one image in-browser, then paste a FRESH multi-line credential (JWT + Cookie) once.`;
}
export function extractAdobeResultLink(headers, body) {
  const get = (name) => {
    if (typeof headers.get === "function") {
      return String(headers.get(name) || "").trim();
    }
    const rec = headers;
    const key = Object.keys(rec).find((k) => k.toLowerCase() === name.toLowerCase());
    return String((key ? rec[key] : "") || "").trim();
  };
  const override = get("x-override-status-link");
  if (override)
    return override;
  const data = body && typeof body === "object" ? body : {};
  const links = data.links && typeof data.links === "object" ? data.links : {};
  const result = links.result;
  if (typeof result === "string" && result)
    return result;
  if (result && typeof result === "object") {
    const href = result.href;
    if (typeof href === "string" && href)
      return href;
  }
  if (typeof data.statusUrl === "string" && data.statusUrl)
    return data.statusUrl;
  if (typeof data.resultUrl === "string" && data.resultUrl)
    return data.resultUrl;
  return "";
}
export function normalizeAdobePollUrl(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url)
    return url;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (!host.startsWith("firefly-epo"))
      return url;
    const path = parsed.pathname || "";
    const isJobPath = path.includes("/jobs/result/") || path.includes("/v2/status") || path.includes("/status/");
    if (!isJobPath)
      return url;
    const jobId = path.split("/").filter(Boolean).pop() || "";
    if (!jobId || jobId === "status" || jobId === "result")
      return url;
    const epoId = host.slice("firefly-epo".length).split(".")[0] || "";
    const bksId = epoId.length > 4 ? epoId.slice(0, 4) : epoId;
    return `https://bks-epo${bksId}.adobe.io/v2/jobs/result/${jobId}?host=${host}`;
  } catch {
    return url;
  }
}
export function extractAdobeMediaUrl(latest, kind) {
  const body = latest && typeof latest === "object" ? latest : {};
  const outputs = Array.isArray(body.outputs) ? body.outputs : [];
  if (outputs.length > 0) {
    const first = outputs[0] && typeof outputs[0] === "object" ? outputs[0] : {};
    const media = kind === "image" ? first.image && typeof first.image === "object" ? first.image : null : first.video && typeof first.video === "object" ? first.video : null;
    const url = media && typeof media.presignedUrl === "string" ? media.presignedUrl : null;
    if (url)
      return url;
  }
  const found = findPresignedUrl(latest, kind === "image" ? [".png", ".jpg", ".jpeg", ".webp"] : [".mp4", ".webm"]);
  return found;
}
function findPresignedUrl(obj, exts) {
  if (!obj)
    return null;
  if (typeof obj === "string") {
    const s = obj.trim();
    if (/^https?:\/\//i.test(s) && (exts.some((e) => s.toLowerCase().includes(e)) || s.includes("presigned") || s.includes("X-Amz"))) {
      return s;
    }
    return null;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findPresignedUrl(item, exts);
      if (found)
        return found;
    }
    return null;
  }
  if (typeof obj === "object") {
    const rec = obj;
    if (typeof rec.presignedUrl === "string" && rec.presignedUrl)
      return rec.presignedUrl;
    for (const value of Object.values(rec)) {
      const found = findPresignedUrl(value, exts);
      if (found)
        return found;
    }
  }
  return null;
}
export function isAdobeJobInProgress(status) {
  const s = String(status || "").toUpperCase();
  return !s || s === "IN_PROGRESS" || s === "PENDING" || s === "RUNNING" || s === "QUEUED" || s === "PROCESSING" || s === "SUBMITTED";
}
export function isAdobeJobFailed(status) {
  const s = String(status || "").toUpperCase();
  return s === "FAILED" || s === "CANCELLED" || s === "ERROR" || s === "CANCELED";
}
