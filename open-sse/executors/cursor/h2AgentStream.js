import { HTTP_STATUS } from "../cursorApiSupport.js";
import { bindTunnelLifecycle, createProxyTunnelSocket, parseH2Authority, resolveCursorH2ProxyUrl, tlsConnectOverTunnel, } from "./h2ProxyConnect.js";
import { assertPublicUrlResolved } from "../../../src/shared/utils/ssrfGuard.js";
export async function openCursorH2(http2, url, headers, body, signal) {
    await assertPublicUrlResolved(url);
    const proxyUrl = resolveCursorH2ProxyUrl(url);
    let tunnelSocket = null;
    if (proxyUrl) {
        const { host, port } = parseH2Authority(url);
        tunnelSocket = await createProxyTunnelSocket({
            targetHost: host,
            targetPort: port,
            proxyUrl,
            signal,
        });
    }
    if (signal?.aborted) {
        tunnelSocket?.destroy();
        throw new Error("aborted");
    }
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        let releaseTunnel = () => {
            if (tunnelSocket && !tunnelSocket.destroyed)
                tunnelSocket.destroy();
        };
        let client;
        try {
            client = http2.connect(`https://${urlObj.host}`, tunnelSocket
                ? {
                    createConnection: () => tlsConnectOverTunnel(tunnelSocket, urlObj.hostname),
                }
                : undefined);
        }
        catch (error) {
            releaseTunnel();
            reject(error);
            return;
        }
        const earlyChunks = [];
        let resolved = false;
        client.on("error", (error) => {
            releaseTunnel();
            if (!resolved) {
                resolved = true;
                reject(error);
            }
        });
        let req;
        try {
            req = client.request({
                ":method": "POST",
                ":path": urlObj.pathname,
                ":authority": urlObj.host,
                ":scheme": "https",
                ...headers,
            });
        }
        catch (error) {
            releaseTunnel();
            client.close();
            reject(error);
            return;
        }
        if (tunnelSocket)
            releaseTunnel = bindTunnelLifecycle(tunnelSocket, client, req, signal);
        const onAbort = () => {
            if (!resolved) {
                resolved = true;
                reject(new Error("aborted"));
            }
            releaseTunnel();
            try {
                req.close();
                client.close();
            }
            catch {
                // The HTTP/2 session may already have closed.
            }
        };
        if (signal) {
            signal.addEventListener("abort", onAbort, { once: true });
            if (signal.aborted) {
                onAbort();
                return;
            }
        }
        const onEarlyClose = () => {
            releaseTunnel();
            if (!resolved) {
                resolved = true;
                if (signal)
                    signal.removeEventListener("abort", onAbort);
                reject(new Error("Cursor HTTP/2 session closed before response headers"));
            }
        };
        client.once("close", onEarlyClose);
        req.once("close", onEarlyClose);
        req.on("response", (responseHeaders) => {
            if (resolved)
                return;
            resolved = true;
            const status = Number(responseHeaders[":status"] ?? HTTP_STATUS.SERVER_ERROR);
            const consumeError = () => new Promise((res) => {
                const chunks = [...earlyChunks];
                req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
                const finish = () => {
                    try {
                        req.close();
                        client.close();
                    }
                    catch {
                        // The HTTP/2 session may already have closed.
                    }
                    if (signal)
                        signal.removeEventListener("abort", onAbort);
                    res(Buffer.concat(chunks));
                };
                req.once("end", finish);
                req.once("error", finish);
            });
            resolve({
                status,
                headers: responseHeaders,
                client,
                req,
                initialBytes: Buffer.concat(earlyChunks),
                consumeError,
            });
        });
        req.on("data", (chunk) => {
            if (!resolved)
                earlyChunks.push(Buffer.from(chunk));
        });
        req.on("error", (error) => {
            releaseTunnel();
            if (!resolved) {
                resolved = true;
                if (signal)
                    signal.removeEventListener("abort", onAbort);
                reject(error);
            }
        });
        // This is a bidirectional stream; END_STREAM would stop Cursor responding.
        try {
            req.write(body);
        }
        catch (error) {
            if (!resolved) {
                resolved = true;
                if (signal)
                    signal.removeEventListener("abort", onAbort);
                releaseTunnel();
                try {
                    req.close();
                    client.close();
                }
                catch {
                    // The HTTP/2 session may already have closed.
                }
                reject(error instanceof Error ? error : new Error(String(error)));
            }
        }
    });
}
