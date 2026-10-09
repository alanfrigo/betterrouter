import { isIP } from "node:net";
import dns from "node:dns";
import { isPrivateHost, parseAndValidateNonMetadataUrl, parseAndValidatePublicUrl, parseOutboundUrl, } from "./outboundUrlGuard.js";
import { getProviderOutboundGuard } from "./webCookieUrlPolicy.js";
// #12569: `createPinnedFetch` now lives in the shared `dnsPinnedFetch.ts` module so the
// webhook outbound-URL guard can reuse the exact same connection-pinning mechanism instead of
// duplicating it. Re-exported here for backward compatibility with existing importers of
// `@/shared/network/remoteImageFetch`.
import { createPinnedFetch } from "./dnsPinnedFetch.js";
export { createPinnedFetch };
const DEFAULT_MAX_REMOTE_IMAGE_BYTES = 20 * 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 3;
const DEFAULT_TIMEOUT_MS = 15000;
function validateRemoteImageUrl(input, guard) {
    if (guard === "public-only")
        return parseAndValidatePublicUrl(input);
    if (guard === "block-metadata")
        return parseAndValidateNonMetadataUrl(input);
    return parseOutboundUrl(input);
}
function requireHttps(url, enabled) {
    if (enabled && url.protocol !== "https:") {
        throw new Error("Remote media requires HTTPS at every redirect hop");
    }
    return url;
}
const defaultLookup = (hostname) => dns.promises.lookup(hostname, { all: true });
/** Resolve every answer, reject the host if any answer is private, then return
 * the validated addresses so the caller can bind the connection to one of them. */
async function assertHostnameResolvesPublic(url, guard, lookup) {
    if (guard !== "public-only")
        return [];
    const hostname = url.hostname;
    const bare = hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
    if (!bare)
        return [];
    if (isIP(bare))
        return [{ address: bare, family: isIP(bare) }];
    let resolved;
    try {
        resolved = await lookup(bare);
    }
    catch {
        throw new Error("Remote image host could not be resolved (blocked)");
    }
    if (!resolved.length) {
        throw new Error("Remote image host could not be resolved (blocked)");
    }
    for (const { address } of resolved) {
        if (isPrivateHost(address)) {
            throw new Error("Remote image host resolves to a blocked private address (DNS rebinding)");
        }
    }
    return resolved;
}
function combineSignals(signal, timeoutMs) {
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    if (!signal)
        return timeoutSignal;
    return AbortSignal.any([signal, timeoutSignal]);
}
async function readResponseBuffer(response, maxBytes) {
    const contentLengthHeader = response.headers.get("content-length");
    const contentLength = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : null;
    if (contentLength !== null && Number.isFinite(contentLength) && contentLength > maxBytes) {
        throw new Error(`Remote image exceeds ${maxBytes} byte limit`);
    }
    if (!response.body) {
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.byteLength > maxBytes) {
            throw new Error(`Remote image exceeds ${maxBytes} byte limit`);
        }
        return buffer;
    }
    const reader = response.body.getReader();
    const chunks = [];
    let totalBytes = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            const chunk = Buffer.from(value);
            totalBytes += chunk.byteLength;
            if (totalBytes > maxBytes) {
                await reader.cancel();
                throw new Error(`Remote image exceeds ${maxBytes} byte limit`);
            }
            chunks.push(chunk);
        }
    }
    finally {
        reader.releaseLock();
    }
    return Buffer.concat(chunks, totalBytes);
}
// #13883: test-only escape hatch for `pinDns: true` callers that have no `fetchImpl` seam
// of their own (imageGeneration.ts / imageUpscale/shared.ts). `createPinnedFetch` opens a
// real undici connection, bypassing a test's monkeypatched `globalThis.fetch`; setting this
// override lets such a test keep exercising its mock instead of a real network attempt.
// Production callers never call the setter, so `pinDns` still pins for real in production.
let pinnedFetchTestOverride;
export function setPinnedFetchTestOverride(fetchImpl) {
    pinnedFetchTestOverride = fetchImpl;
}
export async function fetchRemoteMedia(input, options = {}) {
    const injectedFetch = options.fetchImpl;
    // Default off: production callers that need connection pinning opt in. This keeps
    // globalThis.fetch mockable for image-generation tests and preserves the previous
    // DNS pre-check behavior for non-embedding callers.
    const pinDns = options.pinDns === true;
    const guard = options.guard ?? getProviderOutboundGuard();
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_REMOTE_IMAGE_BYTES;
    const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
    const signal = combineSignals(options.signal, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    const lookup = options.lookup ?? defaultLookup;
    let currentUrl = requireHttps(validateRemoteImageUrl(input, guard), options.enforceHttps === true);
    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
        // DNS-rebinding guard: validate every hop's hostname against its resolved
        // IPs before issuing the request (GHSA-cmhj-wh2f-9cgx).
        const addresses = await assertHostnameResolvesPublic(currentUrl, guard, lookup);
        const fetchImpl = injectedFetch ??
            pinnedFetchTestOverride ??
            (pinDns && addresses.length
                ? createPinnedFetch(addresses[0].address, addresses[0].family)
                : fetch);
        const response = await fetchImpl(currentUrl.toString(), {
            method: "GET",
            redirect: "manual",
            signal,
        });
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get("location");
            if (!location) {
                throw new Error(`Remote image redirect missing Location header (${response.status})`);
            }
            if (redirectCount >= maxRedirects) {
                throw new Error(`Remote image exceeded ${maxRedirects} redirect limit`);
            }
            currentUrl = requireHttps(validateRemoteImageUrl(new URL(location, currentUrl), guard), options.enforceHttps === true);
            continue;
        }
        if (!response.ok) {
            throw new Error(`Remote image fetch error ${response.status}`);
        }
        return {
            buffer: await readResponseBuffer(response, maxBytes),
            contentType: response.headers.get("content-type") || "application/octet-stream",
            url: currentUrl.toString(),
        };
    }
    throw new Error(`Remote image exceeded ${maxRedirects} redirect limit`);
}
/** Backward-compatible image-specific entry point. */
export async function fetchRemoteImage(input, options = {}) {
    return fetchRemoteMedia(input, options);
}
/**
 * Fetch an image from a URL that did NOT originate from an OmniRoute-controlled host: a
 * caller-supplied `image_url` / `image` body field (any of the request-body aliases,
 * `provider_options.*`, message parts) or a result URL echoed back by an upstream provider.
 *
 * GHSA-34rg-3pqj-35g9 / #13883: the SSRF-hardened policy is hard-coded here so it is no longer
 * an opt-in every call site has to remember (omni-code-review LEDGER-32 / LEDGER-50):
 *
 * - `guard: "public-only"` — never the operator outbound policy (`block-metadata` on a
 *   local-first default install), which would let a request body make the server fetch
 *   loopback/LAN URLs and forward the bytes to an image provider. Every resolved DNS answer
 *   is validated, not just the hostname string.
 * - `pinDns: true` — closes the DNS-rebinding TOCTOU: without it, a second, un-pinned
 *   resolution at connect time could answer differently than the validated lookup and bypass
 *   the public-only guard.
 *
 * Any `guard` / `pinDns` the caller passes is overridden; the remaining options (`maxBytes`,
 * `timeoutMs`, `signal`, test seams such as `lookup` / `fetchImpl`) pass through unchanged.
 */
export async function fetchUntrustedRemoteImage(input, opts = {}) {
    return fetchRemoteImage(input, { ...opts, guard: "public-only", pinDns: true });
}
