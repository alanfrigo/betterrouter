export default {
  "id": "apmix",
  "alias": "apmix",
  "display": {
    "name": "Apmix",
    "icon": "hub",
    "color": "#7C3AED",
    "textIcon": "AP",
    "website": "https://apmix.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.apmix.ai/v1/chat/completions",
    "modelsUrl": "https://api.apmix.ai/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "claude-haiku-4-5",
      "name": "claude-haiku-4-5"
    },
    {
      "id": "claude-sonnet-5",
      "name": "claude-sonnet-5"
    },
    {
      "id": "claude-opus-5",
      "name": "claude-opus-5"
    },
    {
      "id": "claude-opus-4-8",
      "name": "claude-opus-4-8"
    },
    {
      "id": "claude-opus-4-7",
      "name": "claude-opus-4-7"
    },
    {
      "id": "claude-opus-4-6",
      "name": "claude-opus-4-6"
    },
    {
      "id": "claude-fable-5",
      "name": "claude-fable-5"
    },
    {
      "id": "claude-sonnet-4-6",
      "name": "claude-sonnet-4-6"
    },
    {
      "id": "gpt-5.6-terra",
      "name": "gpt-5.6-terra"
    },
    {
      "id": "gpt-5.6-sol",
      "name": "gpt-5.6-sol"
    },
    {
      "id": "gpt-5.6-luna",
      "name": "gpt-5.6-luna"
    },
    {
      "id": "gpt-5.5",
      "name": "gpt-5.5"
    },
    {
      "id": "gpt-6-astra",
      "name": "gpt-6-astra"
    },
    {
      "id": "gpt-6-sol",
      "name": "gpt-6-sol"
    },
    {
      "id": "gpt-6-luna",
      "name": "gpt-6-luna"
    },
    {
      "id": "gpt-6-luna-free",
      "name": "gpt-6-luna-free"
    },
    {
      "id": "gemini-3.8-flash",
      "name": "gemini-3.8-flash"
    },
    {
      "id": "gemini-3.7-flash",
      "name": "gemini-3.7-flash"
    },
    {
      "id": "gemini-3.6-flash",
      "name": "gemini-3.6-flash"
    },
    {
      "id": "gemini-3.1-pro",
      "name": "gemini-3.1-pro"
    },
    {
      "id": "grok-4.5",
      "name": "grok-4.5"
    },
    {
      "id": "grok-4.6",
      "name": "grok-4.6"
    },
    {
      "id": "grok-4.7",
      "name": "grok-4.7"
    },
    {
      "id": "deepseek-v4-pro",
      "name": "deepseek-v4-pro"
    },
    {
      "id": "deepseek-v4-flash",
      "name": "deepseek-v4-flash"
    },
    {
      "id": "deepseek-v4.1-flash",
      "name": "deepseek-v4.1-flash"
    },
    {
      "id": "deepseek-v4-flash-free",
      "name": "deepseek-v4-flash-free"
    },
    {
      "id": "qwen3.8-flash",
      "name": "qwen3.8-flash"
    },
    {
      "id": "qwen3.8-max",
      "name": "qwen3.8-max"
    },
    {
      "id": "glm-5.3-flash",
      "name": "glm-5.3-flash"
    },
    {
      "id": "glm-5.3",
      "name": "glm-5.3"
    },
    {
      "id": "glm-5.2",
      "name": "glm-5.2"
    },
    {
      "id": "glm-5-turbo",
      "name": "glm-5-turbo"
    },
    {
      "id": "kimi-k2.7-code",
      "name": "kimi-k2.7-code"
    },
    {
      "id": "kimi-k3",
      "name": "kimi-k3"
    },
    {
      "id": "mimo-v2.5-pro",
      "name": "mimo-v2.5-pro"
    },
    {
      "id": "mimo-v2.5",
      "name": "mimo-v2.5"
    },
    {
      "id": "hy4-preview",
      "name": "hy4-preview"
    },
    {
      "id": "composer-2.5-fast",
      "name": "composer-2.5-fast"
    },
    {
      "id": "minimax-m3",
      "name": "MiniMax M3",
      "contextLength": 1048576,
      "supportsVision": true
    },
    {
      "id": "muse-spark-1.3",
      "name": "muse-spark-1.3"
    }
  ],
  "serviceKinds": [
    "llm"
  ]
};
