/**
 * Carries only proven Codex MCP activity into the browser worker.
 *
 * It is deliberately not a completion channel: browser-visible text and terminal state remain
 * owned by the ChatGPT DOM. A valid current-turn tool request only proves that submission was
 * accepted and that the model is still making progress while its DOM is temporarily unavailable.
 */
class ChatGptTurnProgressBroadcaster {
    waiters = new Set();
    waitForChange(afterRevision, signal) {
        if (!Number.isSafeInteger(afterRevision) || afterRevision < 0) {
            throw new Error("ChatGPT external progress revision must be a non-negative safe integer");
        }
        const current = this.snapshot();
        if (current.revision > afterRevision)
            return Promise.resolve(current);
        if (signal?.aborted) {
            return Promise.reject(new DOMException("ChatGPT external progress wait aborted", "AbortError"));
        }
        return new Promise((resolve, reject) => {
            const waiter = {
                afterRevision,
                resolve,
                reject,
                ...(signal ? { signal } : {}),
            };
            if (signal) {
                waiter.onAbort = () => {
                    this.waiters.delete(waiter);
                    reject(new DOMException("ChatGPT external progress wait aborted", "AbortError"));
                };
                signal.addEventListener("abort", waiter.onAbort, { once: true });
            }
            this.waiters.add(waiter);
        });
    }
    notify(snapshot) {
        for (const waiter of [...this.waiters]) {
            if (snapshot.revision <= waiter.afterRevision)
                continue;
            this.waiters.delete(waiter);
            if (waiter.signal && waiter.onAbort) {
                waiter.signal.removeEventListener("abort", waiter.onAbort);
            }
            waiter.resolve(snapshot);
        }
    }
}
export class ChatGptExternalTurnProgress extends ChatGptTurnProgressBroadcaster {
    revision = 0;
    lastToolBatchRevision = 0;
    activeToolCalls = 0;
    lastProgressAt;
    snapshot() {
        return {
            revision: this.revision,
            lastToolBatchRevision: this.lastToolBatchRevision,
            activeToolCalls: this.activeToolCalls,
            ...(this.lastProgressAt !== undefined ? { lastProgressAt: this.lastProgressAt } : {}),
        };
    }
    recordToolBatch(count, now = Date.now()) {
        if (!Number.isSafeInteger(count) || count <= 0) {
            throw new Error("ChatGPT external progress requires a non-empty tool batch");
        }
        this.activeToolCalls += count;
        this.advance(now, "tool_batch");
    }
    recordToolResult(now = Date.now()) {
        if (this.activeToolCalls <= 0) {
            throw new Error("ChatGPT external progress received a tool result without an active call");
        }
        this.activeToolCalls -= 1;
        this.advance(now, "tool_result");
    }
    advance(now, event) {
        if (!Number.isFinite(now))
            throw new Error("ChatGPT external progress timestamp must be finite");
        this.revision += 1;
        if (event === "tool_batch")
            this.lastToolBatchRevision = this.revision;
        this.lastProgressAt = now;
        this.notify(this.snapshot());
    }
}
/**
 * Replays daemon-recorded progress inside the launcher browser helper process.
 *
 * The browser worker runs out of process from the Codex MCP broker, so the recording instance
 * cannot be shared with it. Without a mirror the worker observes no progress at all and its
 * liveness guards silently degrade to "never live", which lets a turn be cancelled while its tool
 * calls are still completing.
 */
export class ChatGptMirroredTurnProgress extends ChatGptTurnProgressBroadcaster {
    current = {
        revision: 0,
        lastToolBatchRevision: 0,
        activeToolCalls: 0,
    };
    snapshot() {
        return { ...this.current };
    }
    /** Ignores stale or replayed frames so out-of-order delivery cannot rewind observed liveness. */
    apply(next) {
        assertChatGptTurnProgressSnapshot(next);
        if (next.revision <= this.current.revision)
            return false;
        // A frame that advances the revision must not contradict what it already reported: the
        // recorder only ever moves these forward, so a regression means a corrupt or forged frame
        // rather than an ordering artefact, and accepting it would desynchronise observed liveness.
        if (next.lastToolBatchRevision < this.current.lastToolBatchRevision ||
            (next.lastProgressAt === undefined && this.current.lastProgressAt !== undefined) ||
            (next.lastProgressAt !== undefined &&
                this.current.lastProgressAt !== undefined &&
                next.lastProgressAt < this.current.lastProgressAt)) {
            throw new Error("ChatGPT external progress snapshot regressed against the observed state");
        }
        this.current = { ...next };
        this.notify(this.snapshot());
        return true;
    }
}
export function assertChatGptTurnProgressSnapshot(value) {
    const finiteIndex = (candidate) => Number.isSafeInteger(candidate) && candidate >= 0;
    if (!value ||
        !finiteIndex(value.revision) ||
        !finiteIndex(value.lastToolBatchRevision) ||
        !finiteIndex(value.activeToolCalls) ||
        value.lastToolBatchRevision > value.revision ||
        (value.lastProgressAt !== undefined && !Number.isFinite(value.lastProgressAt)) ||
        // Any recorded activity stamps a timestamp, so a frame claiming progress without one is
        // malformed and would otherwise report liveness the daemon never observed.
        (value.revision > 0 && value.lastProgressAt === undefined)) {
        throw new Error("ChatGPT external progress snapshot is invalid");
    }
}
export function chatGptExternalProgressIsLive(snapshot, now, graceMs) {
    if (!snapshot)
        return false;
    if (!Number.isFinite(now) || !Number.isFinite(graceMs) || graceMs < 0) {
        throw new Error("ChatGPT external progress liveness inputs are invalid");
    }
    return (snapshot.activeToolCalls > 0 ||
        (snapshot.lastProgressAt !== undefined && now - snapshot.lastProgressAt < graceMs));
}
