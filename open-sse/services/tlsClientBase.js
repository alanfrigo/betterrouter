/**
 * Shared browser-impersonating HTTP transport for five web-cookie provider wrappers.
 *
 * Provider wrappers keep their existing `tlsFetch*` APIs while this module owns
 * wreq-js loading, transport pooling, proxy selection, deadlines, byte responses,
 * SSE/NDJSON validation, EOF handling, and cancellation.
 *
 * Every wreq request uses an ephemeral cookie scope. Transports are reused process-wide,
 * bounded by an LRU pool, and keyed by browser profile, emulated OS, and resolved proxy;
 * no cookie jar or session identifier is shared between calls.
 */
import { resolveProxyForRequest } from "../utils/webCookieProxy.js";
import { createWreqTransportClient, WreqRuntimeUnavailableError, } from "../utils/tlsClient.js";
import { resolveTlsClientProxyUrl } from "./tlsClientProxy.js";
export class TlsClientUnavailableError extends Error {
    name = "TlsClientUnavailableError";
}
export class TlsClientHangError extends Error {
    name = "TlsClientHangError";
}
export function makeAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error)
        return reason;
    const error = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    error.name = "AbortError";
    return error;
}
export function toHeaders(raw) {
    const headers = new Headers();
    if (!raw)
        return headers;
    const iterator = raw[Symbol.iterator];
    if (typeof iterator === "function") {
        const iterable = raw;
        const setCookies = typeof iterable.getSetCookie === "function" ? iterable.getSetCookie() : [];
        for (const [name, value] of iterable) {
            if (name.toLowerCase() !== "set-cookie" || setCookies.length === 0) {
                headers.append(name, value);
            }
        }
        for (const value of setCookies)
            headers.append("set-cookie", value);
        return headers;
    }
    for (const [name, values] of Object.entries(raw)) {
        for (const value of values)
            headers.append(name, value);
    }
    return headers;
}
function isReadableBody(body) {
    return body !== null && typeof body !== "string" && typeof body.getReader === "function";
}
function concatChunks(chunks) {
    const length = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
    const combined = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return combined;
}
async function readAllChunks(reader, initialChunks = [], readNext = () => reader.read()) {
    const chunks = [...initialChunks];
    while (true) {
        const next = await readNext();
        if (next.done)
            return concatChunks(chunks);
        chunks.push(next.value);
    }
}
async function readTlsResponseText(response, onReader) {
    if (typeof response.body === "string")
        return response.body;
    if (isReadableBody(response.body)) {
        const reader = response.body.getReader();
        onReader?.(reader);
        return new TextDecoder().decode(await readAllChunks(reader));
    }
    if (typeof response.text === "function")
        return response.text();
    return "";
}
async function readTlsResponseBytes(response, onReader) {
    if (isReadableBody(response.body)) {
        const reader = response.body.getReader();
        onReader?.(reader);
        return readAllChunks(reader);
    }
    if (typeof response.bytes === "function")
        return response.bytes();
    if (typeof response.body === "string")
        return Buffer.from(response.body, "binary");
    return new Uint8Array();
}
export async function raceWithTimeout(promise, timeoutMs, signal) {
    return await new Promise((resolve, reject) => {
        let settled = false;
        let timer;
        const onAbort = () => {
            settle(() => reject(makeAbortError(signal)));
        };
        const cleanup = () => {
            if (timer)
                clearTimeout(timer);
            signal?.removeEventListener("abort", onAbort);
        };
        const settle = (complete) => {
            if (settled)
                return;
            settled = true;
            cleanup();
            complete();
        };
        timer = setTimeout(() => settle(() => reject(new TlsClientHangError())), Math.max(0, timeoutMs));
        if (signal?.aborted) {
            onAbort();
        }
        else {
            signal?.addEventListener("abort", onAbort, { once: true });
        }
        promise.then((value) => settle(() => resolve(value)), (error) => settle(() => reject(error)));
    });
}
/** Return true when a prefix begins with an SSE field or comment marker. */
export function looksLikeSse(text) {
    const trimmed = text.replace(/^[\s\r\n]+/, "");
    if (!trimmed)
        return false;
    if (trimmed.startsWith(":"))
        return true;
    return /^(data|event|id|retry):/i.test(trimmed);
}
/** Return true when a response prefix is a Cloudflare challenge/interstitial. */
export function isCloudflareChallenge(text) {
    if (!text)
        return false;
    return /just a moment|window\._cf_chl_opt|challenges\.cloudflare\.com|attention required|cf-chl/i.test(text);
}
function couldBecomeSsePrefix(text) {
    const trimmed = text.replace(/^[\s\r\n]+/, "").toLowerCase();
    return ["data:", "event:", "id:", "retry:", ":"].some((marker) => marker.startsWith(trimmed));
}
function couldBecomeCloudflareChallenge(text) {
    const trimmed = text.trimStart().toLowerCase();
    return [
        "just a moment",
        "window._cf_chl_opt",
        "challenges.cloudflare.com",
        "attention required",
        "cf-chl",
    ].some((marker) => marker.startsWith(trimmed));
}
function classifyEofControlCandidate(bytes, eofSymbol) {
    const decoded = new TextDecoder().decode(Uint8Array.from(bytes), { stream: true });
    const candidate = decoded.replace(/^[\t\r ]+/, "");
    if (candidate.startsWith(eofSymbol))
        return "matched";
    if (eofSymbol.startsWith(candidate))
        return "possible";
    const dataPrefix = "data:";
    const lowerCandidate = candidate.toLowerCase();
    if (dataPrefix.startsWith(lowerCandidate))
        return "possible";
    if (!lowerCandidate.startsWith(dataPrefix))
        return "not-control";
    const dataValue = candidate.slice(dataPrefix.length).replace(/^[\t ]+/, "");
    if (dataValue.startsWith(eofSymbol))
        return "matched";
    return eofSymbol.startsWith(dataValue) ? "possible" : "not-control";
}
function createEofFilteredStream(reader, initialChunks, eofSymbol, includeEof, readNext, onReadError, onFinalize, signal, hardDeadlineAt) {
    const queued = [...initialChunks];
    const eofBytes = new TextEncoder().encode(eofSymbol);
    let controlCandidate = [];
    let atLineStart = true;
    let closed = false;
    let deadlineTimer;
    let removeAbortListener = () => { };
    let lifecycleCleaned = false;
    const cleanupLifecycle = () => {
        if (lifecycleCleaned)
            return;
        lifecycleCleaned = true;
        if (deadlineTimer)
            clearTimeout(deadlineTimer);
        deadlineTimer = undefined;
        removeAbortListener();
        removeAbortListener = () => { };
        onFinalize();
    };
    const cancelNativeReader = async (reason) => {
        try {
            await reader.cancel(reason);
        }
        catch {
            // Native cancellation is best-effort cleanup; preserve the authoritative stream error.
        }
    };
    const errorStream = (controller, error, notifyReadError) => {
        if (closed)
            return;
        closed = true;
        controlCandidate = [];
        cleanupLifecycle();
        if (notifyReadError)
            onReadError(error);
        void cancelNativeReader(error);
        try {
            controller.error(error);
        }
        catch {
            // The consumer may have closed the stream concurrently.
        }
    };
    return new ReadableStream({
        start(controller) {
            if (signal) {
                const onAbort = () => errorStream(controller, makeAbortError(signal), false);
                if (signal.aborted) {
                    onAbort();
                    return;
                }
                signal.addEventListener("abort", onAbort, { once: true });
                removeAbortListener = () => signal.removeEventListener("abort", onAbort);
            }
            if (Number.isFinite(hardDeadlineAt)) {
                deadlineTimer = setTimeout(() => {
                    errorStream(controller, new TlsClientHangError(), true);
                }, Math.max(0, hardDeadlineAt - Date.now()));
                deadlineTimer.unref?.();
            }
        },
        async pull(controller) {
            while (!closed) {
                let chunk = queued.shift();
                if (!chunk) {
                    let next;
                    try {
                        next = await readNext();
                    }
                    catch (error) {
                        if (closed)
                            return;
                        closed = true;
                        cleanupLifecycle();
                        onReadError(error);
                        await cancelNativeReader(error);
                        controller.error(error);
                        return;
                    }
                    if (closed)
                        return;
                    if (next.done) {
                        if (controlCandidate.length > 0) {
                            controller.enqueue(Uint8Array.from(controlCandidate));
                        }
                        controlCandidate = [];
                        closed = true;
                        cleanupLifecycle();
                        controller.close();
                        return;
                    }
                    chunk = next.value;
                }
                if (eofBytes.byteLength === 0) {
                    controller.enqueue(chunk);
                    return;
                }
                const output = [];
                let eofReached = false;
                for (const byte of chunk) {
                    if (!atLineStart) {
                        output.push(byte);
                        if (byte === 0x0a || byte === 0x0d)
                            atLineStart = true;
                        continue;
                    }
                    if (byte === 0x0a || byte === 0x0d) {
                        for (const candidateByte of controlCandidate)
                            output.push(candidateByte);
                        controlCandidate = [];
                        output.push(byte);
                        continue;
                    }
                    controlCandidate.push(byte);
                    const classification = classifyEofControlCandidate(controlCandidate, eofSymbol);
                    if (classification === "matched") {
                        if (includeEof) {
                            for (const candidateByte of controlCandidate)
                                output.push(candidateByte);
                        }
                        controlCandidate = [];
                        eofReached = true;
                        break;
                    }
                    if (classification === "not-control") {
                        for (const candidateByte of controlCandidate)
                            output.push(candidateByte);
                        controlCandidate = [];
                        atLineStart = false;
                    }
                }
                if (eofReached) {
                    if (output.length > 0)
                        controller.enqueue(Uint8Array.from(output));
                    closed = true;
                    cleanupLifecycle();
                    await cancelNativeReader("TLS stream EOF reached");
                    controller.close();
                    return;
                }
                if (output.length > 0) {
                    controller.enqueue(Uint8Array.from(output));
                    return;
                }
            }
        },
        async cancel(reason) {
            closed = true;
            controlCandidate = [];
            cleanupLifecycle();
            await cancelNativeReader(reason);
        },
    });
}
/** Create a provider facade over the shared ephemeral-cookie wreq transport pool. */
export function createGetClient(config) {
    const browser = config.tlsProfile ?? "chrome_146";
    const os = config.emulationOs ?? "macos";
    const wreqClient = createWreqTransportClient({
        browser,
        os,
        runtimeLoader: config.wreqRuntimeLoader,
    });
    const client = {
        request(url, options) {
            const wreqRequest = wreqClient.request(url, options);
            const adapted = wreqRequest.catch((error) => {
                if (!(error instanceof WreqRuntimeUnavailableError))
                    throw error;
                throw new TlsClientUnavailableError(`wreq-js 3.2.x is not installed or unsupported on this platform — ` +
                    `cannot start browser transport for ${config.providerName}`);
            });
            Object.defineProperties(adapted, {
                invalidateTransport: {
                    value: () => wreqRequest.invalidateTransport(),
                },
                releaseTransport: {
                    value: () => wreqRequest.releaseTransport(),
                },
            });
            return adapted;
        },
    };
    return async () => client;
}
/** Resolve a per-call/provider/dashboard proxy for a browser-transport request. */
export function resolveProxyUrl(domain, perCall) {
    return resolveTlsClientProxyUrl(domain, perCall, resolveProxyForRequest);
}
/** Build one provider-specific facade over the shared wreq-js transport. */
export function createTlsClientModule(config) {
    const { providerName, tlsProfile, emulationOs = "macos", domain, streamEofSymbol = "[DONE]", defaultTimeoutMs = 60000, hardTimeoutGraceMs = 10000, firstByteTimeoutMs = 5000, responseValidation, proxyDomainOverride, exportCloudflareCheck, wreqRuntimeLoader, } = config;
    const streamEofPolicy = config.streamEofPolicy ?? (config.tailFileVariant === "A" ? "include" : "exclude");
    const getClient = createGetClient({
        providerName,
        tlsProfile,
        emulationOs,
        wreqRuntimeLoader,
    });
    let testOverride = null;
    const invalidateOnHang = (client, requestOptions, error, request) => {
        if (!(error instanceof TlsClientHangError))
            return;
        if (request?.invalidateTransport)
            request.invalidateTransport();
        else
            client.invalidateTransport?.(requestOptions);
    };
    const releaseRequest = (request) => {
        request?.releaseTransport?.();
    };
    const cancelResponseBody = async (body, reason) => {
        try {
            await body.cancel(reason);
        }
        catch {
            // Cleanup must not replace the authoritative timeout, abort, or response classification.
        }
    };
    async function tlsFetchStreaming(client, url, requestOptions, eofSymbol, signal, hardTimeoutMs, firstByteMs = firstByteTimeoutMs) {
        const startedAt = Date.now();
        const hardDeadlineAt = startedAt + hardTimeoutMs;
        const firstByteDeadlineAt = Number.isFinite(firstByteMs)
            ? startedAt + Math.max(0, firstByteMs)
            : Number.POSITIVE_INFINITY;
        const remainingHardTimeoutMs = () => Math.max(0, hardDeadlineAt - Date.now());
        let reader = null;
        let request = null;
        let leaseTransferredToStream = false;
        try {
            request = client.request(url, requestOptions);
            const response = await raceWithTimeout(request, remainingHardTimeoutMs(), signal);
            if (!isReadableBody(response.body)) {
                const text = await raceWithTimeout(readTlsResponseText(response), remainingHardTimeoutMs(), signal);
                return { status: response.status, headers: toHeaders(response.headers), text, body: null };
            }
            reader = response.body.getReader();
            const activeReader = reader;
            const readBeforeHardDeadline = () => raceWithTimeout(activeReader.read(), remainingHardTimeoutMs(), signal);
            const initialChunks = [];
            const readFirstNonEmptyChunk = async () => {
                while (true) {
                    const result = await readBeforeHardDeadline();
                    if (result.done || result.value.byteLength > 0)
                        return result;
                }
            };
            const firstRead = readFirstNonEmptyChunk();
            let firstResult;
            let firstByteTimedOut = Date.now() >= firstByteDeadlineAt;
            if (Number.isFinite(firstByteMs) && !firstByteTimedOut) {
                let timer;
                try {
                    const timed = await Promise.race([
                        firstRead.then((result) => ({ kind: "read", result })),
                        new Promise((resolve) => {
                            timer = setTimeout(() => resolve({ kind: "timeout" }), Math.max(0, firstByteDeadlineAt - Date.now()));
                        }),
                    ]);
                    if (timed.kind === "timeout") {
                        firstByteTimedOut = true;
                        firstResult = await firstRead;
                    }
                    else {
                        firstResult = timed.result;
                    }
                }
                finally {
                    if (timer)
                        clearTimeout(timer);
                }
            }
            else {
                firstResult = await firstRead;
            }
            if (!firstResult.done)
                initialChunks.push(firstResult.value);
            if (firstByteTimedOut) {
                const bytes = await readAllChunks(activeReader, initialChunks, readBeforeHardDeadline);
                return {
                    status: response.status,
                    headers: toHeaders(response.headers),
                    text: new TextDecoder().decode(bytes),
                    body: null,
                };
            }
            let previewBytes = concatChunks(initialChunks).subarray(0, 256);
            let preview = new TextDecoder().decode(previewBytes, { stream: true });
            let previewReachedEof = firstResult.done;
            while (!previewReachedEof &&
                previewBytes.byteLength < 256 &&
                ((responseValidation === "sse" &&
                    !looksLikeSse(preview) &&
                    couldBecomeSsePrefix(preview)) ||
                    (responseValidation === "cf" &&
                        !isCloudflareChallenge(preview) &&
                        (preview.trimStart().startsWith("<") || couldBecomeCloudflareChallenge(preview))))) {
                const next = await readBeforeHardDeadline();
                if (next.done) {
                    previewReachedEof = true;
                    break;
                }
                initialChunks.push(next.value);
                previewBytes = concatChunks(initialChunks).subarray(0, 256);
                preview = new TextDecoder().decode(previewBytes, { stream: true });
            }
            if (previewReachedEof && previewBytes.byteLength === 0) {
                return {
                    status: response.status,
                    headers: toHeaders(response.headers),
                    text: "",
                    body: null,
                };
            }
            if (responseValidation === "cf" && isCloudflareChallenge(preview)) {
                await cancelResponseBody(activeReader, "Cloudflare challenge");
                return {
                    status: 403,
                    headers: new Headers({ "Content-Type": "text/html" }),
                    text: preview,
                    body: null,
                };
            }
            if (responseValidation === "cf" && preview.trimStart().startsWith("<")) {
                await cancelResponseBody(activeReader, "HTML response");
                return {
                    status: 502,
                    headers: new Headers({ "Content-Type": "text/html" }),
                    text: preview,
                    body: null,
                };
            }
            if (response.status < 200 || response.status >= 300) {
                const bytes = await readAllChunks(activeReader, initialChunks, readBeforeHardDeadline);
                return {
                    status: response.status,
                    headers: toHeaders(response.headers),
                    text: new TextDecoder().decode(bytes),
                    body: null,
                };
            }
            if (responseValidation === "sse" && !looksLikeSse(preview)) {
                const bytes = await readAllChunks(activeReader, initialChunks, readBeforeHardDeadline);
                return {
                    status: response.status,
                    headers: toHeaders(response.headers),
                    text: new TextDecoder().decode(bytes),
                    body: null,
                };
            }
            const headers = toHeaders(response.headers);
            headers.set("Content-Type", responseValidation === "cf" ? "application/x-ndjson" : "text/event-stream");
            headers.set("Cache-Control", "no-cache");
            const stream = createEofFilteredStream(activeReader, initialChunks, streamEofPolicy === "none" ? "" : eofSymbol, streamEofPolicy === "include", readBeforeHardDeadline, (error) => invalidateOnHang(client, requestOptions, error, request), () => releaseRequest(request), signal, hardDeadlineAt);
            leaseTransferredToStream = true;
            reader = null;
            return { status: 200, headers, text: null, body: stream };
        }
        catch (error) {
            invalidateOnHang(client, requestOptions, error, request);
            if (reader)
                await cancelResponseBody(reader, error);
            throw error;
        }
        finally {
            if (!leaseTransferredToStream)
                releaseRequest(request);
        }
    }
    async function tlsFetch(url, options = {}) {
        const resolvedProxyUrl = resolveProxyUrl(proxyDomainOverride ?? domain, options.proxyUrl);
        if (testOverride)
            return testOverride(url, { ...options, proxyUrl: resolvedProxyUrl });
        if (options.signal?.aborted)
            throw makeAbortError(options.signal);
        const client = await getClient();
        if (options.signal?.aborted)
            throw makeAbortError(options.signal);
        const requestOptions = {
            method: options.method || "GET",
            headers: options.headers || {},
            body: options.body,
            timeoutMilliseconds: options.timeoutMs ?? defaultTimeoutMs,
            proxyUrl: resolvedProxyUrl,
            signal: options.signal,
        };
        const hardTimeoutMs = (options.timeoutMs ?? defaultTimeoutMs) + hardTimeoutGraceMs;
        if (options.stream) {
            return tlsFetchStreaming(client, url, requestOptions, options.streamEofSymbol ?? streamEofSymbol, options.signal ?? null, hardTimeoutMs, firstByteTimeoutMs);
        }
        const hardDeadlineAt = Date.now() + hardTimeoutMs;
        const remainingHardTimeoutMs = () => Math.max(0, hardDeadlineAt - Date.now());
        let response = null;
        let bodyReader = null;
        let request = null;
        try {
            request = client.request(url, requestOptions);
            response = await raceWithTimeout(request, remainingHardTimeoutMs(), options.signal ?? null);
            if (options.signal?.aborted)
                throw makeAbortError(options.signal);
            const headers = toHeaders(response.headers);
            if (options.byteResponse) {
                const bytes = await raceWithTimeout(readTlsResponseBytes(response, (reader) => {
                    bodyReader = reader;
                }), remainingHardTimeoutMs(), options.signal ?? null);
                bodyReader = null;
                const mime = headers.get("content-type")?.split(";", 1)[0]?.trim() || "application/octet-stream";
                return {
                    status: response.status,
                    headers,
                    text: `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`,
                    body: null,
                };
            }
            const text = await raceWithTimeout(readTlsResponseText(response, (reader) => {
                bodyReader = reader;
            }), remainingHardTimeoutMs(), options.signal ?? null);
            bodyReader = null;
            return { status: response.status, headers, text, body: null };
        }
        catch (error) {
            invalidateOnHang(client, requestOptions, error, request);
            if (bodyReader) {
                await cancelResponseBody(bodyReader, error);
            }
            else if (response &&
                isReadableBody(response.body) &&
                typeof response.body.cancel === "function") {
                await cancelResponseBody(response.body, error);
            }
            throw error;
        }
        finally {
            releaseRequest(request);
        }
    }
    const module = {
        tlsFetch,
        __setTlsFetchOverrideForTesting(fn) {
            testOverride = fn;
        },
    };
    if (exportCloudflareCheck)
        module.isCloudflareChallenge = isCloudflareChallenge;
    if (config.exposeStreamingForTesting) {
        module.__tlsFetchStreamingForTesting = (client, url, requestOptions, eofSymbol = "[DONE]", signal = null, hardTimeoutMs = defaultTimeoutMs + hardTimeoutGraceMs, firstByteMs = firstByteTimeoutMs) => tlsFetchStreaming(client, url, requestOptions, eofSymbol, signal, hardTimeoutMs, firstByteMs);
    }
    return module;
}
