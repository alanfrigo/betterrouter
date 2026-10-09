export default {
  "id": "unorouter",
  "alias": "unorouter",
  "display": {
    "name": "UnoRouter",
    "icon": "unorouter",
    "color": "#8B5CF6",
    "textIcon": "UR",
    "website": "https://unorouter.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.unorouter.com/v1/chat/completions",
    "modelsUrl": "https://api.unorouter.com/v1/models",
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
