import { AsyncLocalStorage } from "node:async_hooks";
import { proxyAwareFetch } from "./proxyFetch.js";

const requests = new AsyncLocalStorage();
export function runWebCookieRequest(input, fn) {
  return requests.run(input, fn);
}
export function webCookieFetch(url, options) {
  return proxyAwareFetch(url, options, requests.getStore()?.proxyOptions);
}
export function resolveProxyForRequest(url) {
  const options = requests.getStore()?.proxyOptions;
  const configured = options?.enabled === true || options?.connectionProxyEnabled === true;
  const proxyUrl = configured ? options.url || options.connectionProxyUrl : null;
  const target = new URL(url);
  const env = target.protocol === "https:" ? process.env.HTTPS_PROXY || process.env.https_proxy : process.env.HTTP_PROXY || process.env.http_proxy;
  const selected = proxyUrl || env || process.env.ALL_PROXY || process.env.all_proxy || null;
  return { source: selected ? "configured" : "direct", proxyUrl: selected };
}
export async function resolveProxyForProvider() {
  const options = requests.getStore()?.proxyOptions;
  if (!(options?.enabled === true || options?.connectionProxyEnabled === true)) return null;
  const url = new URL(options.url || options.connectionProxyUrl);
  return { type: url.protocol.replace(":", ""), host: url.hostname, port: url.port || (url.protocol === "https:" ? "443" : "80"), username: decodeURIComponent(url.username), password: decodeURIComponent(url.password) };
}
