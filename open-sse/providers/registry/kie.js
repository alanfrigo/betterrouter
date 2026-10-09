import { IMAGE_PROTOCOLS, VIDEO_PROTOCOLS, MUSIC_PROTOCOLS } from "../../config/mediaProtocols.js";
export default {
  "id": "kie",
  "alias": "kie",
  "display": {
    "name": "KIE.AI",
    "icon": "hub",
    "color": "#2563EB",
    "textIcon": "KIE",
    "website": "https://kie.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.kie.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "claude-fable-5",
      "name": "Claude 5 Fable",
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ]
    },
    {
      "id": "claude-opus-5",
      "name": "Claude 5 Opus"
    },
    {
      "id": "claude-sonnet-5",
      "name": "Claude 5 Sonnet"
    },
    {
      "id": "claude-haiku-4-5",
      "name": "Claude 4.5 Haiku"
    },
    {
      "id": "gpt-5-6-sol",
      "name": "GPT 5.6 Sol"
    },
    {
      "id": "gpt-5-6-terra",
      "name": "GPT 5.6 Terra"
    },
    {
      "id": "gpt-5-6-luna",
      "name": "GPT 5.6 Luna"
    },
    {
      "id": "gemini-3-1-pro",
      "name": "Gemini 3.1 Pro"
    },
    {
      "id": "gemini-3-7-flash",
      "name": "Gemini 3.7 Flash"
    },
    {
      "id": "grok-4-6",
      "name": "Grok 4.6"
    }
  ],
  serviceKinds: ["llm","image","video","music"],
  imageConfig: IMAGE_PROTOCOLS.kie,
  videoConfig: VIDEO_PROTOCOLS.kie,
  musicConfig: MUSIC_PROTOCOLS.kie,
};
