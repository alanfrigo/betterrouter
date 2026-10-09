import { SEGMIND_IMAGE_PROVIDER } from "./providers/registry/segmind/imageModels.js";
import { SEGMIND_VIDEO_MODELS } from "./providers/registry/segmind/videoModels.js";
import { MAGNIFIC_IMAGE_PROVIDER } from "./providers/registry/magnific/index.js";
import { KIE_IMAGE_MODELS } from "./providers/registry/kie/imageModels.js";
import { CHEAPERINFERENCE_IMAGE_PROVIDER } from "./providers/registry/cheaperinference/imageModels.js";
import { toRegistryImageModels, toRegistryVideoModels, toRegistryMusicModels } from "../services/syntxMediaCatalog.js";
export const IMAGE_PROTOCOLS = {
  kie: {
    id: "kie",
    baseUrl: "https://api.kie.ai",
    statusUrl: "https://api.kie.ai/api/v1/jobs/recordInfo",
    authType: "apikey",
    authHeader: "bearer",
    format: "kie-image",
    models: KIE_IMAGE_MODELS,
    supportedSizes: ["1:1", "16:9", "9:16", "4:3", "3:4"]
  },
  haiper: {
    id: "haiper",
    baseUrl: "https://api.haiper.ai/v1/jobs/gen2/text2image",
    statusUrl: "https://api.haiper.ai/v1/jobs",
    authType: "apikey",
    authHeader: "HAIPER_KEY",
    format: "haiper-image",
    models: [{ id: "gen2", name: "Gen 2 Image" }],
    supportedSizes: ["16:9", "9:16", "1:1", "4:3", "3:4"]
  },
  leonardo: {
    id: "leonardo",
    baseUrl: "https://cloud.leonardo.ai/api/rest/v1/generations",
    authType: "apikey",
    authHeader: "bearer",
    format: "leonardo-image",
    models: [
      { id: "phoenix", name: "Phoenix" },
      { id: "sdxl", name: "SDXL" }
    ],
    supportedSizes: ["1024x1024", "1024x576", "576x1024"]
  },
  ideogram: {
    id: "ideogram",
    baseUrl: "https://api.ideogram.ai/generate",
    authType: "apikey",
    authHeader: "Api-Key",
    format: "ideogram-image",
    models: [
      { id: "V_3", name: "Ideogram V3" },
      { id: "V_2A", name: "Ideogram V2A" }
    ],
    supportedSizes: ["1024x1024", "1024x1792", "1792x1024"]
  },
  magnific: MAGNIFIC_IMAGE_PROVIDER,
  pollinations: {
    id: "pollinations",
    alias: "pol",
    baseUrl: "https://gen.pollinations.ai/v1/images/generations",
    authType: "apikey",
    authHeader: "bearer",
    format: "openai",
    models: [
      { id: "klein", name: "FLUX.2 Klein 4B" },
      { id: "flux", name: "Flux Schnell" },
      { id: "zimage", name: "Z-Image Turbo" },
      { id: "qwen-image", name: "Qwen Image Plus" },
      { id: "wan-image", name: "Wan 2.7 Image" },
      { id: "gpt-image-2", name: "GPT Image 2" },
      { id: "gptimage-large", name: "GPT Image 1.5" },
      { id: "gptimage", name: "GPT Image 1 Mini" }
    ],
    supportedSizes: ["1024x1024", "512x512"]
  },
  segmind: SEGMIND_IMAGE_PROVIDER,
  cheaperinference: CHEAPERINFERENCE_IMAGE_PROVIDER,
  syntx: {
    id: "syntx",
    alias: "stx",
    baseUrl: "https://api.syntx.ai/api/v1/design/generate",
    authType: "apikey",
    authHeader: "bearer",
    format: "syntx-image",
    models: toRegistryImageModels(),
    supportedSizes: []
  }
};
export const VIDEO_PROTOCOLS = {
  kie: {
    id: "kie",
    baseUrl: "https://api.kie.ai",
    statusUrl: "https://api.kie.ai/api/v1/jobs/recordInfo",
    authType: "apikey",
    authHeader: "bearer",
    format: "kie-video",
    models: [
      { id: "veo/veo-3-1", name: "Veo 3.1", isMarket: true },
      { id: "veo/veo-3-1-fast", name: "Veo 3.1 Fast", isMarket: true },
      { id: "kling-3.0/video", name: "Kling 3.0", isMarket: true },
      { id: "bytedance/seedance-2", name: "Seedance v2.0", isMarket: true },
      { id: "wan/2-7-text-to-video", name: "Wan 2.7 T2V", isMarket: true },
      { id: "wan/2-7-image-to-video", name: "Wan 2.7 I2V", isMarket: true },
      { id: "hailuo/02-text-to-video-pro", name: "Hailuo Pro T2V", isMarket: true },
      { id: "hailuo/2-3-image-to-video-pro", name: "Hailuo 2.3 Pro I2V", isMarket: true },
      { id: "grok-imagine/text-to-video", name: "Grok Imagine T2V", isMarket: true },
      { id: "grok-imagine/image-to-video", name: "Grok Imagine I2V", isMarket: true },
      { id: "happyhorse/text-to-video", name: "HappyHorse T2V", isMarket: true },
      { id: "happyhorse/image-to-video", name: "HappyHorse I2V", isMarket: true },
      { id: "sora-2-text-to-video", name: "Sora 2 T2V", isMarket: true },
      { id: "sora-2-image-to-video", name: "Sora 2 I2V", isMarket: true },
      { id: "sora-2-pro-text-to-video", name: "Sora 2 Pro T2V", isMarket: true },
      { id: "sora-2-pro-image-to-video", name: "Sora 2 Pro I2V", isMarket: true }
    ]
  },
  haiper: {
    id: "haiper",
    baseUrl: "https://api.haiper.ai/v1/jobs/gen2/text2video",
    statusUrl: "https://api.haiper.ai/v1/jobs",
    authType: "apikey",
    authHeader: "HAIPER_KEY",
    format: "haiper-video",
    models: [{ id: "gen2", name: "Gen 2" }]
  },
  leonardo: {
    id: "leonardo",
    baseUrl: "https://cloud.leonardo.ai/api/rest/v1/generations",
    statusUrl: "https://cloud.leonardo.ai/api/rest/v1/generations",
    authType: "apikey",
    authHeader: "bearer",
    format: "leonardo-video",
    models: [{ id: "phoenix", name: "Phoenix Video" }]
  },
  segmind: {
    id: "segmind",
    baseUrl: "https://api.segmind.com/v1",
    authType: "apikey",
    authHeader: "x-api-key",
    format: "segmind",
    models: SEGMIND_VIDEO_MODELS
  },
  syntx: {
    id: "syntx",
    alias: "stx",
    baseUrl: "https://api.syntx.ai/api/v1/video/generate",
    authType: "apikey",
    authHeader: "bearer",
    format: "syntx-video",
    models: toRegistryVideoModels()
  }
};
export const MUSIC_PROTOCOLS = {
  kie: {
    id: "kie",
    baseUrl: "https://api.kie.ai",
    statusUrl: "https://api.kie.ai/api/v1/jobs/recordInfo",
    authType: "apikey",
    authHeader: "bearer",
    format: "kie-music",
    models: [
      { id: "suno-v4.0", name: "Suno V4.0" },
      { id: "suno-v3.5", name: "Suno V3.5" }
    ]
  },
  udio: {
    id: "udio",
    baseUrl: "https://www.udio.com/api/generate-proxy",
    statusUrl: "https://www.udio.com/api/songs",
    authType: "cookie",
    authHeader: "cookie",
    format: "udio-music",
    models: [{ id: "udio-default", name: "Udio Default" }]
  },
  syntx: {
    id: "syntx",
    alias: "stx",
    baseUrl: "https://api.syntx.ai/api/v1/audio/speech",
    authType: "apikey",
    authHeader: "bearer",
    format: "syntx-music",
    models: toRegistryMusicModels()
  }
};
