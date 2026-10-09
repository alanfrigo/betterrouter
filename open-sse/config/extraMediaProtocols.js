import { AI_HORDE_IMAGE_PROVIDER } from "./providers/registry/aihorde/imageModels.js";
import { toRegistryImageModels, toRegistryVideoModels, ADOBE_FIREFLY_IMAGE_ROUTING_ALIASES } from "../services/adobeFireflyModels.js";
export const EXTRA_IMAGES = {
  "adobe-firefly": {
    id: "adobe-firefly",
    alias: "firefly",
    baseUrl: "https://firefly-3p.ff.adobe.io/v2/3p-images/generate-async",
    authType: "apikey",
    authHeader: "bearer",
    format: "adobe-firefly-image",
    models: toRegistryImageModels(),
    routingAliases: ADOBE_FIREFLY_IMAGE_ROUTING_ALIASES,
    supportedSizes: []
  },
  aihorde: AI_HORDE_IMAGE_PROVIDER
};
export const EXTRA_VIDEOS = {
  novita: {
    id: "novita",
    baseUrl: "https://api.novita.ai/v3/async",
    statusUrl: "https://api.novita.ai/v3/async/task-result",
    authType: "apikey",
    authHeader: "bearer",
    format: "novita-video",
    models: [
      { id: "wan-t2v", name: "Wan 2.1 Text-to-Video" },
      { id: "kling-v1.6-t2v", name: "Kling V1.6 Text-to-Video" }
    ]
  },
  "adobe-firefly": {
    id: "adobe-firefly",
    alias: "firefly",
    baseUrl: "https://firefly-3p.ff.adobe.io/v2/3p-videos/generate-async",
    authType: "apikey",
    authHeader: "bearer",
    format: "adobe-firefly-video",
    models: toRegistryVideoModels()
  }
};
