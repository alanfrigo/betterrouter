export default {
  "id": "auriko",
  "alias": "auriko",
  "display": {
    "name": "Auriko",
    "icon": "hub",
    "color": "#0891B2",
    "textIcon": "AU",
    "website": "https://www.auriko.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.auriko.ai/v1/chat/completions",
    "modelsUrl": "https://api.auriko.ai/v1/models",
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
