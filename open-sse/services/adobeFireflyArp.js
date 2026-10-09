import { fetchPublic } from "../../src/shared/utils/ssrfGuard.js";
import { stripAdobeJwts } from "./adobeFireflySecurity.js";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import {
  DEFAULT_SEC_CH_UA,
  DEFAULT_USER_AGENT,
  FIREFLY_ORIGIN,
  FIREFLY_REFERER
} from "./adobeFireflyCatalog.js";
import {
  adobeFireflyApiKey,
  extractAdobeAccountIdFromToken,
  looksLikeAdobeJwt
} from "./adobeFireflyCredentials.js";
export function browserHeaders() {
  return {
    "user-agent": DEFAULT_USER_AGENT,
    origin: FIREFLY_ORIGIN,
    referer: FIREFLY_REFERER,
    "accept-language": "en-US,en;q=0.9",
    "sec-ch-ua": DEFAULT_SEC_CH_UA,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-site": "cross-site",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty"
  };
}
export function generateAdobeNonce() {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0;i < bytes.length; i++)
      bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
export function buildAdobeSubmitNonce(accessToken, prompt) {
  const userId = extractAdobeAccountIdFromToken(accessToken);
  const promptPrefix = String(prompt || "").slice(0, 256);
  if (!userId || !promptPrefix)
    return "";
  return createHash("sha256").update(`${userId}-${promptPrefix}`, "utf8").digest("hex");
}
export const ADOBE_FIREFLY_ARKOSE_PUBLIC_KEY = "BBCC314C-4937-4CCD-B0A3-FDF0F0F7603C";
export const ADOBE_FIREFLY_FTR_MAGIC = "__UDF43-m4_31ck";
export function isValidAdobeArpSessionId(value) {
  const t = String(value || "").trim();
  if (t.length < 4)
    return false;
  if (/^[A-Za-z_][A-Za-z0-9_.%-]*=/.test(t) && !t.startsWith("eyJ"))
    return false;
  try {
    const padded = t + "=".repeat((4 - t.length % 4) % 4);
    const json = Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(json))
      return false;
    const obj = JSON.parse(json);
    return typeof obj.sid === "string" && obj.sid.length > 0;
  } catch {
    if (/=.+/.test(t.replace(/=+$/, "")))
      return false;
    return !looksLikeAdobeJwt(t) && /^[A-Za-z0-9+/_=-]+$/.test(t);
  }
}
export function buildAdobeArpSessionId(region = "eu-west-1") {
  const nowMs = Date.now();
  const sid = randomUUID();
  const randHex = randomBytes(16).toString("hex");
  const mid = randomBytes(12).toString("base64url");
  const n = 1000 + Math.floor(Math.random() * 9000);
  const ftr = `${randHex}_${nowMs}${ADOBE_FIREFLY_FTR_MAGIC}_${mid}=-${n}-v2_tt`;
  const arkSession = `${randomBytes(8).toString("hex")}.${Math.random().toFixed(10).slice(2)}`;
  const ark = `${arkSession}|r=${region}|meta=3|metabgclr=transparent|metaiconclr=%23757575|` + `guitextcolor=%23000000|pk=${ADOBE_FIREFLY_ARKOSE_PUBLIC_KEY}|at=40|sup=1|rid=13|ag=101|` + `cdn_url=https%3A%2F%2Farks-client.adobe.com%2Fcdn%2Ffc|` + `surl=https%3A%2F%2Farks-client.adobe.com|` + `smurl=https%3A%2F%2Farks-client.adobe.com%2Fcdn%2Ffc%2Fassets%2Fstyle-manager`;
  const bfp = randomUUID();
  const fpjs = JSON.stringify({
    requestId: `${nowMs}.${randomBytes(3).toString("base64url")}`,
    visitorId: randomBytes(12).toString("base64url")
  });
  const raw = JSON.stringify({ sid, ark, bfp, ftr, fpjs });
  return Buffer.from(raw, "utf-8").toString("base64");
}
export function extractAdobeArpSessionId(cookieOrBlob) {
  const raw = String(cookieOrBlob || "");
  if (!raw.trim())
    return "";
  const candidates = [];
  const push = (v) => {
    if (!v)
      return;
    let t = v.trim().replace(/^["']|["']$/g, "").trim();
    try {
      if (/%[0-9A-Fa-f]{2}/.test(t))
        t = decodeURIComponent(t);
    } catch {}
    if (t)
      candidates.push(t);
  };
  const m = raw.match(/(?:^|[;\s\n\r])sherlockToken=([^;\s\n\r]+)/i);
  if (m?.[1])
    push(m[1]);
  const m2 = raw.match(/(?:^|[;\s\n\r])x-arp-session-id=([^;\s\n\r]+)/i);
  if (m2?.[1])
    push(m2[1]);
  const m3 = raw.match(/["']?x-arp-session-id["']?\s*[:=]\s*["']?([A-Za-z0-9+/=_-]{40,})["']?/i);
  if (m3?.[1])
    push(m3[1]);
  const m4 = raw.match(/["']?sherlockToken["']?\s*[:=]\s*["']?([A-Za-z0-9+/=_-]{40,})["']?/i);
  if (m4?.[1])
    push(m4[1]);
  for (const line of raw.split(/[\r\n]+/)) {
    const t = line.trim().replace(/^["']|["']$/g, "");
    if (looksLikeAdobeJwt(t))
      continue;
    if (t.length >= 40 && isValidAdobeArpSessionId(t))
      push(t);
  }
  const withoutJwt = stripAdobeJwts(raw, " ");
  for (const token of withoutJwt.split(/[\s,;"']+/)) {
    let t = token.trim();
    const eq = t.indexOf("=");
    if (eq > 0 && eq < 40 && /^[A-Za-z0-9_.%-]+$/.test(t.slice(0, eq))) {
      const name = t.slice(0, eq).toLowerCase();
      if (name === "sherlocktoken" || name === "x-arp-session-id") {
        t = t.slice(eq + 1).trim();
      } else {
        continue;
      }
    }
    if (t.length >= 40 && isValidAdobeArpSessionId(t))
      push(t);
  }
  const ranked = candidates.map((c) => c.replace(/^["']|["']$/g, "").trim()).filter((v) => isValidAdobeArpSessionId(v));
  ranked.sort((a, b) => scoreAdobeArpCandidate(b) - scoreAdobeArpCandidate(a));
  return ranked[0] || "";
}
function scoreAdobeArpCandidate(value) {
  let score = value.length;
  try {
    const padded = value + "=".repeat((4 - value.length % 4) % 4);
    const json = Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const obj = JSON.parse(json);
    if (typeof obj.sid === "string" && obj.sid)
      score += 1000;
    if (typeof obj.ark === "string" && obj.ark.length > 20)
      score += 500;
    if (typeof obj.ftr === "string" && obj.ftr.includes(ADOBE_FIREFLY_FTR_MAGIC))
      score += 200;
    if (typeof obj.ark === "string" && obj.ark.includes(ADOBE_FIREFLY_ARKOSE_PUBLIC_KEY))
      score += 100;
    if (typeof obj.bfp === "string" && obj.bfp.length >= 8)
      score += 150;
    if (typeof obj.fpjs === "string" && obj.fpjs.length > 10)
      score += 150;
  } catch {}
  return score;
}
export function hasBrowserAdobeArpSession(sessionCookieOrBlob) {
  const blob = String(sessionCookieOrBlob || "");
  if (extractAdobeArpSessionId(blob))
    return true;
  const sid = blob.match(/(?:^|[;\s])ff_session_guid=([^;\s]+)/i)?.[1];
  const ark = blob.match(/(?:^|[;\s])arkose=([^;\s]+)/i)?.[1];
  const ftr = blob.match(/(?:^|[;\s])forterToken=([^;\s]+)/i)?.[1] || blob.match(/(?:^|[;\s])forter=([^;\s]+)/i)?.[1];
  return Boolean(sid && ark && ftr && !/^[a-f0-9]{32},\d+$/i.test(ftr));
}
export function resolveAdobeArpSessionId(sessionCookieOrBlob) {
  const blob = String(sessionCookieOrBlob || "");
  const getCookie = (name) => {
    const m = blob.match(new RegExp(`(?:^|[;\\s\\n\\r])${name}=([^;\\s\\n\\r]+)`, "i"));
    if (!m?.[1])
      return "";
    let v = m[1].trim();
    try {
      if (/%[0-9A-Fa-f]{2}/.test(v))
        v = decodeURIComponent(v);
    } catch {}
    return v;
  };
  const sid = getCookie("ff_session_guid");
  const ark = getCookie("arkose");
  let ftr = getCookie("forterToken") || getCookie("forter");
  try {
    if (/%[0-9A-Fa-f]{2}/.test(ftr))
      ftr = decodeURIComponent(ftr);
  } catch {}
  if (ftr.endsWith("v2") && !ftr.endsWith("v2_tt"))
    ftr = `${ftr}_tt`;
  if (/^[a-f0-9]{32},\d+$/i.test(ftr))
    ftr = "";
  if (sid && ark && ftr) {
    const bfp = getCookie("bfp");
    let fpjs = getCookie("fpjs");
    try {
      if (fpjs && /%[0-9A-Fa-f]{2}/.test(fpjs))
        fpjs = decodeURIComponent(fpjs);
    } catch {}
    const obj = { sid, ark, ftr };
    if (bfp)
      obj.bfp = bfp;
    if (fpjs)
      obj.fpjs = fpjs;
    return Buffer.from(JSON.stringify(obj), "utf-8").toString("base64");
  }
  const extracted = extractAdobeArpSessionId(blob);
  if (extracted)
    return extracted;
  return buildAdobeArpSessionId();
}
export function buildAdobeSubmitHeaders(accessToken, extras) {
  const cookieBlob = String(extras?.cookie || "").trim();
  const deterministic = extras?.nonce || (extras?.prompt ? buildAdobeSubmitNonce(accessToken, extras.prompt) : "") || generateAdobeNonce();
  const explicitArp = extras?.arpSessionId ? String(extras.arpSessionId).trim() : "";
  const arp = explicitArp || extractAdobeArpSessionId(cookieBlob) || buildAdobeArpSessionId();
  const headers = {
    ...browserHeaders(),
    Authorization: `Bearer ${accessToken}`,
    "x-api-key": adobeFireflyApiKey(),
    "content-type": "application/json",
    accept: "*/*",
    "cache-control": "no-cache",
    pragma: "no-cache",
    priority: "u=1, i",
    "x-nonce": deterministic,
    "x-arp-session-id": arp
  };
  return headers;
}
export const ADOBE_FIREFLY_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export function buildAdobeUploadHeaders(accessToken, contentType, extras) {
  const base = buildAdobeSubmitHeaders(accessToken, {
    arpSessionId: extras?.arpSessionId,
    nonce: extras?.nonce,
    cookie: extras?.cookie,
    prompt: extras?.prompt || "upload"
  });
  const ct = String(contentType || "image/png").trim().toLowerCase() || "image/png";
  return {
    ...base,
    "content-type": ct.startsWith("image/") ? ct : "image/png"
  };
}
