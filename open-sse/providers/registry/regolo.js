export default {
  "id": "regolo",
  "alias": "regolo",
  "display": {
    "name": "Regolo AI",
    "icon": "hub",
    "color": "#6366F1",
    "textIcon": "RG",
    "website": "https://regolo.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.regolo.ai/v1/chat/completions",
    "modelsUrl": "https://api.regolo.ai/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [],
  "serviceKinds": [
    "llm"
  ],
  "passthroughModels": true,
  "authHint": "Get your Regolo API key from regolo.ai, then paste it here as a Bearer token."
};
