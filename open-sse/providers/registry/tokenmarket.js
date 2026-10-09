export default {
  "id": "tokenmarket",
  "alias": "tokenmarket",
  "display": {
    "name": "Token Market",
    "icon": "hub",
    "color": "#2563EB",
    "textIcon": "TM",
    "website": "https://www.tokensmarket.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.tokensmarket.ai/v1/chat/completions",
    "modelsUrl": "https://api.tokensmarket.ai/v1/models",
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
  "authHint": "Create an API key in the Token Market console, then paste it here as a Bearer token."
};
