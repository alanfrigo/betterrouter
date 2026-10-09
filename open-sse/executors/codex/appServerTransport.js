import { WebSocket } from "undici";

export function appServerWebsocket(url, options = {}) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, { headers: options.headers || {} });
    const timer = setTimeout(() => { socket.close(); reject(new Error("Codex app-server connect timeout")); }, 15_000);
    socket.addEventListener("open", () => { clearTimeout(timer); resolve(socket); }, { once: true });
    socket.addEventListener("error", () => { clearTimeout(timer); reject(new Error("Codex app-server WebSocket connection failed")); }, { once: true });
  });
}
