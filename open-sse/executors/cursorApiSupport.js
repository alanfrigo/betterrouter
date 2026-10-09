import { AsyncLocalStorage } from "node:async_hooks";
import { PROVIDERS } from "../providers/index.js";
import { getProviderModels } from "../config/providerModels.js";
export { PROVIDERS };
export { getProviderModels };
export { HTTP_STATUS } from "../config/runtimeConfig.js";

export const cursorProxyContext = new AsyncLocalStorage();

export function resolveProxyForRequest(targetUrl) {
  const options = cursorProxyContext.getStore();
  const host = new URL(targetUrl).hostname.toLowerCase();
  const bypass = (value) => String(value || "").split(",").some((item) => {
    const pattern = item.trim().toLowerCase();
    return pattern === "*" || (pattern && (host === pattern.replace(/^\./, "") || host.endsWith(pattern.startsWith(".") ? pattern : `.${pattern}`)));
  });
  const assigned = options?.url || options?.connectionProxyUrl;
  if (assigned && !bypass(options?.noProxy || options?.connectionNoProxy)) {
    return { proxyUrl: assigned.includes("://") ? assigned : `http://${assigned}` };
  }
  if (bypass(process.env.NO_PROXY || process.env.no_proxy)) return null;
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.ALL_PROXY || process.env.all_proxy;
  return proxyUrl ? { proxyUrl: proxyUrl.includes("://") ? proxyUrl : `http://${proxyUrl}` } : null;
}

export async function getActiveSyncedCatalog(provider) {
  const models = getProviderModels(provider);
  return { models: models.flatMap(model => (model.liveCatalogIds || [model.id]).map(id => ({ id }))) };
}
