export function assertLoopbackBrowserEndpoint(value) {
  if (!value) return value;
  const url = new URL(value);
  if (!["http:", "ws:"].includes(url.protocol) || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || !url.port || url.username || url.password) {
    throw new Error("Browser CDP endpoint must use loopback host and explicit port; remote browser would receive session credentials");
  }
  return value;
}
