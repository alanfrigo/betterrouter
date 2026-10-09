export default {
  "id": "poixe-ai",
  "alias": "poixe-ai",
  "display": {
    "name": "Poixe AI",
    "icon": "router",
    "color": "#EA580C",
    "textIcon": "PX",
    "website": "https://poixe.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.poixe.com/v1/chat/completions",
    "modelsUrl": "https://api.poixe.com/v1/models",
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
