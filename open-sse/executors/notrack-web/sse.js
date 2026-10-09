/** Parse a single `data:` line; returns null for non-data / `[DONE]` / malformed. */
export function parseNotrackDataLine(line) {
    if (!line.startsWith("data:"))
        return null;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]" || !payload.startsWith("{"))
        return null;
    try {
        return JSON.parse(payload);
    }
    catch {
        return null;
    }
}
export async function consumeNotrackSse(upstream, signal, onLine, logLabel, log) {
    const decoder = new TextDecoder();
    const reader = upstream.getReader();
    let buffer = "";
    try {
        while (true) {
            if (signal?.aborted)
                break;
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const rawLine of lines)
                onLine(rawLine);
        }
        // A stream may end right after a final unterminated data line — flush it.
        buffer += decoder.decode();
        if (buffer)
            onLine(buffer);
    }
    catch (err) {
        log?.error?.("NOTRACK-WEB", `${logLabel}: ${err}`);
    }
    finally {
        reader.releaseLock();
    }
}
export function processNotrackSseLine(rawLine, onEvent) {
    const event = parseNotrackDataLine(rawLine.replace(/\r$/, ""));
    if (event)
        onEvent(event);
}
