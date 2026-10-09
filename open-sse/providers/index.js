// Single source: build PROVIDERS + PROVIDER_MODELS from registry/{id}.js (transport + models co-located).
import REGISTRY from "./registry/index.js";
import { PROVIDER_DEFAULTS } from "./schema.js";
import { normalizeModel } from "./models/schema.js";
import { buildTtsProviderModels } from "../config/ttsModels.js";

// oauth block is canonical for these fields; inject into transport so executors reading
// this.config.{clientId,clientSecret,tokenUrl} keep working without duplicating in transport
const OAUTH_INJECT_FIELDS = ["clientId", "clientSecret", "tokenUrl"];

// transport: re-apply shared default (format:"openai") + inject oauth-canonical fields
function buildTransport(transport, oauth) {
  const t = { ...transport };
  if (!t.format) t.format = PROVIDER_DEFAULTS.format;
  if (oauth) {
    for (const f of OAUTH_INJECT_FIELDS) {
      if (t[f] === undefined && oauth[f] !== undefined) t[f] = oauth[f];
    }
  }
  return t;
}

const MEDIA_KEYS = new Set([
  "serviceKinds", "ttsConfig", "sttConfig", "embeddingConfig",
  "imageConfig", "imageToTextConfig", "videoConfig", "musicConfig",
  "searchViaChat", "searchConfig", "fetchConfig", "systemoneConfig",
  "modelsFetcher", "mediaPriority", "hiddenKinds",
]);

const MODALITY_MODEL_CONFIGS = { ttsConfig: "tts", sttConfig: "stt", embeddingConfig: "embedding", imageConfig: "image", imageToTextConfig: "imageToText", videoConfig: "video", musicConfig: "music" };

export function buildProviderCatalog(entry) {
  const onlyKind = entry.serviceKinds?.length === 1 && entry.serviceKinds[0] !== "llm" ? entry.serviceKinds[0] : null;
  const catalog = new Map();
  const add = (raw, kind) => {
    const model = typeof raw === "string" ? { id: raw } : raw;
    const kinds = model.supportedKinds || [kind || model.kind || model.type || onlyKind || "llm"];
    const existing = catalog.get(model.id);
    if (existing) existing.supportedKinds = [...new Set([...existing.supportedKinds, ...kinds])];
    else catalog.set(model.id, { ...model, kind: kinds[0], supportedKinds: [...kinds] });
  };
  for (const model of entry.models || []) add(model);
  for (const [config, kind] of Object.entries(MODALITY_MODEL_CONFIGS)) {
    for (const model of entry[config]?.models || entry.media?.[config]?.models || []) add(model, kind);
  }
  return [...catalog.values()].map(normalizeModel);
}
export const PROVIDERS = {};
export const PROVIDER_MODELS = {};
export const PROVIDER_OAUTH = {};
export const PROVIDER_MEDIA = {};
for (const entry of REGISTRY) {
  if (entry.transport) {
    PROVIDERS[entry.id] = buildTransport(entry.transport, entry.oauth);
    if (entry.noAuth) PROVIDERS[entry.id].noAuth = true;
    if (entry.transports) PROVIDERS[entry.id].transports = entry.transports;
  }
  const catalog = buildProviderCatalog(entry);
  if (entry.models !== undefined || catalog.length) PROVIDER_MODELS[entry.alias || entry.id] = catalog;
  if (entry.oauth) PROVIDER_OAUTH[entry.id] = entry.oauth;
  // Build PROVIDER_MEDIA from top-level fields (post-migration) + legacy entry.media
  const mediaFields = {};
  for (const k of MEDIA_KEYS) {
    if (entry[k] !== undefined) mediaFields[k] = entry[k];
  }
  if (entry.media) Object.assign(mediaFields, entry.media);
  if (Object.keys(mediaFields).length) PROVIDER_MEDIA[entry.id] = mediaFields;
}

// TTS model/voice tables keyed by special names (openai-tts-models, ...), not provider ids
Object.assign(PROVIDER_MODELS, buildTtsProviderModels());
