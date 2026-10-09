import {
  redactErrorPaths,
  stripErrorStackTail,
  stripRecognizedErrorStackTail
} from "./errorPathRedaction.js";
import { CREDENTIAL_PATTERNS } from "./credentialPatterns.js";
const MAX_ERROR_LEN = 4096;
const MAX_ERROR_SCAN_HEADROOM = 512;
const MAX_SECURITY_ESCAPE_LAYERS = 3;
const STRONG_CREDENTIAL_TOKEN_SOURCE = "(?:eyJ[A-Za-z0-9_-]{5,}\\.[A-Za-z0-9_-]{8,}\\.[A-Za-z0-9_-]{8,}|" + "github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,}|glpat-[A-Za-z0-9_-]{20,}|" + "xox[a-z]-[A-Za-z0-9-]{10,}|(?:AKIA|ASIA)[A-Z0-9]{16}|" + "(?<![A-Za-z0-9])sk[-_][A-Za-z0-9._~+/=-]{8,}|" + "(?<![A-Za-z0-9])[A-Za-z0-9]{3,}sk[-_][A-Za-z0-9._~+/=-]{8,})";
const STRONG_CREDENTIAL_TOKEN = new RegExp(STRONG_CREDENTIAL_TOKEN_SOURCE, "i");
const STRONG_CREDENTIAL_TOKEN_GLOBAL = new RegExp(STRONG_CREDENTIAL_TOKEN_SOURCE, "gi");
export function containsStrongCredentialToken(value) {
  return STRONG_CREDENTIAL_TOKEN.test(value);
}
const CREDENTIAL_LABELS = [
  ["__secure-next-auth.session-token", true],
  ["arena-auth-prod-v1", true],
  ["__cf_bm", true],
  ["_cfuvid", true],
  ["_puid", true],
  ["access_token_v2", true],
  ["token_v2", true],
  ["tokenv2", true],
  ["cf_clearance", true],
  ["credentials", true],
  ["credential", true],
  ["session id", true],
  ["session-id", true],
  ["session_id", true],
  ["sessionid", true],
  ["encryption key", true],
  ["encryption-key", true],
  ["encryption_key", true],
  ["encryptionkey", true],
  ["private key", true],
  ["private-key", true],
  ["private_key", true],
  ["privatekey", true],
  ["session key", true],
  ["session-key", true],
  ["session_key", true],
  ["sessionkey", true],
  ["secret key", true],
  ["secret-key", true],
  ["secret_key", true],
  ["secretkey", true],
  ["signing key", true],
  ["signing-key", true],
  ["signing_key", true],
  ["signingkey", true],
  ["refresh token", false],
  ["refresh-token", false],
  ["refresh_token", false],
  ["refreshtoken", false],
  ["access token", false],
  ["access-token", false],
  ["access_token", false],
  ["accesstoken", false],
  ["authorization", true],
  ["sso-rw", true],
  ["session", true],
  ["sso", true],
  ["api key", false],
  ["api-key", false],
  ["api_key", false],
  ["apikey", false],
  ["password", true],
  ["cookie", true],
  ["secret", true],
  ["token", false]
];
function isAsciiAlphaNumericCode(code) {
  return code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122;
}
function asciiHexValue(code) {
  if (code >= 48 && code <= 57)
    return code - 48;
  if (code >= 65 && code <= 70)
    return code - 65 + 10;
  if (code >= 97 && code <= 102)
    return code - 97 + 10;
  return -1;
}
function unicodeEscapeCodeAt(value, start) {
  if (value.charCodeAt(start) !== 92 || value[start + 1] !== "u" && value[start + 1] !== "U" || start + 5 >= value.length) {
    return null;
  }
  let decoded = 0;
  for (let digit = start + 2;digit <= start + 5; digit++) {
    const nibble = asciiHexValue(value.charCodeAt(digit));
    if (nibble < 0)
      return null;
    decoded = decoded * 16 + nibble;
  }
  return decoded;
}
function isPrintableAscii(code) {
  return code !== null && code >= 32 && code <= 126;
}
function isSecurityWhitespaceCode(code) {
  return code === 8 || code === 9 || code === 10 || code === 12 || code === 13;
}
function isEscapeTokenBoundary(code) {
  return !isAsciiAlphaNumericCode(code) && code !== 46 && code !== 95 && code !== 45;
}
function shouldPreserveUnicodeUncEvidence(value, runStart, runEnd, decoded) {
  if (runEnd - runStart < 2 || decoded === 47 || decoded === 92 || decoded === 58 || runStart > 0 && !isEscapeTokenBoundary(value.charCodeAt(runStart - 1))) {
    return false;
  }
  const afterEscape = runEnd + 5;
  let tokenEnd = afterEscape;
  while (tokenEnd < value.length && !/\s/.test(value[tokenEnd]))
    tokenEnd++;
  if (value.slice(afterEscape, tokenEnd).includes("="))
    return false;
  return afterEscape < tokenEnd;
}
function decodeSecurityEscapesOnce(value, decodeQuotes, maxLength) {
  const output = [];
  let changed = false;
  for (let index = 0;index < value.length; index++) {
    if (value.charCodeAt(index) !== 92) {
      output.push(value[index]);
      continue;
    }
    const runStart = index;
    while (index < value.length && value.charCodeAt(index) === 92)
      index++;
    const runEnd = index;
    if (runEnd >= value.length) {
      output.push(value.slice(runStart));
      break;
    }
    const escaped = value[runEnd];
    if (escaped === "u" || escaped === "U") {
      const decoded = unicodeEscapeCodeAt(value, runEnd - 1);
      const isQuote = decoded === 34 || decoded === 39;
      if (isSecurityWhitespaceCode(decoded)) {
        output.push(" ");
        index = runEnd + 4;
        changed = true;
        continue;
      }
      if (isPrintableAscii(decoded) && (decodeQuotes || !isQuote) && !shouldPreserveUnicodeUncEvidence(value, runStart, runEnd, decoded)) {
        output.push(String.fromCharCode(decoded));
        index = runEnd + 4;
        changed = true;
        continue;
      }
      output.push(value.slice(runStart, runEnd + 5));
      index = runEnd + 4;
      continue;
    }
    if (escaped === "b" || escaped === "f" || escaped === "n" || escaped === "r" || escaped === "t") {
      output.push(" ");
      index = runEnd;
      changed = true;
      continue;
    }
    if (escaped === "/" || decodeQuotes && (escaped === '"' || escaped === "'")) {
      output.push(escaped);
      index = runEnd;
      changed = true;
      continue;
    }
    output.push(value.slice(runStart, runEnd));
    index = runEnd - 1;
  }
  return changed ? output.join("").slice(0, maxLength) : value;
}
function hasResidualSecurityEscape(value) {
  for (let index = 0;index < value.length; index++) {
    if (value.charCodeAt(index) !== 92)
      continue;
    while (index < value.length && value.charCodeAt(index) === 92)
      index++;
    if (index >= value.length)
      return false;
    const escaped = value[index];
    if (escaped === "b" || escaped === "f" || escaped === "n" || escaped === "r" || escaped === "t") {
      return true;
    }
    if (escaped === "/" || escaped === '"' || escaped === "'")
      return true;
    if (escaped === "u" || escaped === "U") {
      const decoded = unicodeEscapeCodeAt(value, index - 1);
      if (isPrintableAscii(decoded) || isSecurityWhitespaceCode(decoded))
        return true;
    }
  }
  return false;
}
function normalizeSecurityEscapes(value, decodeQuotes, maxLength = MAX_ERROR_LEN) {
  let normalized = value.slice(0, maxLength);
  for (let layer = 0;layer < MAX_SECURITY_ESCAPE_LAYERS; layer++) {
    const decoded = decodeSecurityEscapesOnce(normalized, decodeQuotes, maxLength);
    if (decoded === normalized)
      break;
    normalized = decoded.slice(0, maxLength);
  }
  return normalized;
}
function isCredentialLabelBoundary(code) {
  return !isAsciiAlphaNumericCode(code) && code !== 95 && code !== 45;
}
function matchCredentialAssignmentAt(value, start) {
  const keyQuote = value[start] === '"' || value[start] === "'" ? value[start] : "";
  const labelStart = start + (keyQuote ? 1 : 0);
  const cliFlag = !keyQuote && labelStart >= 2 && value.slice(labelStart - 2, labelStart) === "--" && (labelStart === 2 || isCredentialLabelBoundary(value.charCodeAt(labelStart - 3)));
  for (const [label, failClosed] of CREDENTIAL_LABELS) {
    const labelEnd = labelStart + label.length;
    if (value.slice(labelStart, labelEnd).toLowerCase() !== label)
      continue;
    let index = labelEnd;
    if ((label === "arena-auth-prod-v1" || label === "__secure-next-auth.session-token") && value[index] === ".") {
      const chunkStart = ++index;
      while (index < value.length && /\d/.test(value[index]))
        index++;
      if (index === chunkStart)
        continue;
    }
    if (keyQuote) {
      if (value[index] !== keyQuote)
        continue;
      index++;
    } else if (!isCredentialLabelBoundary(value.charCodeAt(index))) {
      continue;
    } else if (value[index] === '"' || value[index] === "'") {
      index++;
    }
    const separatorStart = index;
    while (/\s/.test(value[index]))
      index++;
    if (value[index] === ":" || value[index] === "=") {
      index++;
      while (/\s/.test(value[index]))
        index++;
    } else if (!(cliFlag && index > separatorStart)) {
      continue;
    }
    return { valueStart: index, failClosed };
  }
  return null;
}
function findQuotedCredentialEnd(value, start, quote) {
  let index = start + 1;
  while (index < value.length) {
    if (value.charCodeAt(index) === 92) {
      index += 2;
      continue;
    }
    if (value[index] === quote)
      return index;
    index++;
  }
  return -1;
}
function findUnquotedCredentialEnd(value, start) {
  let end = start;
  while (end < value.length) {
    const char = value[end];
    if (/\s/.test(char) || char === '"' || char === "'" || char === "," || char === "}")
      break;
    end++;
  }
  return end;
}
function redactLabeledCredentialAssignments(value) {
  const parts = [];
  let copyStart = 0;
  let index = 0;
  while (index < value.length) {
    const assignment = matchCredentialAssignmentAt(value, index);
    if (!assignment) {
      index++;
      continue;
    }
    const { valueStart, failClosed } = assignment;
    const quote = value[valueStart] === '"' || value[valueStart] === "'" ? value[valueStart] : "";
    if (quote) {
      const closingQuote = findQuotedCredentialEnd(value, valueStart, quote);
      parts.push(value.slice(copyStart, valueStart + 1), "[REDACTED]");
      if (closingQuote < 0) {
        copyStart = value.length;
        index = value.length;
      } else {
        parts.push(quote);
        copyStart = closingQuote + 1;
        index = copyStart;
      }
      continue;
    }
    const valueEnd = failClosed || value.charCodeAt(valueStart) === 92 ? value.length : findUnquotedCredentialEnd(value, valueStart);
    parts.push(value.slice(copyStart, valueStart), "[REDACTED]");
    copyStart = valueEnd;
    index = Math.max(valueEnd, valueStart + 1);
  }
  if (parts.length === 0)
    return value;
  parts.push(value.slice(copyStart));
  return parts.join("");
}
function redactPrivateKeyPemBlocks(value) {
  const upperValue = value.replace(/[a-z]/g, (char) => char.toUpperCase());
  const beginPrefix = "-----BEGIN ";
  const parts = [];
  let copyStart = 0;
  let searchStart = 0;
  while (searchStart < value.length) {
    const blockStart = upperValue.indexOf(beginPrefix, searchStart);
    if (blockStart < 0)
      break;
    const labelStart = blockStart + beginPrefix.length;
    const headerEnd = upperValue.indexOf("-----", labelStart);
    if (headerEnd < 0)
      break;
    const label = upperValue.slice(labelStart, headerEnd).trim();
    if (!/^(?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?$/.test(label)) {
      searchStart = headerEnd + 5;
      continue;
    }
    const endMarker = `-----END ${label}-----`;
    const closingStart = upperValue.indexOf(endMarker, headerEnd + 5);
    const blockEnd = closingStart < 0 ? value.length : closingStart + endMarker.length;
    parts.push(value.slice(copyStart, blockStart), "[REDACTED]");
    copyStart = blockEnd;
    searchStart = blockEnd;
  }
  if (parts.length === 0)
    return value;
  parts.push(value.slice(copyStart));
  return parts.join("");
}
const DATA_URL_PREFIX = "data:";
const BASE64_DATA_URL_MARKER = ";base64";
const REDACTED_DATA_URL = "[REDACTED_DATA_URL]";
function matchesAsciiCaseInsensitiveAt(value, start, expected) {
  if (start < 0 || start + expected.length > value.length)
    return false;
  for (let offset = 0;offset < expected.length; offset++) {
    const code = value.charCodeAt(start + offset);
    const foldedCode = code >= 65 && code <= 90 ? code + 32 : code;
    if (foldedCode !== expected.charCodeAt(offset))
      return false;
  }
  return true;
}
function isBase64DataUrlPayloadCode(code) {
  return isAsciiAlphaNumericCode(code) || code === 43 || code === 47 || code === 61 || code === 95 || code === 45;
}
function isEcmaScriptWhitespaceCode(code) {
  return code >= 9 && code <= 13 || code === 32 || code === 160 || code === 5760 || code >= 8192 && code <= 8202 || code === 8232 || code === 8233 || code === 8239 || code === 8287 || code === 12288 || code === 65279;
}
function redactBase64DataUrls(value) {
  const parts = [];
  let copyStart = 0;
  let index = 0;
  while (index < value.length) {
    if (!matchesAsciiCaseInsensitiveAt(value, index, DATA_URL_PREFIX)) {
      index++;
      continue;
    }
    const dataUrlStart = index;
    const mediaTypeStart = dataUrlStart + DATA_URL_PREFIX.length;
    let delimiter = mediaTypeStart;
    while (delimiter < value.length && value[delimiter] !== "," && !isEcmaScriptWhitespaceCode(value.charCodeAt(delimiter))) {
      delimiter++;
    }
    const markerStart = delimiter - BASE64_DATA_URL_MARKER.length;
    const hasBase64Marker = delimiter < value.length && value[delimiter] === "," && markerStart >= mediaTypeStart && matchesAsciiCaseInsensitiveAt(value, markerStart, BASE64_DATA_URL_MARKER);
    if (!hasBase64Marker) {
      index = delimiter < value.length ? delimiter + 1 : value.length;
      continue;
    }
    let payloadEnd = delimiter + 1;
    while (payloadEnd < value.length && isBase64DataUrlPayloadCode(value.charCodeAt(payloadEnd))) {
      payloadEnd++;
    }
    if (payloadEnd === delimiter + 1) {
      index = delimiter + 1;
      continue;
    }
    parts.push(value.slice(copyStart, dataUrlStart), REDACTED_DATA_URL);
    copyStart = payloadEnd;
    index = payloadEnd;
  }
  if (parts.length === 0)
    return value;
  parts.push(value.slice(copyStart));
  return parts.join("");
}
const HTTP_URL_RE = /https?:\/\//gi;
const URL_QUERY_PARAM_RE = /([?&])([^=&#]+)=([^&#]*)/g;
function isUrlTerminator(char) {
  return /\s/.test(char) || char === '"' || char === "'" || char === "`" || char === "<" || char === ">" || char === ")" || char === "]" || char === "}" || char === "," || char === ";";
}
function normalizeUrlQueryKey(key) {
  let decoded = key.replace(/\+/g, " ");
  try {
    decoded = decodeURIComponent(decoded);
  } catch {}
  return decoded.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
}
function isSensitiveUrlQueryKey(key) {
  const normalized = normalizeUrlQueryKey(key);
  return normalized === "sig" || normalized === "signature" || normalized === "key" || normalized === "apikey" || normalized === "token" || normalized === "accesstoken" || normalized === "refreshtoken" || normalized === "credential" || normalized === "password" || normalized === "secret" || normalized === "awsaccesskeyid" || normalized === "googleaccessid" || normalized === "xamzcredential" || normalized === "xamzsignature" || normalized === "xamzsecuritytoken" || normalized === "xgoogcredential" || normalized === "xgoogsignature";
}
function redactUrlSegment(segment) {
  const schemeEnd = segment.indexOf("//") + 2;
  let authorityEnd = segment.length;
  for (const delimiter of ["/", "?", "#"]) {
    const candidate = segment.indexOf(delimiter, schemeEnd);
    if (candidate >= 0)
      authorityEnd = Math.min(authorityEnd, candidate);
  }
  let redacted = segment;
  const userInfoEnd = segment.lastIndexOf("@", authorityEnd);
  if (userInfoEnd >= schemeEnd) {
    redacted = `${segment.slice(0, schemeEnd)}[REDACTED]@${segment.slice(userInfoEnd + 1)}`;
  }
  URL_QUERY_PARAM_RE.lastIndex = 0;
  return redacted.replace(URL_QUERY_PARAM_RE, (match, separator, key) => isSensitiveUrlQueryKey(key) ? `${separator}redacted=[REDACTED]` : match);
}
function redactSensitiveUrlCredentials(value) {
  HTTP_URL_RE.lastIndex = 0;
  const parts = [];
  let copyStart = 0;
  let match = HTTP_URL_RE.exec(value);
  while (match) {
    const start = match.index;
    let end = HTTP_URL_RE.lastIndex;
    while (end < value.length && !isUrlTerminator(value[end]))
      end++;
    const segment = value.slice(start, end);
    const redacted = redactUrlSegment(segment);
    if (redacted !== segment) {
      parts.push(value.slice(copyStart, start), redacted);
      copyStart = end;
    }
    HTTP_URL_RE.lastIndex = Math.max(end, HTTP_URL_RE.lastIndex);
    match = HTTP_URL_RE.exec(value);
  }
  if (parts.length === 0)
    return value;
  parts.push(value.slice(copyStart));
  return parts.join("");
}
function redactKnownCredentialPatterns(value) {
  let redacted = value;
  for (const pattern of CREDENTIAL_PATTERNS) {
    if (pattern.name === "auth_header")
      continue;
    pattern.regex.lastIndex = 0;
    redacted = redacted.replace(pattern.regex, "[REDACTED]");
  }
  return redacted;
}
export function redactSensitiveErrorText(value) {
  const normalized = normalizeSecurityEscapes(value, false, MAX_ERROR_LEN + MAX_ERROR_SCAN_HEADROOM);
  const catalogRedacted = redactKnownCredentialPatterns(redactSensitiveUrlCredentials(normalized));
  const commonCredentialsRedacted = redactBase64DataUrls(redactPrivateKeyPemBlocks(catalogRedacted)).replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]").replace(STRONG_CREDENTIAL_TOKEN_GLOBAL, "[REDACTED]");
  return redactLabeledCredentialAssignments(commonCredentialsRedacted);
}
export function containsSensitiveErrorCredential(value) {
  const normalized = normalizeSecurityEscapes(value, false, MAX_ERROR_LEN + MAX_ERROR_SCAN_HEADROOM);
  const directRedacted = redactKnownCredentialPatterns(redactSensitiveUrlCredentials(normalized)).replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]").replace(STRONG_CREDENTIAL_TOKEN_GLOBAL, "[REDACTED]");
  if (directRedacted !== normalized)
    return true;
  if (/(?:^|\s)--(?:api[-_]?key|token|password|secret)\s+(?:"[^"]*"|'[^']*'|\S+)/i.test(normalized)) {
    return true;
  }
  return /(?:api[_-]?key|access[_-]?token|refresh[_-]?token|authorization|cookie|secret)["']?\s*[:=]\s*["']?[^"'\\,\s}]{6,}/i.test(normalized);
}
function coerceErrorText(value) {
  if (typeof value === "string")
    return value;
  if (value === null || value === undefined)
    return "";
  try {
    return String(value);
  } catch {
    return "";
  }
}
function truncateSanitizedErrorText(value) {
  if (value.length <= MAX_ERROR_LEN)
    return value;
  const markerStart = value.lastIndexOf("[REDACTED", MAX_ERROR_LEN);
  const markerEnd = markerStart >= 0 ? value.indexOf("]", markerStart) : -1;
  if (markerStart >= 0 && markerStart < MAX_ERROR_LEN && markerEnd >= MAX_ERROR_LEN && markerEnd - markerStart <= 128) {
    const marker = value.slice(markerStart, markerEnd + 1);
    return `${value.slice(0, MAX_ERROR_LEN - marker.length)}${marker}`;
  }
  return value.slice(0, MAX_ERROR_LEN);
}
function sanitizeErrorMessageWithStackPolicy(message, stripStackTail) {
  let str = coerceErrorText(message);
  if (str.length > MAX_ERROR_LEN + MAX_ERROR_SCAN_HEADROOM) {
    str = str.slice(0, MAX_ERROR_LEN + MAX_ERROR_SCAN_HEADROOM);
  }
  str = redactLabeledCredentialAssignments(redactKnownCredentialPatterns(redactSensitiveUrlCredentials(stripStackTail(str))));
  str = redactErrorPaths(str);
  str = redactSensitiveErrorText(str);
  str = truncateSanitizedErrorText(str);
  str = normalizeSecurityEscapes(str, false);
  str = redactSensitiveErrorText(redactErrorPaths(stripStackTail(str)));
  str = normalizeSecurityEscapes(str, true);
  str = redactSensitiveErrorText(redactErrorPaths(stripStackTail(str)));
  return hasResidualSecurityEscape(str) ? "[REDACTED]" : str.trimEnd();
}
export function sanitizeErrorMessage(message) {
  return sanitizeErrorMessageWithStackPolicy(message, stripErrorStackTail);
}
function sanitizePassthroughErrorMessage(message) {
  return sanitizeErrorMessageWithStackPolicy(message, stripRecognizedErrorStackTail);
}
const BLOCKED_KEYS = /stack|trace|path|file|cwd|dir|password|secret|token|key|authorization|cookie|credential|session(?!_?(?:count|status)$)/i;
const BLOCKED_CREDENTIAL_ALIAS_KEYS = /^(?:cf_clearance|__cf_bm|_cfuvid|_puid|sso|sso-rw|arena-auth-prod-v1(?:\.\d+)?)$/i;
const PROTOTYPE_CONTROL_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const MAX_DEPTH = 4;
const MAX_UPSTREAM_KEY_LEN = 256;
const SAFE_UPSTREAM_STATUS_IDENTIFIERS = new Set([
  "ABORTED",
  "ALREADY_EXISTS",
  "CANCELLED",
  "DATA_LOSS",
  "DEADLINE_EXCEEDED",
  "FAILED_PRECONDITION",
  "INTERNAL",
  "INVALID_ARGUMENT",
  "NOT_FOUND",
  "OK",
  "OUT_OF_RANGE",
  "PERMISSION_DENIED",
  "RESOURCE_EXHAUSTED",
  "UNAUTHENTICATED",
  "UNAVAILABLE",
  "UNIMPLEMENTED",
  "UNKNOWN"
]);
const SAFE_UPSTREAM_ERROR_IDENTIFIERS = new Set([
  "api_error",
  "auth_error",
  "authentication_error",
  "bad_gateway",
  "bad_request",
  "billing_error",
  "context_length_exceeded",
  "error",
  "gateway_timeout",
  "insufficient_quota",
  "invalid_api_key",
  "invalid_request",
  "invalid_request_error",
  "model_not_found",
  "not_found",
  "payment_required",
  "permission_error",
  "provider_error",
  "quota_exhausted",
  "rate_limit_error",
  "rate_limit_exceeded",
  "server_error",
  "upstream_error",
  "upstream_timeout"
]);
function describeOpaqueBinaryDetail(value) {
  return `[binary ${value.byteLength} bytes]`;
}
function normalizeUpstreamClassificationKey(key) {
  const normalized = key.replace(/[-_]/g, "").toLowerCase();
  if (normalized === "code" || normalized === "errorcode")
    return "code";
  if (normalized === "reason" || normalized === "errorreason")
    return "reason";
  if (normalized === "status" || normalized === "statuscode" || normalized === "errorstatus" || normalized === "errorstatuscode") {
    return "status";
  }
  if (normalized === "type" || normalized === "errortype" || normalized === "subtype") {
    return "type";
  }
  return null;
}
function projectUpstreamErrorIdentifier(key, value) {
  if (typeof value === "number") {
    if (!Number.isInteger(value))
      return;
    if (key === "code" && value >= 0 && value <= 16)
      return value;
    return (key === "code" || key === "status") && value >= 100 && value <= 599 ? value : undefined;
  }
  if (typeof value !== "string")
    return;
  if (key === "status" && SAFE_UPSTREAM_STATUS_IDENTIFIERS.has(value.toUpperCase())) {
    return value;
  }
  if (/^[1-5]\d{2}$/.test(value) || /^HTTP_[1-5]\d{2}$/i.test(value) || SAFE_UPSTREAM_ERROR_IDENTIFIERS.has(value.toLowerCase())) {
    return value;
  }
  if (key === "type")
    return "upstream_error";
  if (key === "code")
    return "";
  return;
}
function isSafeUpstreamDetailKey(key) {
  if (key.length === 0 || key.length > MAX_UPSTREAM_KEY_LEN || BLOCKED_KEYS.test(key) || BLOCKED_CREDENTIAL_ALIAS_KEYS.test(key) || PROTOTYPE_CONTROL_KEYS.has(key.toLowerCase())) {
    return false;
  }
  return sanitizeErrorMessage(key) === key;
}
function sanitizeUpstreamDetailsInternal(value, depth, preserveSafeMultiline, projectClassification) {
  if (depth > MAX_DEPTH)
    return "[truncated]";
  if (value === null || value === undefined)
    return null;
  if (typeof value === "string") {
    return preserveSafeMultiline ? sanitizePassthroughErrorMessage(value) : sanitizeErrorMessage(value);
  }
  if (typeof value === "number" || typeof value === "boolean")
    return value;
  if (typeof value === "object") {
    try {
      if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
        return describeOpaqueBinaryDetail(value);
      }
      if (Array.isArray(value)) {
        return value.slice(0, 32).map((entry) => sanitizeUpstreamDetailsInternal(entry, depth + 1, preserveSafeMultiline, projectClassification));
      }
      const out = Object.create(null);
      for (const [key, entryValue] of Object.entries(value)) {
        if (!isSafeUpstreamDetailKey(key))
          continue;
        const normalizedKey = key.toLowerCase();
        const classificationKey = normalizeUpstreamClassificationKey(normalizedKey);
        if (projectClassification && classificationKey) {
          const projected = projectUpstreamErrorIdentifier(classificationKey, entryValue);
          if (projected !== undefined)
            out[key] = projected;
          continue;
        }
        const childProjectsClassification = normalizedKey === "error" || normalizedKey === "errors" || normalizedKey === "warning" || normalizedKey === "warnings";
        out[key] = sanitizeUpstreamDetailsInternal(entryValue, depth + 1, preserveSafeMultiline, childProjectsClassification);
      }
      return out;
    } catch {
      return null;
    }
  }
  return null;
}
export function sanitizeUpstreamDetails(value, depth = 0) {
  return sanitizeUpstreamDetailsInternal(value, depth, false, depth === 0);
}
export function sanitizePassthroughUpstreamDetails(value, depth = 0) {
  return sanitizeUpstreamDetailsInternal(value, depth, true, depth === 0);
}
