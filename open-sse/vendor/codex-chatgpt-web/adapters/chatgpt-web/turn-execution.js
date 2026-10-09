/* Adapted from miuuyy/codex-chatgpt-web v4.0.7 commit b59d7dc51b84fb1f465ff1d00f5207f3b2b4a494 (MIT). */
import { createHash } from "node:crypto";
import { chatGptBrowserTabClosedError } from "./adapter-error.js";
import { extractChatGptCompactionSourceRevision, extractChatGptTurnIdentity, extractChatGptTurnUserRevision, } from "./environment.js";
import { MAX_CHATGPT_BROWSER_TABS } from "./concurrency.js";
function awaitWithAbort(promise, signal) {
    if (!signal)
        return promise;
    if (signal.aborted) {
        // Keep the underlying retirement promise observed even when the caller arrived after abort;
        // another owner may still depend on its eventual settlement and rejection must not become an
        // unhandled process-level error.
        void promise.catch(() => { });
        return Promise.reject(new DOMException("ChatGPT web turn aborted", "AbortError"));
    }
    return new Promise((resolve, reject) => {
        const onAbort = () => reject(new DOMException("ChatGPT web turn aborted", "AbortError"));
        signal.addEventListener("abort", onAbort, { once: true });
        promise.then((value) => {
            signal.removeEventListener("abort", onAbort);
            resolve(value);
        }, (error) => {
            signal.removeEventListener("abort", onAbort);
            reject(error);
        });
    });
}
export class ChatGptTraceFeed {
    queued = [];
    waiters = new Set();
    push(event) {
        const normalized = event.continuation ? event.text : event.text.trim();
        if (!normalized)
            return;
        const normalizedEvent = { ...event, text: normalized };
        this.queued.push(normalizedEvent);
        const waiter = this.waiters.values().next().value;
        if (!waiter)
            return;
        this.waiters.delete(waiter);
        if (waiter.signal && waiter.onAbort)
            waiter.signal.removeEventListener("abort", waiter.onAbort);
        waiter.resolve();
    }
    drain() {
        return this.queued.splice(0);
    }
    wait(signal) {
        if (this.queued.length > 0)
            return Promise.resolve();
        if (signal?.aborted)
            return Promise.reject(new DOMException("trace wait aborted", "AbortError"));
        return new Promise((resolveWait, rejectWait) => {
            const waiter = {
                resolve: resolveWait,
                reject: rejectWait,
                ...(signal ? { signal } : {}),
            };
            if (signal) {
                waiter.onAbort = () => {
                    this.waiters.delete(waiter);
                    rejectWait(new DOMException("trace wait aborted", "AbortError"));
                };
                signal.addEventListener("abort", waiter.onAbort, { once: true });
            }
            this.waiters.add(waiter);
        });
    }
}
/** Append-only browser Markdown feed. Waiters are notifications; `drain` owns consumption. */
export class ChatGptTextFeed {
    queued = [];
    waiters = new Set();
    text = "";
    push(delta) {
        if (!delta)
            return;
        this.text += delta;
        this.queued.push(delta);
        const waiter = this.waiters.values().next().value;
        if (!waiter)
            return;
        this.waiters.delete(waiter);
        if (waiter.signal && waiter.onAbort)
            waiter.signal.removeEventListener("abort", waiter.onAbort);
        waiter.resolve();
    }
    drain() {
        return this.queued.splice(0);
    }
    value() {
        return this.text;
    }
    wait(signal) {
        if (this.queued.length > 0)
            return Promise.resolve();
        if (signal?.aborted)
            return Promise.reject(new DOMException("text wait aborted", "AbortError"));
        return new Promise((resolveWait, rejectWait) => {
            const waiter = {
                resolve: resolveWait,
                reject: rejectWait,
                ...(signal ? { signal } : {}),
            };
            if (signal) {
                waiter.onAbort = () => {
                    this.waiters.delete(waiter);
                    rejectWait(new DOMException("text wait aborted", "AbortError"));
                };
                signal.addEventListener("abort", waiter.onAbort, { once: true });
            }
            this.waiters.add(waiter);
        });
    }
}
function executionKey(parsed, payload) {
    return createHash("sha256")
        .update(JSON.stringify({
        modelId: parsed.modelId,
        reasoning: parsed.options.reasoning,
        payload,
    }))
        .digest("hex");
}
function compactionInputRevision(parsed) {
    const body = parsed._rawBody;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new Error("ChatGPT web compaction requires the complete native Codex request body");
    }
    const input = body.input;
    if (!Array.isArray(input)) {
        throw new Error("ChatGPT web compaction requires the complete native Codex input history");
    }
    return input;
}
export function chatGptTurnExecutionKey(parsed) {
    const identity = extractChatGptTurnIdentity(parsed);
    if (!identity.turnId)
        throw new Error("ChatGPT web requires native Codex turn_id metadata for browser-session replay");
    return executionKey(parsed, {
        threadId: identity.threadId,
        turnId: identity.turnId,
        purpose: parsed._compactionRequest ? "compaction" : "response",
        revision: parsed._compactionRequest
            ? compactionInputRevision(parsed)
            : extractChatGptTurnUserRevision(parsed),
    });
}
/** Exact canonical Responses request identity inside one long-lived browser execution. */
export function chatGptTurnRoundKey(parsed) {
    const identity = extractChatGptTurnIdentity(parsed);
    if (!identity.turnId)
        throw new Error("ChatGPT web requires native Codex turn_id metadata for round replay");
    const body = parsed._rawBody;
    if (!body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        !Array.isArray(body.input)) {
        throw new Error("ChatGPT web requires the complete native Codex input for round replay");
    }
    return executionKey(parsed, {
        threadId: identity.threadId,
        turnId: identity.turnId,
        purpose: parsed._compactionRequest ? "compaction" : "response",
        input: body.input,
    });
}
/** Stable identity for limiting automatic retries of one native Codex turn. */
export function chatGptTurnRetryKey(parsed) {
    const identity = extractChatGptTurnIdentity(parsed);
    if (!identity.turnId)
        throw new Error("ChatGPT web requires native Codex turn_id metadata for browser-turn retry budgeting");
    return createHash("sha256")
        .update(JSON.stringify({
        threadId: identity.threadId,
        turnId: identity.turnId,
        purpose: parsed._compactionRequest ? "compaction" : "response",
    }))
        .digest("hex");
}
/** One native Codex thread may own at most one live ChatGPT browser surface. */
export function chatGptThreadOwnershipKey(parsed) {
    const identity = extractChatGptTurnIdentity(parsed);
    const owner = identity.threadId
        ? { kind: "thread", id: identity.threadId }
        : identity.promptCacheKey
            ? { kind: "prompt_cache", id: identity.promptCacheKey }
            : identity.turnId
                ? { kind: "turn", id: identity.turnId }
                : undefined;
    if (!owner)
        throw new Error("ChatGPT web requires native Codex turn identity metadata for browser ownership");
    return createHash("sha256").update(JSON.stringify(owner)).digest("hex");
}
/** Locate the browser response that a native mid-turn compaction replaces. */
export function chatGptCompactionSourceExecutionKey(parsed) {
    const identity = extractChatGptTurnIdentity(parsed);
    if (!identity.turnId)
        throw new Error("ChatGPT web requires native Codex turn_id metadata for browser-session replay");
    const source = extractChatGptCompactionSourceRevision(parsed);
    return executionKey(parsed, {
        threadId: identity.threadId,
        turnId: source.turnId ?? identity.turnId,
        purpose: "response",
        revision: source.content,
    });
}
export class ChatGptTurnSession {
    runtime;
    traceId;
    ownerKey;
    createdAt = Date.now();
    lastTouchedAt = this.createdAt;
    browserOutcome;
    physicalSettlement;
    outstandingById = new Map();
    deliveredResultIds = new Set();
    outstandingReasoning = [];
    finalReasoning = [];
    outstandingPrelude = [];
    finalPrelude = [];
    settledBrowserOutcome;
    settledPhysical = false;
    tail = Promise.resolve();
    capabilityRetirementScheduled = false;
    rounds = new Map();
    constructor(runtime, traceId, ownerKey) {
        this.runtime = runtime;
        this.traceId = traceId;
        this.ownerKey = ownerKey;
        this.physicalSettlement = runtime.physicalSettlement.then(() => {
            this.settledPhysical = true;
        }, (error) => {
            this.settledPhysical = true;
            throw error;
        });
        this.browserOutcome = runtime.browser
            .then((answer) => ({ type: "final", answer }))
            .catch((error) => ({
            type: "error",
            error: error instanceof Error ? error : new Error(String(error)),
        }))
            .then((outcome) => {
            this.settledBrowserOutcome = outcome;
            return outcome;
        });
    }
    runExclusive(task) {
        this.touch();
        const run = this.tail.then(task);
        this.tail = run.then(() => undefined, () => undefined);
        this.scheduleCapabilityRetirement();
        return run;
    }
    touch() {
        this.lastTouchedAt = Date.now();
    }
    lastUsedAt() {
        return this.lastTouchedAt;
    }
    outstanding() {
        return [...this.outstandingById.values()];
    }
    settledOutcome() {
        return this.settledBrowserOutcome;
    }
    conversationKey() {
        return this.runtime.conversationKey;
    }
    isActive() {
        return this.settledBrowserOutcome === undefined;
    }
    /** The client-visible browser result can settle before launcher/helper cleanup does. */
    isPhysicallySettled() {
        return this.settledPhysical;
    }
    setOutstanding(requests, reasoning = [], prelude = []) {
        if (this.outstandingById.size > 0)
            throw new Error("cannot emit a new ChatGPT tool batch while the previous batch is unresolved");
        for (const request of requests) {
            if (this.deliveredResultIds.has(request.callId) || this.outstandingById.has(request.callId)) {
                throw new Error(`duplicate ChatGPT bridge tool call id: ${request.callId}`);
            }
            this.outstandingById.set(request.callId, request);
        }
        this.outstandingReasoning = [...reasoning];
        this.outstandingPrelude = [...prelude];
    }
    hasOutstanding(callId) {
        return this.outstandingById.has(callId);
    }
    markResultDelivered(callId) {
        if (!this.outstandingById.delete(callId))
            throw new Error(`ChatGPT bridge tool result does not match an outstanding call: ${callId}`);
        this.deliveredResultIds.add(callId);
        if (this.outstandingById.size === 0) {
            this.outstandingReasoning = [];
            this.outstandingPrelude = [];
        }
    }
    reasoningForOutstandingReplay() {
        return [...this.outstandingReasoning];
    }
    eventsForOutstandingReplay() {
        return [...this.outstandingPrelude];
    }
    setFinalReasoning(reasoning) {
        this.finalReasoning = [...reasoning];
    }
    reasoningForFinalReplay() {
        return [...this.finalReasoning];
    }
    setFinalEvents(events) {
        this.finalPrelude = [...events];
    }
    eventsForFinalReplay() {
        return [...this.finalPrelude];
    }
    roundEvents(key) {
        return [...this.round(key).events];
    }
    roundReasoning(key) {
        return [...this.round(key).reasoning];
    }
    appendRoundEvent(key, event) {
        this.appendRoundEvents(key, [event]);
    }
    appendRoundEvents(key, events) {
        if (events.length === 0)
            return;
        const round = this.round(key);
        if (round.completed)
            throw new Error("cannot append to a completed ChatGPT native round");
        round.events.push(...events);
    }
    appendRoundReasoning(key, values) {
        if (values.length === 0)
            return;
        const round = this.round(key);
        if (round.completed)
            throw new Error("cannot append reasoning to a completed ChatGPT native round");
        round.reasoning.push(...values);
    }
    completeRound(key) {
        this.round(key).completed = true;
    }
    failRound(key, error) {
        const round = this.round(key);
        round.failure = error;
        round.completed = true;
    }
    roundCompleted(key) {
        return this.rounds.get(key)?.completed === true;
    }
    roundFailure(key) {
        return this.rounds.get(key)?.failure;
    }
    roundHasTerminalEvent(key) {
        return (this.rounds
            .get(key)
            ?.events.some((event) => event.type === "done" || event.type === "error") === true);
    }
    cancel(reason) {
        this.runtime.cancel(reason);
    }
    scheduleCapabilityRetirement() {
        if (this.capabilityRetirementScheduled || !this.runtime.retireCapability)
            return;
        this.capabilityRetirementScheduled = true;
        // Register only after the first observer entered `runExclusive`. This ensures an immediately
        // completed mocked/real browser cannot revoke its token ahead of the browser-outcome branch.
        // At physical settlement, read the current tail so every tool-result/reconnect observer that
        // was already admitted finishes before the capability is retired.
        void this.physicalSettlement
            .then(() => this.tail)
            .then(() => this.runtime.retireCapability())
            .catch((error) => {
            console.error(`[chatgpt-web] failed to retire settled turn capability: ${error instanceof Error ? error.message : String(error)}`);
        });
    }
    round(key) {
        let round = this.rounds.get(key);
        if (round)
            return round;
        round = { events: [], reasoning: [], completed: false };
        this.rounds.set(key, round);
        while (this.rounds.size > 512) {
            const oldestCompleted = [...this.rounds].find(([, candidate]) => candidate.completed);
            if (!oldestCompleted) {
                throw new Error("ChatGPT native round journal is full (512 unfinished rounds)");
            }
            this.rounds.delete(oldestCompleted[0]);
        }
        return round;
    }
}
export class ChatGptTurnSessions {
    ttlMs;
    maxEntries;
    entries = new Map();
    conversationHeads = new Map();
    retirements = new Map();
    ownerRetirements = new Map();
    conversationRetirements = new Map();
    constructor(ttlMs = 30 * 60000, maxEntries = 256) {
        this.ttlMs = ttlMs;
        this.maxEntries = maxEntries;
    }
    getOrCreate(key, start, traceId, ownerKey) {
        this.prune();
        const existing = this.entries.get(key);
        if (existing) {
            existing.touch();
            return existing;
        }
        const active = [...this.entries.values()].filter((session) => session.isActive()).length;
        if (active >= MAX_CHATGPT_BROWSER_TABS) {
            throw new Error(`ChatGPT Web supports at most ${MAX_CHATGPT_BROWSER_TABS} simultaneous browser turns; close or finish a browser tab before starting another`);
        }
        if (this.entries.size >= this.maxEntries)
            throw new Error(`ChatGPT web session registry is full (${this.maxEntries} entries)`);
        const session = new ChatGptTurnSession(start(), traceId, ownerKey);
        this.entries.set(key, session);
        const conversationKey = session.conversationKey();
        if (conversationKey)
            this.conversationHeads.set(conversationKey, session);
        return session;
    }
    async getOrCreateAfterOwnerRetirement(key, ownerKey, start, traceId, signal) {
        for (;;) {
            if (signal?.aborted)
                throw new DOMException("ChatGPT web turn aborted", "AbortError");
            const existing = this.entries.get(key);
            if (existing) {
                existing.touch();
                return existing;
            }
            const pending = this.retirements.get(key) ?? this.ownerRetirements.get(ownerKey);
            if (pending) {
                await awaitWithAbort(pending, signal);
                continue;
            }
            const activeOwner = [...this.entries].find(([ownedKey, session]) => ownedKey !== key && session.ownerKey === ownerKey && !session.isPhysicallySettled());
            if (activeOwner) {
                const [, ownedSession] = activeOwner;
                // A different native message for the same thread is sequential work, not permission to
                // kill the response already using that retained conversation. Wait for its complete
                // browser/launcher settlement; explicit tab close and lifecycle cancellation remain the
                // only paths that preempt an active owner.
                await awaitWithAbort(ownedSession.physicalSettlement, signal);
                continue;
            }
            if (signal?.aborted)
                throw new DOMException("ChatGPT web turn aborted", "AbortError");
            return this.getOrCreate(key, start, traceId, ownerKey);
        }
    }
    find(key) {
        const session = this.entries.get(key);
        session?.touch();
        return session;
    }
    findConversationHead(conversationKey) {
        const session = this.conversationHeads.get(conversationKey);
        session?.touch();
        return session;
    }
    async retireConversationAndWait(conversationKey) {
        const pending = this.conversationRetirements.get(conversationKey);
        if (pending) {
            await pending;
            return 0;
        }
        const matches = [...this.entries].filter(([, session]) => session.conversationKey() === conversationKey);
        if (matches.length === 0)
            return 0;
        this.conversationHeads.delete(conversationKey);
        for (const [key, session] of matches) {
            if (this.entries.get(key) === session)
                this.entries.delete(key);
            if (session.isActive())
                session.cancel();
        }
        const release = matches.findLast(([, session]) => session.runtime.releaseRetainedConversation !== undefined)?.[1].runtime.releaseRetainedConversation;
        const retirement = Promise.all(matches.map(([, session]) => session.physicalSettlement)).then(async () => {
            await release?.();
        });
        this.conversationRetirements.set(conversationKey, retirement);
        try {
            await retirement;
        }
        finally {
            if (this.conversationRetirements.get(conversationKey) === retirement) {
                this.conversationRetirements.delete(conversationKey);
            }
        }
        return matches.length;
    }
    async waitForRetirement(key) {
        await this.retirements.get(key);
    }
    async retireAndWait(key, signal) {
        const pending = this.retirements.get(key);
        if (pending) {
            await awaitWithAbort(pending, signal);
            return true;
        }
        const session = this.entries.get(key);
        if (!session)
            return false;
        this.entries.delete(key);
        this.forgetConversationHead(session);
        await awaitWithAbort(this.beginRetirement(key, session), signal);
        return true;
    }
    retire(key, session) {
        if (this.entries.get(key) !== session)
            return false;
        this.entries.delete(key);
        this.forgetConversationHead(session);
        this.beginRetirement(key, session);
        return true;
    }
    clear() {
        const cancelled = this.entries.size;
        for (const [key, session] of this.entries)
            this.beginRetirement(key, session);
        this.entries.clear();
        this.conversationHeads.clear();
        return cancelled;
    }
    async cancelTrace(traceId, reason = chatGptBrowserTabClosedError()) {
        const sessions = [...this.entries.values()].filter((session) => session.traceId === traceId && session.isActive());
        for (const session of sessions)
            session.cancel(reason);
        await Promise.all(sessions.map((session) => session.physicalSettlement));
        return sessions.length;
    }
    cancelledError(traceId) {
        for (const session of this.entries.values()) {
            if (session.traceId !== traceId)
                continue;
            const outcome = session.settledOutcome();
            if (outcome?.type !== "error")
                continue;
            if ("code" in outcome.error && outcome.error.code === "client_cancelled")
                return outcome.error;
        }
        return undefined;
    }
    activeCount() {
        this.prune();
        let active = 0;
        for (const session of this.entries.values())
            if (session.isActive())
                active += 1;
        return active;
    }
    waitingCount() {
        this.prune();
        let waiting = 0;
        for (const session of this.entries.values())
            if (!session.isActive())
                waiting += 1;
        return waiting;
    }
    prune() {
        const cutoff = Date.now() - this.ttlMs;
        for (const [key, session] of this.entries) {
            if (session.isActive() || session.lastUsedAt() >= cutoff)
                continue;
            session.cancel();
            this.entries.delete(key);
            this.forgetConversationHead(session);
        }
    }
    forgetConversationHead(session) {
        const conversationKey = session.conversationKey();
        if (conversationKey && this.conversationHeads.get(conversationKey) === session) {
            this.conversationHeads.delete(conversationKey);
        }
    }
    beginRetirement(key, session) {
        const existing = this.retirements.get(key);
        if (existing)
            return existing;
        session.cancel();
        const retirement = session.physicalSettlement;
        this.retirements.set(key, retirement);
        void retirement.then(() => {
            if (this.retirements.get(key) === retirement)
                this.retirements.delete(key);
        });
        if (session.ownerKey) {
            const previous = this.ownerRetirements.get(session.ownerKey);
            const ownerRetirement = previous
                ? Promise.all([previous, retirement]).then(() => undefined)
                : retirement;
            this.ownerRetirements.set(session.ownerKey, ownerRetirement);
            void ownerRetirement.then(() => {
                if (this.ownerRetirements.get(session.ownerKey) === ownerRetirement) {
                    this.ownerRetirements.delete(session.ownerKey);
                }
            });
        }
        return retirement;
    }
}
export const chatGptTurnSessions = new ChatGptTurnSessions();
