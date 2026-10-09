export default {
  "id": "speka",
  "alias": "speka",
  "display": {
    "name": "Speka AI",
    "icon": "router",
    "color": "#DB2777",
    "textIcon": "SP",
    "website": "https://speka.me"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://speka.me/v1/chat/completions",
    "modelsUrl": "https://speka.me/v1/models",
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
