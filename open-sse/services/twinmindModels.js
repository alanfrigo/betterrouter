import { fetchPublic, assertPublicUrl } from "../../src/shared/utils/ssrfGuard.js";
export const TWINMIND_CHAT_URL = "https://api2.twinmind.com/api/v3/chat";
export const TWINMIND_MODELS_URLS = [
  "https://api.twinmind.com/api/v3/chat/models",
  "https://app.twinmind.com/api/v3/chat/models"
];
export const TWINMIND_FALLBACK_MODELS = [
  { id: "auto", name: "Auto" },
  { id: "gemini-3.1-pro-thinking", name: "Gemini 3.1 Pro Thinking" },
  { id: "gemini-3.8-flash-thinking", name: "Gemini 3.8 Flash Thinking" },
  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash" },
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash" },
  { id: "gpt-5.6-sol-thinking", name: "GPT-5.6 Sol Thinking" },
  { id: "gpt-5.5-thinking", name: "GPT-5.5 Thinking" },
  { id: "gpt-5.6-terra", name: "GPT-5.6 Terra" },
  { id: "gpt-5.6-luna", name: "GPT-5.6 Luna" },
  { id: "claude-opus-5-thinking", name: "Claude Opus 5 Thinking" },
  { id: "claude-opus-4-7-thinking", name: "Claude Opus 4.7 Thinking" },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" }
];
function isPlainRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function extractModelIdentity(rec) {
  const id = typeof rec.name === "string" ? rec.name : typeof rec.id === "string" ? rec.id : "";
  const display = typeof rec.display_name === "string" ? rec.display_name : undefined;
  return { id, display };
}
function addModelsFromProviderGroups(root, add) {
  const providers = Array.isArray(root.providers) ? root.providers : [];
  for (const provider of providers) {
    if (!isPlainRecord(provider))
      continue;
    const nested = Array.isArray(provider.models) ? provider.models : [];
    for (const model of nested) {
      if (!isPlainRecord(model))
        continue;
      const { id, display } = extractModelIdentity(model);
      if (id)
        add(id, display);
    }
  }
}
function addDefaultModel(root, add) {
  if (!isPlainRecord(root.default_model))
    return;
  const { id, display } = extractModelIdentity(root.default_model);
  if (id)
    add(id, display);
}
export function flattenTwinmindModelsCatalog(json) {
  const root = isPlainRecord(json) ? json : {};
  const seen = new Set;
  const models = [];
  const add = (id, name) => {
    const trimmed = id.trim();
    if (!trimmed || seen.has(trimmed))
      return;
    seen.add(trimmed);
    models.push({ id: trimmed, name: (name || trimmed).trim() || trimmed });
  };
  add("auto", "Auto");
  addModelsFromProviderGroups(root, add);
  addDefaultModel(root, add);
  return models;
}
export async function discoverTwinmindModels(options) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const headers = {};
  if (options.token)
    headers.authorization = `Bearer ${options.token}`;
  for (const url of TWINMIND_MODELS_URLS) {
    try {
      const response = await fetchImpl(url, { method: "GET", headers });
      if (!response.ok)
        continue;
      const json = await response.json();
      const models = flattenTwinmindModelsCatalog(json);
      if (models.length > 1)
        return models;
    } catch {}
  }
  return TWINMIND_FALLBACK_MODELS.map((model) => ({ id: model.id, name: model.name }));
}
