export default {
  "id": "ofoxai",
  "alias": "ofoxai",
  "display": {
    "name": "OfoxAI",
    "icon": "router",
    "color": "#0F766E",
    "textIcon": "OF",
    "website": "https://ofox.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.ofox.ai/v1/chat/completions",
    "modelsUrl": "https://api.ofox.ai/v1/models",
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
