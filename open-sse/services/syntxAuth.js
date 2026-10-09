export const SYNTX_API_BASE = "https://api.syntx.ai";
export const SYNTX_SSE_ORIGIN = "https://sse.syntx.ai";
export const SYNTX_SITE = "https://syntx.ai/";
export const SYNTX_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
export function stripBearerPrefix(raw) {
  const text = (raw || "").trim();
  if (text.length >= 7 && text.slice(0, 7).toLowerCase() === "bearer ") {
    return text.slice(7).trim();
  }
  return text;
}
export function looksLikeJwt(token) {
  const raw = stripBearerPrefix(token);
  if (!raw || !raw.startsWith("eyJ"))
    return false;
  return raw.split(".").length === 3;
}
function firstString(record, keys) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim())
      return stripBearerPrefix(value);
  }
  return "";
}
export function extractSyntxTokenFromUnknown(value) {
  if (typeof value === "string") {
    const trimmed = stripBearerPrefix(value);
    if (!trimmed)
      return "";
    if (trimmed.startsWith("{")) {
      try {
        return extractSyntxTokenFromUnknown(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    return "";
  const rec = value;
  return firstString(rec, ["accessToken", "access_token", "token", "jwt", "idToken", "id_token", "apiKey"]) || extractSyntxTokenFromUnknown(rec.authorization);
}
export function resolveSyntxToken(options) {
  const candidates = [
    extractSyntxTokenFromUnknown(options.accessToken),
    extractSyntxTokenFromUnknown(options.apiKey),
    extractSyntxTokenFromUnknown(options.providerSpecificData)
  ].filter((value) => value.length > 0);
  return candidates.find((value) => looksLikeJwt(value)) || candidates[0] || "";
}
export function syntxAuthHeaders(token) {
  return {
    accept: "application/json, text/plain, */*",
    "accept-language": "en",
    authorization: `Bearer ${token}`,
    origin: "https://syntx.ai",
    referer: SYNTX_SITE,
    "user-agent": SYNTX_USER_AGENT
  };
}
export function connectionFingerprint(token, connectionId) {
  if (connectionId && connectionId.trim())
    return connectionId.trim();
  const raw = stripBearerPrefix(token);
  if (raw.length <= 24)
    return raw || "syntx";
  return `${raw.slice(0, 12)}…${raw.slice(-8)}`;
}
