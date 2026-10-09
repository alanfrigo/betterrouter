import { SYNTX_API_BASE, syntxAuthHeaders } from "./syntxAuth.js";
export const SYNTX_MEDIA_MODELS_URL = `${SYNTX_API_BASE}/api/v1/ai/models`;
export const SYNTX_AI_SERVICES_URL = `${SYNTX_API_BASE}/api/v1/ai`;
const ASPECT = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const GPT_IMAGE_SIZES = ["1024x1024", "1024x1536", "1536x1024"];
const TIER_RES = ["1K", "2K", "4K"];
const VIDEO_ASPECT = ["16:9", "9:16", "1:1"];
const SCOPE_BY_AI_NAME = Object.freeze({
  midjourney: "image",
  flux: "image",
  "sora-images": "image",
  banana: "image",
  ideogram: "image",
  "stable-diffusion": "image",
  recraft: "image",
  "runway-frames": "image",
  seedream: "image",
  "higgsfield-soul": "image",
  higgsfield: "image",
  "kling-kolors": "image",
  grok_image: "image",
  luma_image: "image",
  wan_image: "image",
  kling: "video",
  wan_video: "video",
  runway: "video",
  grok_video: "video",
  seedance: "video",
  beeble: "video",
  topaz_astra: "video",
  sora: "video",
  elevenlabs: "speech",
  suno: "music",
  "suno-music": "music",
  udio: "music",
  magnific: "upscale",
  topaz_ai: "upscale"
});
const TEXT_AI_NAMES = new Set([
  "chatgpt",
  "claude",
  "deepseek",
  "gemini",
  "qwen",
  "grok",
  "perplexity",
  "zai"
]);
export const SYNTX_FALLBACK_MEDIA_MODELS = [
  media("sora-images", "gpt-image-2", "GPT Image 2", "image", ["text", "image"], {
    supportedSizes: [...GPT_IMAGE_SIZES],
    maxReferenceItems: 4
  }),
  media("sora-images", "gpt-image-1", "GPT Image 1", "image", ["text", "image"], {
    supportedSizes: [...GPT_IMAGE_SIZES],
    maxReferenceItems: 4
  }),
  media("flux", "flux-pro", "FLUX Pro", "image", ["text"], { supportedAspectRatios: [...ASPECT] }),
  media("flux", "flux-dev", "FLUX Dev", "image", ["text"], { supportedAspectRatios: [...ASPECT] }),
  media("midjourney", "midjourney", "Midjourney", "image", ["text"], {
    supportedAspectRatios: [...ASPECT, "2:3", "3:2"]
  }),
  media("banana", "nano-banana", "Nano Banana", "image", ["text", "image"], {
    supportedAspectRatios: [...ASPECT, "2:3", "3:2"],
    maxReferenceItems: 8
  }),
  media("ideogram", "ideogram", "Ideogram", "image", ["text", "image"], {
    supportedAspectRatios: [...ASPECT],
    maxReferenceItems: 4
  }),
  media("seedream", "seedream-4.5", "Seedream 4.5", "image", ["text", "image"], {
    supportedAspectRatios: [...ASPECT],
    supportedResolutions: ["2K", "4K"],
    maxReferenceItems: 4
  }),
  media("seedream", "seedream-5", "Seedream 5", "image", ["text", "image"], {
    supportedAspectRatios: [...ASPECT],
    supportedResolutions: ["2K", "4K"],
    maxReferenceItems: 4
  }),
  media("grok_image", "grok_i2i", "Grok Image", "image", ["text", "image"], {
    supportedAspectRatios: [...ASPECT],
    maxReferenceItems: 4
  }),
  media("grok_image", "grok_i2i_pro", "Grok Image Pro", "image", ["text", "image"], {
    maxReferenceItems: 4
  }),
  media("wan_image", "wan-2.7", "Wan 2.7 Image", "image", ["text", "image"], {
    supportedAspectRatios: [...ASPECT],
    supportedResolutions: [...TIER_RES],
    maxReferenceItems: 4
  }),
  media("wan_image", "wan-2.7-pro", "Wan 2.7 Image Pro", "image", ["text", "image"], {
    supportedAspectRatios: [...ASPECT],
    supportedResolutions: ["1K", "2K"],
    maxReferenceItems: 4
  }),
  media("recraft", "recraft", "Recraft", "image", ["text"], {
    supportedSizes: ["1024x1024", "1365x1024", "1024x1365"]
  }),
  media("runway-frames", "runway-frames", "Runway Frames", "image", ["text"], {
    supportedSizes: ["1920x1080", "1080x1920", "1024x1024"]
  }),
  media("luma_image", "luma", "Luma Image", "image", ["text", "image"], {
    supportedAspectRatios: [...ASPECT],
    maxReferenceItems: 4
  }),
  media("stable-diffusion", "sdxl", "Stable Diffusion XL", "image", ["text"], {
    supportedSizes: ["1024x1024", "768x1344", "1344x768"]
  }),
  media("higgsfield", "higgsfield", "Higgsfield", "image", ["text"], {
    supportedAspectRatios: [...ASPECT]
  }),
  media("kling-kolors", "kling-kolors", "Kling Kolors", "image", ["text"], {
    supportedAspectRatios: [...ASPECT]
  }),
  media("wan_video", "wan-2.6", "Wan 2.6 Video", "video", ["text", "image"], {
    supportedAspectRatios: [...VIDEO_ASPECT, "4:3", "3:4"],
    supportedDurations: [5, 10],
    durationDefault: 5,
    maxReferenceItems: 2
  }),
  media("wan_video", "wan-2.7", "Wan 2.7 Video", "video", ["text", "image"], {
    supportedAspectRatios: [...VIDEO_ASPECT, "4:3", "3:4"],
    supportedDurations: [5, 10],
    durationDefault: 5,
    maxReferenceItems: 2
  }),
  media("kling", "kling-1.6", "Kling 1.6", "video", ["text", "image"], {
    supportedAspectRatios: [...VIDEO_ASPECT],
    supportedDurations: [5, 10],
    durationDefault: 5,
    maxReferenceItems: 2
  }),
  media("kling", "kling-2.1", "Kling 2.1", "video", ["text", "image"], {
    supportedAspectRatios: [...VIDEO_ASPECT],
    supportedDurations: [5, 10],
    durationDefault: 5,
    maxReferenceItems: 2
  }),
  media("runway", "gen3", "Runway Gen-3", "video", ["text", "image"], {
    supportedAspectRatios: ["1280:768", "768:1280"],
    supportedDurations: [5, 10],
    durationDefault: 5,
    maxReferenceItems: 1
  }),
  media("grok_video", "grok_t2v", "Grok Video T2V", "video", ["text"], {
    supportedAspectRatios: [...VIDEO_ASPECT],
    supportedResolutions: ["720p", "480p"],
    supportedDurations: [5, 10],
    durationDefault: 5
  }),
  media("grok_video", "grok_i2v", "Grok Video I2V", "video", ["text", "image"], {
    supportedResolutions: ["720p", "480p"],
    supportedDurations: [5, 10],
    durationDefault: 5,
    maxReferenceItems: 1,
    imageRequired: true
  }),
  media("seedance", "seedance", "Seedance", "video", ["text", "image"], {
    supportedAspectRatios: [...VIDEO_ASPECT, "4:3", "3:4"],
    supportedDurations: [5, 10],
    durationDefault: 5,
    maxReferenceItems: 1
  }),
  media("sora", "sora-2", "Sora 2", "video", ["text", "image"], {
    supportedAspectRatios: [...VIDEO_ASPECT],
    supportedDurations: [4, 8, 12],
    durationDefault: 8,
    maxReferenceItems: 1
  }),
  media("topaz_astra", "topaz_astra", "Topaz Astra", "video", ["text", "image"], {
    supportedAspectRatios: [...VIDEO_ASPECT],
    supportedDurations: [5, 10],
    durationDefault: 5,
    imageRequired: true,
    maxReferenceItems: 1
  }),
  media("beeble", "beeble", "Beeble", "video", ["text"], {
    supportedAspectRatios: [...VIDEO_ASPECT],
    supportedDurations: [5, 10],
    durationDefault: 5
  }),
  media("elevenlabs", "eleven_multilingual_v2", "ElevenLabs Multilingual v2", "speech"),
  media("elevenlabs", "eleven_turbo_v2", "ElevenLabs Turbo v2", "speech"),
  media("elevenlabs", "eleven_flash_v2", "ElevenLabs Flash v2", "speech"),
  media("suno", "chirp-v4", "Suno V4", "music", ["text"], {
    supportedDurations: [30, 60, 120],
    durationDefault: 30
  }),
  media("suno", "chirp-v3-5", "Suno V3.5", "music", ["text"], {
    supportedDurations: [30, 60, 120],
    durationDefault: 30
  }),
  media("suno-music", "suno", "Suno Music", "music", ["text"], {
    supportedDurations: [30, 60, 120],
    durationDefault: 30
  }),
  media("magnific", "magnific", "Magnific Upscale", "upscale", ["image"], {
    imageRequired: true,
    maxReferenceItems: 1
  }),
  media("topaz_ai", "topaz", "Topaz AI Upscale", "upscale", ["image"], {
    imageRequired: true,
    maxReferenceItems: 1
  }),
  media("ideogram", "upscale", "Ideogram Upscale", "upscale", ["image"], {
    imageRequired: true,
    maxReferenceItems: 1
  }),
  {
    id: "transcribe",
    name: "SYNTX Transcribe",
    aiName: "transcribe",
    modelType: "transcribe",
    kind: "transcription",
    inputModalities: ["audio"]
  }
];
function media(aiName, modelType, name, kind, inputModalities, caps) {
  return {
    id: `${aiName}/${modelType}`,
    name,
    aiName,
    modelType,
    kind,
    ...inputModalities ? { inputModalities } : {},
    ...caps?.supportedSizes ? { supportedSizes: caps.supportedSizes } : {},
    ...caps ? { caps } : {}
  };
}
function kindFromLowerName(lower) {
  if (lower === "magnific" || lower === "topaz_ai" || lower.includes("upscale"))
    return "upscale";
  if (lower.includes("suno") || lower.includes("udio") || lower.endsWith("-music") || lower.includes("music")) {
    return "music";
  }
  if (lower.includes("eleven") || lower.includes("tts") || lower.endsWith("-voice"))
    return "speech";
  return kindFromVideoOrImageName(lower);
}
function kindFromVideoOrImageName(lower) {
  const videoNames = new Set(["kling", "runway", "sora", "seedance", "beeble", "topaz_astra"]);
  if (lower.endsWith("_video") || videoNames.has(lower))
    return "video";
  if (lower.endsWith("_image") || lower.endsWith("-images") || lower.endsWith("-frames") || lower.includes("flux") || lower.includes("midjourney") || lower.includes("ideogram") || lower.includes("banana") || lower.includes("seedream") || lower === "kling-kolors") {
    return "image";
  }
  return null;
}
export function inferSyntxMediaKind(aiName) {
  const key = (aiName || "").trim();
  if (!key || TEXT_AI_NAMES.has(key))
    return null;
  if (SCOPE_BY_AI_NAME[key])
    return SCOPE_BY_AI_NAME[key];
  return kindFromLowerName(key.toLowerCase());
}
export function parseSyntxMediaModelId(raw) {
  const text = (raw || "").trim();
  if (!text)
    return { aiName: "", modelType: "" };
  const slash = text.indexOf("/");
  if (slash > 0 && slash < text.length - 1) {
    return { aiName: text.slice(0, slash), modelType: text.slice(slash + 1) };
  }
  const seed = SYNTX_FALLBACK_MEDIA_MODELS.find((row) => row.modelType === text || row.id === text || row.aiName === text);
  if (seed)
    return { aiName: seed.aiName, modelType: seed.modelType };
  return { aiName: text, modelType: text };
}
export function defaultAiNameForKind(kind) {
  switch (kind) {
    case "image":
      return "sora-images";
    case "video":
      return "wan_video";
    case "speech":
      return "elevenlabs";
    case "music":
      return "suno";
    case "upscale":
      return "magnific";
    case "transcription":
      return "transcribe";
    default:
      return "sora-images";
  }
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
export function parseSyntxAiServices(json) {
  const rows = Array.isArray(json) ? json : Array.isArray(asRecord(json).data) ? asRecord(json).data : [];
  const map = new Map;
  for (const row of rows) {
    const rec = asRecord(row);
    const name = typeof rec.value === "string" ? rec.value.trim() : "";
    const scope = typeof rec.scope === "string" ? rec.scope.trim().toLowerCase() : "";
    if (name && scope)
      map.set(name, scope);
  }
  return map;
}
function catalogRows(modelsJson) {
  const root = asRecord(modelsJson);
  if (Array.isArray(root.models))
    return root.models;
  if (Array.isArray(modelsJson))
    return modelsJson;
  if (Array.isArray(root.data))
    return root.data;
  return [];
}
function trimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}
function allowedMediaTypes(settings) {
  return Array.isArray(settings.allowed_media_types) ? settings.allowed_media_types.filter((item) => typeof item === "string") : [];
}
function mediaRowIdentity(rec) {
  const modelType = trimmedString(rec.value) || trimmedString(rec.id);
  const aiName = trimmedString(rec.ai_name);
  if (!modelType || !aiName || TEXT_AI_NAMES.has(aiName))
    return null;
  return { modelType, aiName };
}
function parseOneMediaModel(row, services, seen) {
  const rec = asRecord(row);
  const identity = mediaRowIdentity(rec);
  if (!identity)
    return null;
  const { modelType, aiName } = identity;
  const id = `${aiName}/${modelType}`;
  if (seen.has(id))
    return null;
  const seed = SYNTX_FALLBACK_MEDIA_MODELS.find((item) => item.id === id);
  const kind = seed?.kind || resolveLiveKind(aiName, services?.get(aiName) || "", modelType);
  if (!kind)
    return null;
  seen.add(id);
  const inputModalities = seed?.inputModalities || inputModalitiesFor(kind, allowedMediaTypes(asRecord(rec.settings)), modelType);
  return {
    id,
    name: trimmedString(rec.label) || modelType,
    aiName,
    modelType,
    kind,
    inputModalities,
    caps: seed?.caps || defaultCapsFor(kind, aiName, modelType, inputModalities)
  };
}
export function parseSyntxMediaModelsCatalog(modelsJson, services) {
  const seen = new Set;
  const models = [];
  for (const row of catalogRows(modelsJson)) {
    const model = parseOneMediaModel(row, services, seen);
    if (model)
      models.push(model);
  }
  return models;
}
function resolveLiveKind(aiName, serviceScope, modelType = "") {
  const type = (modelType || "").trim().toLowerCase();
  if (type === "upscale" || type.includes("upscale"))
    return "upscale";
  const fromName = inferSyntxMediaKind(aiName);
  if (fromName)
    return fromName;
  if (serviceScope === "image")
    return "image";
  if (serviceScope === "video")
    return "video";
  if (serviceScope === "upscale")
    return "upscale";
  if (serviceScope === "audio")
    return "speech";
  return null;
}
function inputModalitiesFor(kind, accepted, modelType) {
  if (kind === "upscale")
    return ["image"];
  if (kind === "transcription")
    return ["audio"];
  const hasImage = accepted.some((item) => item.toLowerCase().includes("image"));
  const i2v = /i2v|image-to-video|image_to_video/i.test(modelType);
  if (kind === "image")
    return hasImage ? ["text", "image"] : ["text"];
  if (kind === "video")
    return hasImage || i2v ? ["text", "image"] : ["text"];
  return ["text"];
}
function defaultCapsFor(kind, _aiName, modelType, inputModalities) {
  const wantsImage = inputModalities.includes("image") || /i2v/i.test(modelType);
  if (kind === "image") {
    return {
      supportedAspectRatios: [...ASPECT],
      maxReferenceItems: wantsImage ? 4 : undefined
    };
  }
  if (kind === "video") {
    return {
      supportedAspectRatios: /i2v/i.test(modelType) ? undefined : [...VIDEO_ASPECT],
      supportedDurations: [5, 10],
      durationDefault: 5,
      maxReferenceItems: wantsImage ? 2 : undefined,
      imageRequired: /i2v/i.test(modelType)
    };
  }
  if (kind === "music")
    return { supportedDurations: [30, 60, 120], durationDefault: 30 };
  if (kind === "upscale")
    return { imageRequired: true, maxReferenceItems: 1 };
  return {};
}
const catalogCache = new Map;
const CATALOG_TTL_MS = 10 * 60000;
export async function discoverSyntxMediaModels(options) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const headers = syntxAuthHeaders(options.token);
  const [servicesRes, modelsRes] = await Promise.all([
    fetchImpl(SYNTX_AI_SERVICES_URL, { method: "GET", headers }),
    fetchImpl(SYNTX_MEDIA_MODELS_URL, { method: "GET", headers })
  ]);
  const services = servicesRes.ok ? parseSyntxAiServices(await servicesRes.json()) : new Map;
  if (!modelsRes.ok)
    throw new Error(`SYNTX media models HTTP ${modelsRes.status}`);
  const models = parseSyntxMediaModelsCatalog(await modelsRes.json(), services);
  if (models.length === 0)
    throw new Error("SYNTX media catalog was empty");
  catalogCache.set(options.token.slice(-16), { models, ts: Date.now() });
  return models;
}
export async function getSyntxMediaCatalog(options) {
  const cacheKey = options.token.slice(-16);
  const cached = catalogCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CATALOG_TTL_MS)
    return cached.models;
  try {
    return await discoverSyntxMediaModels(options);
  } catch {
    return SYNTX_FALLBACK_MEDIA_MODELS.map((row) => ({ ...row }));
  }
}
export function modelsForKind(kind, live) {
  const source = live && live.length > 0 ? live : SYNTX_FALLBACK_MEDIA_MODELS;
  const rows = source.filter((row) => row.kind === kind);
  return rows.length > 0 ? rows.map((row) => ({ ...row })) : SYNTX_FALLBACK_MEDIA_MODELS.filter((row) => row.kind === kind).map((row) => ({ ...row }));
}
function toWireCaps(row) {
  const caps = row.caps;
  if (!caps)
    return;
  const referenceInputs = caps.maxReferenceItems && caps.maxReferenceItems > 0 || caps.imageRequired ? [
    {
      media_type: "image",
      usage_type: "source",
      min_items: caps.imageRequired ? 1 : 0,
      max_items: caps.maxReferenceItems ?? 1
    }
  ] : undefined;
  return {
    ...caps.supportedSizes ? { supported_sizes: caps.supportedSizes } : {},
    ...caps.supportedAspectRatios ? { supported_aspect_ratios: caps.supportedAspectRatios } : {},
    ...caps.supportedResolutions ? { supported_resolutions: caps.supportedResolutions } : {},
    ...caps.supportedDurations ? { supported_durations: caps.supportedDurations } : {},
    ...caps.durationDefault != null ? { duration_default: caps.durationDefault } : {},
    ...caps.maxReferenceItems != null ? { max_reference_items: caps.maxReferenceItems } : {},
    ...referenceInputs ? { reference_inputs: referenceInputs } : {}
  };
}
export function toRegistryImageModels(live) {
  return modelsForKind("image", live).map((row) => ({
    id: row.id,
    name: row.name,
    inputModalities: row.inputModalities || ["text"],
    imageRequired: row.caps?.imageRequired,
    supportedSizes: row.caps?.supportedSizes || row.supportedSizes,
    mediaCapabilities: toWireCaps(row)
  }));
}
export function toRegistryVideoModels(live) {
  return modelsForKind("video", live).map((row) => ({
    id: row.id,
    name: row.name,
    inputModalities: row.inputModalities || ["text"],
    supportedSizes: row.caps?.supportedAspectRatios || row.caps?.supportedSizes,
    mediaCapabilities: toWireCaps(row)
  }));
}
export function toRegistrySpeechModels(live) {
  return modelsForKind("speech", live).map((row) => ({ id: row.id, name: row.name }));
}
export function toRegistryMusicModels(live) {
  return modelsForKind("music", live).map((row) => ({
    id: row.id,
    name: row.name,
    mediaCapabilities: toWireCaps(row)
  }));
}
export function toRegistryTranscriptionModels(live) {
  return modelsForKind("transcription", live).map((row) => ({ id: row.id, name: row.name }));
}
export function toRegistryUpscaleModels(live) {
  return modelsForKind("upscale", live).map((row) => ({
    id: row.id,
    name: row.name,
    factors: [2, 4],
    supportsPrompt: row.aiName === "magnific" || row.aiName === "ideogram",
    description: row.name
  }));
}
export function __resetSyntxMediaCatalogForTests() {
  catalogCache.clear();
}
