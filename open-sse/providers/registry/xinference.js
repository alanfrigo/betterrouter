export default {
  "id": "xinference",
  "alias": "xinference",
  "category": "apikey",
  "noAuth": true,
  "hasProviderSpecificData": true,
  "localDefault": "http://localhost:9997/v1",
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Base URL",
      "placeholder": "http://localhost:9997/v1"
    }
  ],
  "display": {
    "name": "XInference",
    "icon": "hub",
    "color": "#DC2626",
    "textIcon": "XI",
    "website": "https://inference.readthedocs.io"
  },
  "authHint": "API key optional. Configure the local XInference OpenAI-compatible base URL (default: http://localhost:9997/v1).",
  "passthroughModels": true,
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "format": "openai",
    "baseUrl": "http://localhost:9997/v1/chat/completions",
    "modelsUrl": "http://localhost:9997/v1/models",
    "connectionBaseUrl": true,
    "noAuth": true
  },
  "models": []
};
