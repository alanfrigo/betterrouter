/* Adapted from miuuyy/codex-chatgpt-web commit 09877fa21ffdbf20979623ef501046fc02a750d7 (MIT). */
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { atomicWriteFile } from "../../config.js";
import { extractChatGptTurnEnvironment, extractChatGptTurnIdentity, extractChatGptThreadSpawnLineage, MissingTrustedCodexEnvironmentError, } from "./environment.js";
const MAX_THREAD_ENVIRONMENTS = 256;
const THREAD_ENVIRONMENT_TTL_MS = 30 * 24 * 60 * 60000;
function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? value
        : undefined;
}
function pathIdentity(value) {
    const normalized = resolve(value);
    return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}
function contains(root, path) {
    const rel = relative(pathIdentity(root), pathIdentity(path));
    return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}
function absolutePaths(value, field) {
    if (!Array.isArray(value) ||
        value.length === 0 ||
        value.some((path) => typeof path !== "string" || !isAbsolute(path))) {
        throw new Error(`Invalid persisted ChatGPT thread ${field}`);
    }
    const unique = new Map();
    for (const path of value.map((path) => resolve(path))) {
        if (!unique.has(pathIdentity(path)))
            unique.set(pathIdentity(path), path);
    }
    return [...unique.values()];
}
function sandboxPolicy(value, roots, writableRoots) {
    const parsed = record(value);
    if (parsed?.type === "dangerFullAccess") {
        const rootIdentities = new Set(roots.map(pathIdentity));
        if (writableRoots.length !== roots.length ||
            writableRoots.some((path) => !rootIdentities.has(pathIdentity(path)))) {
            throw new Error("Invalid persisted ChatGPT danger-full-access roots");
        }
        return { type: "dangerFullAccess" };
    }
    if (parsed?.type === "workspaceWrite") {
        if (typeof parsed.networkAccess !== "boolean" ||
            writableRoots.some((path) => !roots.some((root) => contains(root, path)))) {
            throw new Error("Invalid persisted ChatGPT workspace-write policy");
        }
        return { type: "workspaceWrite", writableRoots, networkAccess: parsed.networkAccess };
    }
    if (parsed?.type === "readOnly") {
        if (typeof parsed.networkAccess !== "boolean" || writableRoots.length !== 0) {
            throw new Error("Invalid persisted ChatGPT read-only policy");
        }
        return { type: "readOnly", networkAccess: parsed.networkAccess };
    }
    throw new Error("Invalid persisted ChatGPT sandbox policy");
}
function validateStoredEnvironment(value) {
    const parsed = record(value);
    if (!parsed ||
        typeof parsed.cwd !== "string" ||
        !isAbsolute(parsed.cwd) ||
        typeof parsed.updatedAt !== "number") {
        throw new Error("Invalid persisted ChatGPT thread environment");
    }
    const cwd = resolve(parsed.cwd);
    const roots = absolutePaths(parsed.roots, "roots");
    const writableRoots = Array.isArray(parsed.writableRoots) && parsed.writableRoots.length === 0
        ? []
        : absolutePaths(parsed.writableRoots, "writable roots");
    if (!roots.some((root) => contains(root, cwd)))
        throw new Error("Persisted ChatGPT cwd is outside its roots");
    return {
        cwd,
        roots,
        writableRoots,
        sandboxPolicy: sandboxPolicy(parsed.sandboxPolicy, roots, writableRoots),
        updatedAt: parsed.updatedAt,
    };
}
function authority(environment, updatedAt) {
    return {
        cwd: environment.cwd,
        roots: environment.roots,
        writableRoots: environment.writableRoots,
        sandboxPolicy: environment.sandboxPolicy,
        updatedAt,
    };
}
/**
 * Codex emits its trusted environment envelope when a task starts or its environment changes,
 * not on every follow-up. This store carries only that trusted authority across turns. Tool
 * declarations are always taken from the current request and are never persisted.
 */
