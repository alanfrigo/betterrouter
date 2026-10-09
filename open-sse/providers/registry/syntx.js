import { IMAGE_PROTOCOLS, VIDEO_PROTOCOLS, MUSIC_PROTOCOLS } from '../../config/mediaProtocols.js';
import { toRegistrySpeechModels, toRegistryTranscriptionModels } from '../../services/syntxMediaCatalog.js';
export default {
  "id": "syntx",
  "alias": "stx",
  "display": {
    "id": "syntx",
    "serviceKinds": [
      "llm"
    ],
    "alias": "stx",
    "name": "SYNTX.ai (Unofficial/Experimental)",
    "icon": "auto_awesome",
    "color": "#FF4D00",
    "textIcon": "SX",
    "website": "https://syntx.ai",
    "subscriptionRisk": true,
    "riskNoticeVariant": "webCookie",
    "toolCalling": "emulated",
    "authHint": "Paste the Authorization Bearer JWT from syntx.ai (DevTools → Network → api.syntx.ai → Request Headers). Chat, models, Limits, and media use this token."
  },
  "category": "webCookie",
  "authType": "apikey",
  "serviceKinds": [
    "llm",
    "image",
    "video",
    "music",
    "tts",
    "stt"
  ],
  "transport": {
    "baseUrl": "https://api.syntx.ai/api/v1",
    "format": "openai"
  },
  "models": [
    {
      "id": "claude-fable-5-1",
      "name": "Claude Fable 5.1",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "claude-haiku-4-5-20251001",
      "name": "Claude Haiku 4.5",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "claude-opus-5",
      "name": "Claude Opus 5",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "claude-fable-5",
      "name": "Claude Fable 5",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "claude-opus-4-6",
      "name": "Claude Opus 4.6",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "claude-opus-4-7",
      "name": "Claude Opus 4.7",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "claude-opus-4-8",
      "name": "Claude Opus 4.8",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "claude-sonnet-4-6",
      "name": "Claude Sonnet 4.6",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "claude-sonnet-5",
      "name": "Claude Sonnet 5",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "qwen3-max-2026-01-23",
      "name": "Qwen 3 Max",
      "toolCalling": true,
      "supportsVision": false
    },
    {
      "id": "qwen3.7-max",
      "name": "Qwen 3.7 Max",
      "toolCalling": true,
      "supportsVision": false
    },
    {
      "id": "qwen3.7-plus",
      "name": "Qwen 3.7 Plus",
      "toolCalling": true,
      "supportsVision": false
    },
    {
      "id": "deepseek-r1",
      "name": "DeepSeek R1",
      "toolCalling": true,
      "supportsVision": false
    },
    {
      "id": "deepseek-v3",
      "name": "DeepSeek V3",
      "toolCalling": true,
      "supportsVision": false
    },
    {
      "id": "gemini-3.1-pro-preview",
      "name": "Gemini 3.1 Pro",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gemini-3.5-flash",
      "name": "Gemini 3.5 Flash",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gemini-3.5-flash-lite",
      "name": "Gemini 3.5 Flash Lite",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gemini-3.6-flash",
      "name": "Gemini 3.6 Flash",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gemini-3.7-flash",
      "name": "Gemini 3.7 Flash",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gemini-3.8-flash",
      "name": "Gemini 3.8 Flash",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gpt-5-mini-2025-08-07",
      "name": "GPT-5 Mini",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gpt-5-nano-2025-08-07",
      "name": "GPT-5 Nano",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gpt-5.6-luna",
      "name": "GPT 5.6 Luna",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gpt-6-astra",
      "name": "GPT 6 Astra",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gpt-5.6-terra",
      "name": "GPT 5.6 Terra",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gpt-5.6-sol",
      "name": "GPT 5.6 Sol",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gpt-5.2",
      "name": "GPT 5.2",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gpt-5.4",
      "name": "GPT 5.4",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gpt-5.5",
      "name": "GPT 5.5",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "sonar",
      "name": "Perplexity Sonar + Internet",
      "toolCalling": true,
      "supportsVision": false
    },
    {
      "id": "grok-4.6",
      "name": "Grok 4.6",
      "toolCalling": true,
      "supportsVision": false
    },
    {
      "id": "grok-4.3",
      "name": "Grok 4.3",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "grok-4.5",
      "name": "Grok 4.5",
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "glm-5.2",
      "name": "GLM 5.2",
      "toolCalling": true,
      "supportsVision": false
    }
  ],
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie",
  "toolCalling": "emulated",
  imageConfig: IMAGE_PROTOCOLS["syntx"],
  videoConfig: VIDEO_PROTOCOLS["syntx"],
  musicConfig: MUSIC_PROTOCOLS["syntx"],
  ttsConfig: {baseUrl:"https://api.syntx.ai/api/v1/audio/speech",authType:"apikey",format:"syntx-audio",models:toRegistrySpeechModels()},
  sttConfig: {baseUrl:"https://api.syntx.ai/api/v1/audio/transcriptions",authType:"apikey",format:"syntx-audio",models:toRegistryTranscriptionModels()}
};
