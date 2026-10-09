export default {
  "id": "requesty",
  "alias": "requesty",
  "display": {
    "name": "Requesty",
    "icon": "router",
    "color": "#6366F1",
    "textIcon": "RQ",
    "website": "https://requesty.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://router.requesty.ai/v1/chat/completions",
    "modelsUrl": "https://router.requesty.ai/v1/models",
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
  "hasFree": true,
  "passthroughModels": true
};
