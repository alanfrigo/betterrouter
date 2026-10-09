export default {
  "id": "x5lab",
  "alias": "x5lab",
  "display": {
    "name": "X5Lab",
    "icon": "router",
    "color": "#7C3AED",
    "textIcon": "X5",
    "website": "https://x5lab.dev"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.x5lab.dev/v1/chat/completions",
    "modelsUrl": "https://api.x5lab.dev/v1/models",
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
  "authHint": "Use your X5Lab API key (x5-...) in Authorization: Bearer <key>. Fully OpenAI-compatible. API base URL: https://api.x5lab.dev/v1."
};
