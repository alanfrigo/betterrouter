export default {
  "id": "free-ai",
  "alias": "free-ai",
  "display": {
    "name": "Free.ai",
    "icon": "hub",
    "color": "#16A34A",
    "textIcon": "FA",
    "website": "https://free.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.free.ai/v1/chat/",
    "modelsUrl": "https://api.free.ai/v1/models",
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
