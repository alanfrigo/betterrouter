/**
 * Browser-TLS-impersonating HTTP client for arena.ai.
 *
 * Thin re-export over the shared `tlsClientBase.ts` factory
 * (`createTlsClientModule`). All provider-agnostic logic (wreq-js transport
 * pooling, direct streaming, proxy resolution, deadlines, Cloudflare challenge
 * detection) lives in the base module; this file supplies only LMArena-specific
 * config and preserves the original public export surface.
 */
import { createTlsClientModule, } from "./tlsClientBase.js";
const DEFAULT_TIMEOUT_MS = 60000;
const HARD_TIMEOUT_GRACE_MS = 10000;
export const tlsClientModule = createTlsClientModule({
    providerName: "LMArena",
    tlsProfile: "chrome_146",
    emulationOs: "windows",
    domain: "https://lmarena.ai",
    // LMArena's proxy resolution domain is hardcoded to arena.ai, not the config domain.
    proxyDomainOverride: "https://arena.ai",
    streamEofPolicy: "none",
    streamEofSymbol: "",
    responseValidation: "cf",
    exportCloudflareCheck: true,
    defaultTimeoutMs: DEFAULT_TIMEOUT_MS,
    hardTimeoutGraceMs: HARD_TIMEOUT_GRACE_MS,
});
export const tlsFetchLMArena = (url, options = {}) => tlsClientModule.tlsFetch(url, options);
export const __setTlsFetchOverrideForTesting = tlsClientModule.__setTlsFetchOverrideForTesting;
export { TlsClientHangError, TlsClientUnavailableError } from "./tlsClientBase.js";
export { isCloudflareChallenge } from "./tlsClientBase.js";
