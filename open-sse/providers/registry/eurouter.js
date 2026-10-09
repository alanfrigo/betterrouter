export default {
  "id": "eurouter",
  "alias": "eurouter",
  "display": {
    "name": "EURouter",
    "icon": "router",
    "color": "#1D4ED8",
    "textIcon": "EUR",
    "website": "https://eurouter.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.eurouter.ai/v1/chat/completions",
    "modelsUrl": "https://api.eurouter.ai/v1/models",
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
  "hasFree": false,
  "passthroughModels": true
};
