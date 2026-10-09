export default {
  "id": "docker-model-runner",
  "alias": "dmr",
  "category": "apikey",
  "noAuth": true,
  "hasProviderSpecificData": true,
  "localDefault": "http://localhost:12434/v1",
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Base URL",
      "placeholder": "http://localhost:12434/v1"
    }
  ],
  "display": {
    "name": "Docker Model Runner",
    "icon": "inventory_2",
    "color": "#2496ED",
    "textIcon": "DM",
    "website": "https://docs.docker.com/ai/model-runner/"
  },
  "authHint": "API key optional. Configure the local Docker Model Runner OpenAI-compatible base URL (default: http://localhost:12434/v1).",
  "passthroughModels": true,
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "format": "openai",
    "baseUrl": "http://localhost:12434/v1/chat/completions",
    "modelsUrl": "http://localhost:12434/v1/models",
    "connectionBaseUrl": true,
    "noAuth": true
  },
  "models": []
};
