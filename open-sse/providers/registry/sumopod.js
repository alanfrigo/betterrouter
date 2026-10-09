export default {
  "id": "sumopod",
  "alias": "sumopod",
  "display": {
    "name": "SumoPod",
    "icon": "router",
    "color": "#2563EB",
    "textIcon": "SP",
    "website": "https://ai.sumopod.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://ai.sumopod.com/v1/chat/completions",
    "modelsUrl": "https://ai.sumopod.com/v1/models",
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
  "authHint": "Use your SumoPod API key (sk-...) in Authorization: Bearer <key>. Fully OpenAI-compatible. API base URL: https://ai.sumopod.com/v1."
};
