export default {
  "id": "aion",
  "alias": "aion",
  "display": {
    "name": "Aion Labs",
    "icon": "hub",
    "color": "#0EA5E9",
    "textIcon": "AI",
    "website": "https://www.aionlabs.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.aionlabs.ai/v1/chat/completions",
    "modelsUrl": "https://api.aionlabs.ai/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "aion-labs/aion-3.0",
      "name": "Aion 3.0",
      "contextLength": 131072
    },
    {
      "id": "aion-labs/aion-3.0-mini",
      "name": "Aion 3.0 Mini",
      "contextLength": 131072
    },
    {
      "id": "aion-labs/aion-2.5",
      "name": "Aion 2.5",
      "contextLength": 131072
    },
    {
      "id": "aion-labs/aion-2.0",
      "name": "Aion 2.0",
      "contextLength": 131072
    },
    {
      "id": "aion-labs/aion-rp-llama-3.1-8b",
      "name": "Aion RP Llama 3.1 8B",
      "contextLength": 32768
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true,
  "authHint": "Create a free API key at aionlabs.ai (no card), then paste it here as a Bearer token."
};
