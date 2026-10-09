export default {
  "id": "lm-studio",
  "alias": "lmstudio",
  "category": "apikey",
  "noAuth": true,
  "hasProviderSpecificData": true,
  "localDefault": "http://localhost:1234/v1",
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Base URL",
      "placeholder": "http://localhost:1234/v1"
    }
  ],
  "display": {
    "name": "LM Studio",
    "icon": "server",
    "color": "#4A148C",
    "textIcon": "LM",
    "website": "https://lmstudio.ai"
  },
  "authHint": "API key optional. Configure the local LM Studio OpenAI-compatible base URL (default: http://localhost:1234/v1).",
  "passthroughModels": true,
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "format": "openai",
    "baseUrl": "http://localhost:1234/v1/chat/completions",
    "modelsUrl": "http://localhost:1234/v1/models",
    "connectionBaseUrl": true,
    "noAuth": true
  },
  "models": []
};
