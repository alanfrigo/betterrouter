export default {
  "id": "fenayai",
  "alias": "fenayai",
  "category": "apikey",
  "display": {
    "name": "FenayAI",
    "icon": "hub",
    "color": "#FF9800",
    "textIcon": "FN",
    "website": "https://fenayai.com"
  },
  "transport": {
    "format": "openai",
    "baseUrl": "https://fenayai.com/v1/chat/completions",
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
