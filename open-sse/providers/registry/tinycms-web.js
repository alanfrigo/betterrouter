export default {
  "id": "tinycms-web",
  "priority": 300,
  "alias": "tcw",
  "display": {
    "name": "TinyCMS Web (Free/Sub)",
    "icon": "layers",
    "color": "#ED8936",
    "textIcon": "TC",
    "website": "https://site.tinycms.xyz"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Go to site.tinycms.xyz, open DevTools → Application → Local Storage, copy the value of 'app-config-uuid' (starts with 'R'), and paste it here.",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://gov.freegpt.win/api/openai/oneapi/v1/chat/completions",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "claude-fable-5",
      "name": "Claude Fable 5",
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
      "name": "Claude Opus 5"
    },
    {
      "id": "claude-sonnet-5",
      "name": "Claude Sonnet 5"
    },
    {
      "id": "gpt-5.6-sol",
      "name": "GPT 5.6 Sol"
    },
    {
      "id": "gpt-5.6-luna",
      "name": "GPT 5.6 Luna"
    },
    {
      "id": "gpt-5.5",
      "name": "GPT 5.5"
    },
    {
      "id": "gpt-5.4-mini",
      "name": "GPT 5.4 Mini"
    },
    {
      "id": "gpt-5.4-nano",
      "name": "GPT 5.4 Nano"
    },
    {
      "id": "gpt-5.3-thinking-free",
      "name": "GPT 5.3 Thinking Free",
      "supportsReasoning": true
    },
    {
      "id": "gpt-5.3-free",
      "name": "GPT 5.3 Free (Multimodal/Vision)"
    },
    {
      "id": "gpt-oss-120b",
      "name": "GPT-OSS 120B"
    },
    {
      "id": "gemini-3.6-flash",
      "name": "Gemini 3.6 Flash"
    },
    {
      "id": "gemini-3.1-pro-preview",
      "name": "Gemini 3.1 Pro"
    },
    {
      "id": "gemini-3.1-flash-lite-preview",
      "name": "Gemini 3.1 Flash Lite"
    },
    {
      "id": "grok-4.5",
      "name": "Grok 4.5"
    },
    {
      "id": "deepseek-v4-pro",
      "name": "DeepSeek V4 Pro"
    },
    {
      "id": "deepseek-v4-flash",
      "name": "DeepSeek V4 Flash"
    },
    {
      "id": "kimi-k3",
      "name": "Kimi K3"
    },
    {
      "id": "glm-5.2",
      "name": "GLM 5.2"
    },
    {
      "id": "qwen3.6-plus",
      "name": "Qwen 3.6 Plus"
    },
    {
      "id": "mimo-v2.5-pro",
      "name": "Mimo V2.5 Pro"
    },
    {
      "id": "mimo-v2.5",
      "name": "Mimo V2.5"
    }
  ],
  "passthroughModels": false
};
