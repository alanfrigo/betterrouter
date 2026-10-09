export default {
  "id": "lemonade",
  "alias": "lemonade",
  "category": "apikey",
  "noAuth": true,
  "hasProviderSpecificData": true,
  "localDefault": "http://localhost:13305/api/v1",
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Base URL",
      "placeholder": "http://localhost:13305/api/v1"
    }
  ],
  "display": {
    "name": "Lemonade Server",
    "icon": "bolt",
    "color": "#F59E0B",
    "textIcon": "LM",
    "website": "https://lemonade-server.ai"
  },
  "authHint": "API key optional. Configure the local Lemonade OpenAI-compatible base URL (default: http://localhost:13305/api/v1).",
  "passthroughModels": true,
  "serviceKinds": [
    "llm",
    "embedding"
  ],
  "transport": {
    "format": "openai",
    "baseUrl": "http://localhost:13305/api/v1/chat/completions",
    "modelsUrl": "http://localhost:13305/api/v1/models",
    "connectionBaseUrl": true,
    "noAuth": true
  },
  "models": [],
  "embeddingConfig": {
    "baseUrl": "http://localhost:13305/api/v1/embeddings",
    "authType": "none",
    "format": "openai",
    "connectionBaseUrl": true,
  }
};
