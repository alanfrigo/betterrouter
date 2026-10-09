export default {
  "id": "greenpt",
  "alias": "greenpt",
  "display": {
    "name": "GreenPT",
    "icon": "eco",
    "color": "#15803D",
    "textIcon": "GPT",
    "website": "https://greenpt.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.greenpt.ai/v1/chat/completions",
    "modelsUrl": "https://api.greenpt.ai/v1/models",
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
