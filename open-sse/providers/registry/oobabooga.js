export default {
  "id": "oobabooga",
  "alias": "ooba",
  "category": "apikey",
  "noAuth": true,
  "hasProviderSpecificData": true,
  "localDefault": "http://localhost:5000/v1",
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Base URL",
      "placeholder": "http://localhost:5000/v1"
    }
  ],
  "display": {
    "name": "oobabooga",
    "icon": "dns",
    "color": "#8B5CF6",
    "textIcon": "OO",
    "website": "https://github.com/oobabooga/text-generation-webui"
  },
  "authHint": "API key optional. Configure the local oobabooga OpenAI-compatible base URL (default: http://localhost:5000/v1).",
  "passthroughModels": true,
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "format": "openai",
    "baseUrl": "http://localhost:5000/v1/chat/completions",
    "modelsUrl": "http://localhost:5000/v1/models",
    "connectionBaseUrl": true,
    "noAuth": true
  },
  "models": []
};
