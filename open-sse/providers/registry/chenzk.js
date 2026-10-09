export default {
  "id": "chenzk",
  "alias": "chenzk",
  "display": {
    "name": "Chenzk API",
    "icon": "hub",
    "color": "#10B981",
    "textIcon": "CZ",
    "website": "https://chenzk.top"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://chenzk.top/v1/chat/completions",
    "modelsUrl": "https://chenzk.top/v1/models",
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
  "passthroughModels": true
};
