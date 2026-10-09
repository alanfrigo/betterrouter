export const GITLAB_DUO_DEFAULT_BASE_URL = process.env.GITLAB_DUO_BASE_URL || process.env.GITLAB_BASE_URL || "https://gitlab.com";
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
export function normalizeGitLabBaseUrl(baseUrl) {
    const raw = typeof baseUrl === "string" ? baseUrl.trim() : "";
    return (raw || GITLAB_DUO_DEFAULT_BASE_URL).replace(/\/$/, "");
}
export function resolveGitLabOAuthBaseUrl(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeGitLabBaseUrl(data.baseUrl);
}
export function buildGitLabOAuthEndpoints(baseUrl) {
    const root = normalizeGitLabBaseUrl(baseUrl);
    return {
        root,
        authorizeUrl: `${root}/oauth/authorize`,
        tokenUrl: `${root}/oauth/token`,
        userUrl: `${root}/api/v4/user`,
        directAccessUrl: `${root}/api/v4/code_suggestions/direct_access`,
        publicCompletionsUrl: `${root}/api/v4/code_suggestions/completions`,
    };
}
export function buildGitLabDirectGatewayUrl(baseUrl) {
    const normalized = normalizeGitLabBaseUrl(baseUrl);
    if (normalized.endsWith("/ai/v2/completions")) {
        return normalized;
    }
    if (normalized.endsWith("/ai/v2")) {
        return `${normalized}/completions`;
    }
    return `${normalized}/ai/v2/completions`;
}
export function parseGitLabDirectAccessDetails(payload) {
    const data = asRecord(payload);
    const token = typeof data.token === "string" ? data.token.trim() : "";
    const baseUrl = typeof data.base_url === "string" ? data.base_url.trim() : "";
    if (!token || !baseUrl) {
        return null;
    }
    const rawHeaders = asRecord(data.headers);
    const headers = Object.fromEntries(Object.entries(rawHeaders).filter((entry) => typeof entry[0] === "string" && typeof entry[1] === "string"));
    const expiresAt = typeof data.expires_at === "number" && Number.isFinite(data.expires_at)
        ? new Date(data.expires_at * 1000).toISOString()
        : null;
    return {
        token,
        baseUrl: normalizeGitLabBaseUrl(baseUrl),
        expiresAt,
        headers,
    };
}
export function getCachedGitLabDirectAccess(providerSpecificData, minValidityMs = 60_000) {
    const data = asRecord(providerSpecificData);
    const cache = data.gitlabDirectAccess ?? data.directAccessCache;
    const parsed = parseGitLabDirectAccessDetails(cache);
    if (!parsed) {
        return null;
    }
    if (!parsed.expiresAt) {
        return parsed;
    }
    const expiresAtMs = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now() + minValidityMs) {
        return null;
    }
    return parsed;
}
export function isGitLabDirectAccessDisabled(status, bodyText) {
    return status === 403 && bodyText.toLowerCase().includes("direct connections are disabled");
}
/**
 * #10365 / #10499 / #12958: same predicate the chat-path executor
 * (open-sse/executors/gitlab.ts) uses to decide whether a failed `direct_access`
 * exchange should fall back to the public Code Suggestions completions endpoint
 * instead of surfacing a hard error. A rejected exchange (401 — invalid/expired
 * direct_access grant) or ANY 403 (an explicitly disabled direct-connections tenant,
 * or an entitlement/scope-resolution failure GitLab does not document a distinct
 * status for — #12958) both mean "direct mode unavailable, but the public monolith
 * endpoint may still work" — never a definitive "the token itself is bad" signal on
 * their own. `isGitLabDirectAccessDisabled()` stays available for log/diagnostic
 * labeling; it no longer gates this decision.
 */
export function shouldFallbackToPublicCodeSuggestions(status, _bodyText) {
    return status === 401 || status === 403;
}
/** Headers for a public Code Suggestions completions probe (chat path and connection test). */
export function buildGitLabDuoProbeHeaders(token) {
    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}
/**
 * Minimal, side-effect-free body for the public Code Suggestions completions probe.
 * Only used to confirm the token is accepted by the fallback endpoint — never sent
 * as a real completion request.
 */
export function buildGitLabDuoProbeBody() {
    return {
        current_file: {
            file_name: "connection-test.txt",
            content_above_cursor: "",
            content_below_cursor: "",
        },
        intent: "generation",
        generation_type: "small_file",
        stream: false,
    };
}
