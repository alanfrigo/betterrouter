export default {
  "id": "llamafile",
  "alias": "llamafile",
  "category": "apikey",
  "noAuth": true,
  "hasProviderSpecificData": true,
  "localDefault": "http://127.0.0.1:8080/v1",
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Base URL",
      "placeholder": "http://127.0.0.1:8080/v1"
    }
  ],
  "display": {
    "name": "Llamafile",
    "icon": "article",
    "color": "#EA580C",
    "textIcon": "LF",
    "website": "https://github.com/Mozilla-Ocho/llamafile"
  },
  "authHint": "API key optional. Configure the local Llamafile OpenAI-compatible base URL (default: http://127.0.0.1:8080/v1).",
  "passthroughModels": true,
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "format": "openai",
    "baseUrl": "http://127.0.0.1:8080/v1/chat/completions",
    "modelsUrl": "http://127.0.0.1:8080/v1/models",
    "connectionBaseUrl": true,
    "noAuth": true
  },
  "models": []
};
