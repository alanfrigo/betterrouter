export default {
  "id": "void-ai",
  "alias": "void-ai",
  "display": {
    "name": "Void AI",
    "icon": "science",
    "color": "#111827",
    "textIcon": "VA",
    "website": "https://voidai.app"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.voidai.app/v1/chat/completions",
    "modelsUrl": "https://api.voidai.app/v1/models",
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
