import { EXTRA_IMAGES, EXTRA_VIDEOS } from "../../config/extraMediaProtocols.js";
export default {
  "id": "novita",
  "alias": "novita",
  "category": "apikey",
  "display": {
    "name": "Novita AI",
    "icon": "auto_awesome",
    "color": "#FF4081",
    "textIcon": "NV",
    "website": "https://novita.ai"
  },
  "models": [
    {
      "id": "deepseek/deepseek-v4-pro",
      "name": "DeepSeek V4 Pro",
      "supportsReasoning": true,
      "contextLength": 1048576,
      "maxOutputTokens": 393216
    },
    {
      "id": "deepseek/deepseek-v4-flash",
      "name": "DeepSeek V4 Flash",
      "supportsReasoning": true,
      "contextLength": 1048576,
      "maxOutputTokens": 393216
    },
    {
      "id": "deepseek/deepseek-v3.2",
      "name": "DeepSeek V3.2",
      "supportsReasoning": true,
      "contextLength": 163840,
      "maxOutputTokens": 65536
    },
    {
      "id": "moonshotai/kimi-k3",
      "name": "Kimi K3",
      "supportsReasoning": true,
      "supportsVision": true,
      "contextLength": 1048576,
      "maxOutputTokens": 1048576
    },
    {
      "id": "moonshotai/kimi-k2.7-code",
      "name": "Kimi K2.7 Code",
      "supportsReasoning": true,
      "supportsVision": true,
      "contextLength": 262144,
      "maxOutputTokens": 262144
    },
    {
      "id": "moonshotai/kimi-k2.6",
      "name": "Kimi K2.6",
      "supportsReasoning": true,
      "supportsVision": true,
      "contextLength": 262144,
      "maxOutputTokens": 262144
    },
    {
      "id": "zai-org/glm-5.2",
      "name": "GLM 5.2",
      "supportsReasoning": true,
      "contextLength": 1048576,
      "maxOutputTokens": 131072
    },
    {
      "id": "zai-org/glm-5.1",
      "name": "GLM 5.1",
      "supportsReasoning": true,
      "contextLength": 204800,
      "maxOutputTokens": 131072
    },
    {
      "id": "zai-org/glm-4.7",
      "name": "GLM 4.7",
      "supportsReasoning": true,
      "contextLength": 204800,
      "maxOutputTokens": 131072
    },
    {
      "id": "minimax/minimax-m3",
      "name": "MiniMax M3",
      "supportsReasoning": true,
      "supportsVision": true,
      "contextLength": 1000000,
      "maxOutputTokens": 131072
    },
    {
      "id": "minimax/minimax-m2.7",
      "name": "MiniMax M2.7",
      "supportsReasoning": true,
      "contextLength": 204800,
      "maxOutputTokens": 131072
    },
    {
      "id": "qwen/qwen3.7-max",
      "name": "Qwen3.7 Max",
      "supportsReasoning": true,
      "contextLength": 1000000,
      "maxOutputTokens": 65536
    },
    {
      "id": "qwen/qwen3.6-plus",
      "name": "Qwen3.6 Plus",
      "supportsReasoning": true,
      "supportsVision": true,
      "contextLength": 1000000,
      "maxOutputTokens": 65536
    },
    {
      "id": "qwen/qwen3.5-397b-a17b",
      "name": "Qwen3.5 397B A17B",
      "supportsReasoning": true,
      "supportsVision": true,
      "contextLength": 262144,
      "maxOutputTokens": 65536
    },
    {
      "id": "qwen/qwen3-coder-480b-a35b-instruct",
      "name": "Qwen3 Coder 480B",
      "contextLength": 262144,
      "maxOutputTokens": 65536
    },
    {
      "id": "xiaomimimo/mimo-v2.5-pro",
      "name": "MiMo V2.5 Pro",
      "supportsReasoning": true,
      "contextLength": 1048576,
      "maxOutputTokens": 131072
    },
    {
      "id": "openai/gpt-oss-120b",
      "name": "OpenAI gpt-oss-120b",
      "supportsReasoning": true,
      "contextLength": 131072,
      "maxOutputTokens": 32768
    },
    {
      "id": "google/gemma-4-31b-it",
      "name": "Gemma 4 31B",
      "supportsReasoning": true,
      "supportsVision": true,
      "contextLength": 262144,
      "maxOutputTokens": 131072
    },
    {
      "id": "meta-llama/llama-3.1-8b-instruct",
      "name": "Llama 3.1 8B Instruct",
      "contextLength": 16384,
      "maxOutputTokens": 16384
    }
  ],
  serviceKinds: ["llm","video"],
  videoConfig: EXTRA_VIDEOS.novita,
  "passthroughModels": true,
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.novita.ai/openai/v1/chat/completions",
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  }
};
