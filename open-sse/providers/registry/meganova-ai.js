export default {
  "id": "meganova-ai",
  "alias": "meganova-ai",
  "display": {
    "name": "MegaNova AI",
    "icon": "router",
    "color": "#7C3AED",
    "textIcon": "MN",
    "website": "https://meganova.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.meganova.ai/v1/chat/completions",
    "modelsUrl": "https://api.meganova.ai/v1/models",
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
