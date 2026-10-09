export default {
  "id": "navy",
  "alias": "navy",
  "display": {
    "name": "NavyAI",
    "icon": "hub",
    "color": "#1E3A8A",
    "textIcon": "NV",
    "website": "https://api.navy"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.navy/v1/chat/completions",
    "modelsUrl": "https://api.navy/v1/models",
    "headers": {
      "User-Agent": "OmniRoute/1.0"
    },
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "llama-3.3-70b-instruct",
      "name": "Llama 3.3 70B Instruct",
      "contextLength": 131072,
      "toolCalling": true
    },
    {
      "id": "gemma-4-31b-it",
      "name": "Gemma 4 31B IT",
      "contextLength": 262144,
      "toolCalling": true,
      "supportsVision": true,
      "supportsReasoning": true
    },
    {
      "id": "deepseek-v4-flash",
      "name": "DeepSeek V4 Flash",
      "contextLength": 1048576,
      "toolCalling": true,
      "supportsReasoning": true
    },
    {
      "id": "deepseek-chat",
      "name": "DeepSeek Chat",
      "contextLength": 131072,
      "toolCalling": true
    },
    {
      "id": "mistral-small-latest",
      "name": "Mistral Small",
      "contextLength": 262144,
      "toolCalling": true,
      "supportsVision": true,
      "supportsReasoning": true
    },
    {
      "id": "llama-4-scout",
      "name": "Llama 4 Scout",
      "contextLength": 10000000,
      "toolCalling": true,
      "supportsVision": true
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true,
  "authHint": "Create a free API key from the NavyAI dashboard, then paste it here as a Bearer token."
};
