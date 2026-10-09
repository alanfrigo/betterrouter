import { resolvePublicCred } from "../utils/publicCreds.js";
import {
  decodeAdobeJwtPayload,
  findAllAdobeJwts,
  isExactAdobeJwt,
  stripAdobeJwts
} from "./adobeFireflySecurity.js";

export class AdobeFireflyError extends Error {
  status;
  code;
  constructor(message, status = 502, code) {
    super(message);
    this.name = "AdobeFireflyError";
    this.status = status;
    this.code = code;
  }
}
export function adobeFireflyApiKey() {
  return resolvePublicCred("adobe_firefly_api_key", "ADOBE_FIREFLY_API_KEY");
}
export function adobeFireflyExpressClientId() {
  return resolvePublicCred("adobe_firefly_express_client_id", "ADOBE_FIREFLY_EXPRESS_CLIENT_ID");
}
export function adobeFireflyBalanceApiKey() {
  return resolvePublicCred("adobe_firefly_balance_api_key", "ADOBE_FIREFLY_BALANCE_API_KEY");
}
export function extractAdobeAccountIdFromToken(token) {
  const payload = decodeAdobeJwtPayload(token);
  if (!payload)
    return "";
  const candidates = [payload.user_id, payload.aa_id, payload.sub, payload.id];
  for (const c of candidates) {
    if (typeof c === "string" && c.includes("@"))
      return c.trim();
  }
  for (const c of candidates) {
    if (typeof c === "string" && c.trim())
      return c.trim();
  }
  return "";
}
export function looksLikeAdobeJwt(value) {
  const raw = value.trim();
  if (!raw)
    return false;
  if (raw.includes(";") || raw.includes("=") && !raw.startsWith("eyJ"))
    return false;
  if (/\s/.test(raw) && !/^bearer\s+/i.test(raw))
    return false;
  const token = raw.replace(/^bearer\s+/i, "").trim();
  const parts = token.split(".");
  if (parts.length !== 3)
    return false;
  if (token.length < 80)
    return false;
  return parts.every((p) => p.length > 0 && /^[A-Za-z0-9_-]+$/.test(p));
}
export function isAdobeGuestAccessToken(token) {
  const payload = decodeAdobeJwtPayload(token);
  if (!payload)
    return false;
  const userId = typeof payload.user_id === "string" ? payload.user_id : "";
  const aaId = typeof payload.aa_id === "string" ? payload.aa_id : "";
  const type = typeof payload.type === "string" ? payload.type.toLowerCase() : "";
  if (userId.includes("@AdobeID") || aaId.includes("@AdobeID"))
    return false;
  if (userId.includes("@GuestID") || aaId.includes("@GuestID"))
    return true;
  if (type === "guest" || type.includes("guest"))
    return true;
  if (!userId && !aaId)
    return true;
  return false;
}
export function isAdobeUserAccessToken(token) {
  return looksLikeAdobeJwt(token) && !isAdobeGuestAccessToken(token);
}
export function extractAdobeCredentialToken(raw) {
  const value = String(raw || "").trim();
  if (!value)
    return "";
  if (/^bearer\s+/i.test(value)) {
    const bare = value.replace(/^bearer\s+/i, "").trim().split(/\s+/)[0] || "";
    if (looksLikeAdobeJwt(bare))
      return bare;
  }
  const accessMatch = value.match(/(?:^|[;\s&])access_token=([^;\s&]+)/i);
  if (accessMatch?.[1]) {
    const t = decodeURIComponent(accessMatch[1].trim());
    if (looksLikeAdobeJwt(t))
      return t;
  }
  const tokenValueMatch = value.match(/"tokenValue"\s*:\s*"(eyJ[^"]+)"/i);
  if (tokenValueMatch?.[1] && looksLikeAdobeJwt(tokenValueMatch[1])) {
    return tokenValueMatch[1];
  }
  const authMatch = value.match(/Authorization\s*:\s*Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/i);
  if (authMatch?.[1] && looksLikeAdobeJwt(authMatch[1]))
    return authMatch[1];
  const jwtMatches = findAllAdobeJwts(value);
  if (jwtMatches && jwtMatches.length > 0) {
    const sorted = [...jwtMatches].sort((a, b) => b.length - a.length);
    const user = sorted.find((t) => looksLikeAdobeJwt(t) && isAdobeUserAccessToken(t));
    if (user)
      return user;
    const best = sorted[0];
    if (looksLikeAdobeJwt(best))
      return best;
  }
  if (looksLikeAdobeJwt(value))
    return value.replace(/^bearer\s+/i, "").trim();
  return value;
}
export function looksLikeAdobeCookieBlob(value) {
  const raw = String(value || "").trim();
  if (!raw || looksLikeAdobeJwt(raw))
    return false;
  if (raw.includes(";") && raw.includes("="))
    return true;
  if (/(?:^|[;\s])(?:aux_sid|ff_session|sherlockToken|forterToken|arkose)=/i.test(raw)) {
    return true;
  }
  return false;
}
export function extractAdobeCookieHeader(raw) {
  const value = String(raw || "").trim();
  if (!value)
    return "";
  if (looksLikeAdobeJwt(value))
    return "";
  const cleaned = value.split(/[\r\n]+/).map((line) => line.trim()).filter((line) => {
    if (!line)
      return false;
    if (/^authorization\s*:/i.test(line))
      return false;
    if (/^bearer\s+/i.test(line))
      return false;
    if (looksLikeAdobeJwt(line))
      return false;
    if (isExactAdobeJwt(line))
      return false;
    return true;
  }).join("; ");
  const noJwt = stripAdobeJwts(cleaned).replace(/;\s*;/g, ";").replace(/^;\s*|\s*;$/g, "").trim();
  if (!noJwt || !looksLikeAdobeCookieBlob(noJwt))
    return "";
  return noJwt.replace(/[\r\n]+/g, "; ").trim();
}
export const GUEST_COOKIE_HELP = "Firefly page cookies alone only mint a GUEST IMS token (no AdobeID) — generate returns 401 and Limits 403. " + "Fix: open firefly.adobe.com signed-in → F12 → Network → click a request to firefly-3p.ff.adobe.io " + "(generate-async or models/discovery) → Request Headers → Authorization → copy the token AFTER 'Bearer ' " + "(starts with eyJ…). Paste that JWT as the credential. " + "Cookie-only works only if you also export IMS session cookies from adobelogin.com / adobeid-na1 " + "(Cookie-Editor → export all Adobe domains); firefly.adobe.com cookies by themselves are not enough.";
