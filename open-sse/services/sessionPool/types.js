/**
 * Session Pool — Type Definitions
 *
 * Core types for the anonymous session pool system:
 *   SessionPool  → manages N sessions, each with a unique browser fingerprint
 *   Fingerprint  → UA + headers for one browser-like identity
 *   Session      → state machine tracking one session through its lifecycle
 *   PoolConfig   → hot-reloadable pool parameters
 *   PoolStats    → real-time pool health snapshot
 */
// ─── Defaults ──────────────────────────────────────────────────────────────
export const DEFAULT_POOL_CONFIG = {
    minSessions: 6,
    maxSessions: 20,
    cooldownBase: 1000,
    cooldownMax: 30000,
    cooldownJitter: 5000,
    requestTimeout: 30000,
    requestJitter: 50,
};
