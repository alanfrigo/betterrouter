export default {
  "id": "unifically",
  "alias": "unifically",
  "display": {
    "name": "Unifically",
    "icon": "hub",
    "color": "#10B981",
    "textIcon": "UNI",
    "website": "https://unifically.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.unifically.com/v1/chat/completions",
    "modelsUrl": "https://api.unifically.com/v1/models?category=llm",
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
