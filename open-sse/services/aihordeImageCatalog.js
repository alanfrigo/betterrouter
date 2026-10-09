import { fetchPublic as safeOutboundFetch } from "../../src/shared/utils/ssrfGuard.js";
import { registerDynamicImageModelSource } from "../config/dynamicImageModelSources.js";
export const AI_HORDE_API_BASE = "https://aihorde.net/api";
export const AI_HORDE_ANONYMOUS_KEY = "0000000000";
export const AI_HORDE_CLIENT_AGENT = "OmniRoute:3.8.49:https://github.com/diegosouzapw/OmniRoute";
export const AI_HORDE_CATALOG_POLL_MS = 30000;
export const AI_HORDE_CATALOG_FETCH_TIMEOUT_MS = 15000;
const defaultHordeFetch = (input, init) => {
  const { timeoutMs, ...rest } = init || {};
  return safeOutboundFetch(input, {
    ...rest,
    signal: rest.signal || AbortSignal.timeout(timeoutMs ?? AI_HORDE_CATALOG_FETCH_TIMEOUT_MS)
  });
};
function asNumber(value) {
  if (value === null || value === undefined)
    return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function asInt(value) {
  const parsed = asNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}
export function parseHordeImageModels(payload) {
  if (!Array.isArray(payload)) {
    throw new Error("Horde model catalog must be a JSON array");
  }
  const models = [];
  for (const item of payload) {
    if (!item || typeof item !== "object")
      continue;
    const row = item;
    const name = row.name;
    if (typeof name !== "string" || !name.trim())
      continue;
    const modelType = row.type ?? "image";
    if (modelType !== null && modelType !== "image")
      continue;
    const count = asInt(row.count ?? 0) ?? 0;
    if (count <= 0)
      continue;
    models.push({
      name,
      count,
      queued: asNumber(row.queued),
      eta: asInt(row.eta),
      performance: asNumber(row.performance),
      jobs: asNumber(row.jobs)
    });
  }
  models.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  return models;
}

export class HordeImageCatalog {
  pollMs;
  models = new Map;
  updatedAt = null;
  lastError = null;
  inflight = null;
  fetchImpl;
  constructor(options = {}) {
    this.pollMs = Math.max(5000, options.pollMs ?? AI_HORDE_CATALOG_POLL_MS);
    this.fetchImpl = options.fetchImpl ?? defaultHordeFetch;
  }
  get snapshot() {
    return {
      models: this.listModels(),
      updatedAt: this.updatedAt,
      lastError: this.lastError
    };
  }
  get stale() {
    return this.lastError !== null && this.updatedAt !== null;
  }
  listModels() {
    return [...this.models.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }
  get(name) {
    return this.models.get(name);
  }
  isServed(name) {
    const model = this.models.get(name);
    return Boolean(model && model.count > 0);
  }
  hasSnapshot() {
    return this.updatedAt !== null;
  }
  replace(models, error = null) {
    this.models = new Map(models.map((model) => [model.name, model]));
    if (error === null) {
      this.updatedAt = Date.now();
      this.lastError = null;
    } else {
      this.lastError = error;
    }
  }
  clear() {
    this.models = new Map;
    this.updatedAt = null;
    this.lastError = null;
  }
  setFetch(fetchImpl) {
    this.fetchImpl = fetchImpl;
  }
  async refresh(options = {}) {
    if (this.inflight)
      return this.inflight;
    this.inflight = this.refreshOnce(options).finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }
  async ensureFresh(maxAgeMs = this.pollMs, options = {}) {
    if (this.updatedAt !== null && Date.now() - this.updatedAt < maxAgeMs && !this.lastError) {
      return;
    }
    await this.refresh(options);
  }
  async refreshOnce(options = {}) {
    try {
      const url = `${AI_HORDE_API_BASE}/v2/status/models?type=image`;
      const response = await this.fetchImpl(url, {
        method: "GET",
        headers: { Accept: "application/json", "Client-Agent": AI_HORDE_CLIENT_AGENT },
        signal: options.signal,
        timeoutMs: options.timeoutMs
      });
      if (!response.ok) {
        throw new Error(`Horde catalog HTTP ${response.status}`);
      }
      const models = parseHordeImageModels(await response.json());
      this.replace(models);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.lastError = message;
    }
  }
}
export const aiHordeImageCatalog = new HordeImageCatalog;
export function resetAiHordeImageCatalog() {
  aiHordeImageCatalog.clear();
}
export function getCachedAiHordeImageCatalogEntries() {
  return aiHordeImageCatalog.listModels().map((model) => ({
    id: `aihorde/${model.name}`,
    name: `${model.name} (AI Horde)`,
    provider: "aihorde",
    supportedSizes: ["512x512", "768x768", "1024x1024", "1024x768", "768x1024"],
    inputModalities: ["text", "image"],
    description: `${model.count} worker${model.count === 1 ? "" : "s"} online`
  }));
}
registerDynamicImageModelSource("aihorde", () => getCachedAiHordeImageCatalogEntries().map((entry) => ({
  id: entry.id.startsWith("aihorde/") ? entry.id.slice("aihorde/".length) : entry.id,
  name: entry.name,
  inputModalities: entry.inputModalities
})));
