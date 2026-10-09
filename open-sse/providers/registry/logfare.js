export default {
  "id": "logfare",
  "alias": "logfare",
  "display": {
    "name": "Logfare",
    "icon": "auto_awesome",
    "color": "#22C55E",
    "textIcon": "LF",
    "website": "https://logfare.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://logfare.ai/v1/chat/completions",
    "modelsUrl": "https://logfare.ai/v1/models",
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
  "passthroughModels": true,
  "authHint": "Create a free account at https://logfare.ai/register (username/password, no email verification) to get an instant API key, then paste it here as a Bearer token."
};
