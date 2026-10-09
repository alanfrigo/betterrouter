export default {
  "id": "opper",
  "alias": "opper",
  "display": {
    "name": "Opper",
    "icon": "router",
    "color": "#6366F1",
    "textIcon": "OP",
    "website": "https://opper.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.opper.ai/v3/compat/chat/completions",
    "modelsUrl": "https://api.opper.ai/v3/compat/models",
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
  "passthroughModels": true
};
