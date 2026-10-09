import { MAXAI_CONSTANTS_SETTINGS_KEY, fetchMaxaiConstants, validateMaxaiConstants, MAXAI_DEFAULT_HEADER_NAMES, } from "./constants.js";
/** In-process memo so the hot signing path never touches the DB or network. */
let memo = null;
let inflight = null;
/** Reset the in-process memo (tests + after a forced refresh). */
export function resetMaxaiConstantsMemo() {
    memo = null;
    inflight = null;
}
/**
 * Test seam: directly seed the in-process memo so unit tests that exercise the
 * signed network functions don't need to also mock the bundle fetch. Not used in
 * production paths (production goes through ensure/refresh → store → extraction).
 */
export function __setMaxaiConstantsForTest(constants) {
    memo = constants;
    inflight = null;
}
/** Shape-guard a persisted record before trusting it. */
function isUsableConstants(v) {
    if (!v || typeof v !== "object")
        return false;
    const c = v;
    return (typeof c.hmacKey === "string" &&
        typeof c.aesKey === "string" &&
        typeof c.appVersion === "string" &&
        typeof c.ctxKey === "string" &&
        typeof c.docIdKey === "string" &&
        !!c.headerNames &&
        typeof c.headerNames === "object");
}
/** Read the persisted constants from settings (validated). Null when absent/invalid. */
export async function getStoredMaxaiConstants() {
    try {
        const { getSettings } = await import("../../../src/lib/db/index.js");
        const settings = await getSettings();
        const raw = settings[MAXAI_CONSTANTS_SETTINGS_KEY];
        if (!isUsableConstants(raw))
            return null;
        // Re-validate on read: a persisted record must still reproduce the vector.
        const withDefaults = {
            ...raw,
            headerNames: { ...MAXAI_DEFAULT_HEADER_NAMES, ...raw.headerNames },
        };
        return validateMaxaiConstants(withDefaults) ? withDefaults : null;
    }
    catch {
        return null;
    }
}
/** Persist a freshly-extracted+validated constants set to settings. */
export async function persistMaxaiConstants(constants) {
    try {
        const { updateSettings } = await import("../../../src/lib/db/index.js");
        await updateSettings({ [MAXAI_CONSTANTS_SETTINGS_KEY]: constants });
    }
    catch {
        // Non-fatal: a persist failure just means the next process re-extracts.
    }
}
/**
 * Return usable MaxAI signing constants, extracting + persisting on a cold store.
 * Order: in-process memo → persisted store → live extraction (validated) → null.
 * Concurrent callers share a single in-flight extraction. Never throws.
 */
export async function ensureMaxaiConstants(opts = {}) {
    if (memo)
        return memo;
    const stored = await getStoredMaxaiConstants();
    if (stored) {
        memo = stored;
        return memo;
    }
    if (inflight)
        return inflight;
    inflight = (async () => {
        try {
            const fresh = await fetchMaxaiConstants(opts);
            if (fresh) {
                memo = fresh;
                await persistMaxaiConstants(fresh);
                return fresh;
            }
            return null;
        }
        finally {
            inflight = null;
        }
    })();
    return inflight;
}
/**
 * Force a live re-extraction (used by the daily token refresh). If the fetched
 * set validates AND differs from what's stored, it is persisted + memoized so a
 * MaxAI-side rotation is picked up. Returns the current-best constants (the fresh
 * set on success, else whatever was already stored/memoized). Never throws.
 */
export async function refreshMaxaiConstants(opts = {}) {
    let fresh = null;
    try {
        fresh = await fetchMaxaiConstants(opts);
    }
    catch {
        fresh = null;
    }
    if (fresh) {
        const changed = !memo ||
            memo.hmacKey !== fresh.hmacKey ||
            memo.aesKey !== fresh.aesKey ||
            memo.appVersion !== fresh.appVersion ||
            memo.ctxKey !== fresh.ctxKey ||
            memo.docIdKey !== fresh.docIdKey;
        memo = fresh;
        if (changed)
            await persistMaxaiConstants(fresh);
        return fresh;
    }
    // Fetch failed — keep serving whatever we already have (memo or store).
    return memo ?? (await getStoredMaxaiConstants());
}