export class ChatGptThreadEnvironmentStore {
    path;
    now;
    loaded = false;
    threads = new Map();
    constructor(path, now = Date.now) {
        this.path = path;
        this.now = now;
    }
    resolve(parsed) {
        const identity = extractChatGptTurnIdentity(parsed);
        try {
            const environment = extractChatGptTurnEnvironment(parsed);
            if (identity.threadId)
                this.set(identity.threadId, environment);
            return environment;
        }
        catch (error) {
            if (!(error instanceof MissingTrustedCodexEnvironmentError) || !identity.threadId)
                throw error;
            const sameThread = this.get(identity.threadId);
            if (sameThread)
                return {
                    cwd: sameThread.cwd,
                    roots: sameThread.roots,
                    writableRoots: sameThread.writableRoots,
                    sandboxPolicy: sameThread.sandboxPolicy,
                    tools: parsed.context.tools ?? [],
                };
            const lineage = extractChatGptThreadSpawnLineage(parsed);
            if (!lineage)
                throw error;
            const parent = this.get(lineage.parentThreadId);
            if (!parent)
                throw error;
            if (lineage.sandboxType !== parent.sandboxPolicy.type) {
                throw new Error("ChatGPT Web subagent sandbox metadata conflicts with its trusted parent thread");
            }
            if (lineage.workspaceRoots.length > 0 &&
                !lineage.workspaceRoots.some((root) => contains(root, parent.cwd))) {
                throw new Error("ChatGPT Web subagent workspace metadata does not contain its trusted parent cwd");
            }
            if (lineage.workspaceRoots.some((root) => !parent.roots.some((parentRoot) => contains(parentRoot, root) || contains(root, parentRoot)))) {
                throw new Error("ChatGPT Web subagent workspace metadata conflicts with its trusted parent roots");
            }
            const inherited = {
                cwd: parent.cwd,
                roots: parent.roots,
                writableRoots: parent.writableRoots,
                sandboxPolicy: parent.sandboxPolicy,
                tools: parsed.context.tools ?? [],
            };
            this.set(lineage.threadId, inherited);
            return inherited;
        }
    }
    get(threadId) {
        this.load();
        const stored = this.threads.get(threadId);
        if (!stored)
            return undefined;
        if (this.now() - stored.updatedAt > THREAD_ENVIRONMENT_TTL_MS) {
            this.threads.delete(threadId);
            this.persist();
            return undefined;
        }
        return stored;
    }
    set(threadId, environment) {
        this.load();
        this.threads.delete(threadId);
        this.threads.set(threadId, authority(environment, this.now()));
        while (this.threads.size > MAX_THREAD_ENVIRONMENTS) {
            const oldest = this.threads.keys().next().value;
            if (!oldest)
                break;
            this.threads.delete(oldest);
        }
        this.persist();
    }
    load() {
        if (this.loaded)
            return;
        this.loaded = true;
        if (!this.path || !existsSync(this.path))
            return;
        const parsed = JSON.parse(readFileSync(this.path, "utf8"));
        const rawThreads = record(parsed.threads);
        if (parsed.version !== 1 || !rawThreads) {
            throw new Error(`Invalid ChatGPT thread environment store: ${this.path}`);
        }
        const cutoff = this.now() - THREAD_ENVIRONMENT_TTL_MS;
        const entries = Object.entries(rawThreads)
            .map(([threadId, value]) => [threadId, validateStoredEnvironment(value)])
            .filter(([, environment]) => environment.updatedAt >= cutoff)
            .sort((left, right) => left[1].updatedAt - right[1].updatedAt)
            .slice(-MAX_THREAD_ENVIRONMENTS);
        for (const [threadId, environment] of entries)
            this.threads.set(threadId, environment);
    }
    persist() {
        if (!this.path)
            return;
        const payload = {
            version: 1,
            threads: Object.fromEntries(this.threads),
        };
        atomicWriteFile(this.path, `${JSON.stringify(payload, null, 2)}\n`);
    }
}
