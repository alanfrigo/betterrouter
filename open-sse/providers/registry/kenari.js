export default {
  "id": "kenari",
  "alias": "kenari",
  "display": {
    "name": "Kenari",
    "icon": "hub",
    "color": "#B5362A",
    "textIcon": "KN",
    "website": "https://kenari.id"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://kenari.id/v1/chat/completions",
    "modelsUrl": "https://kenari.id/v1/models",
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
  "passthroughModels": true,
  "authHint": "Use your Kenari API key (kn-...) in Authorization: Bearer <key>. Fully OpenAI-compatible. API base URL: https://kenari.id/v1."
};
