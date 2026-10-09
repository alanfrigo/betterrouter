export default {
  "id": "openadapter",
  "alias": "oad",
  "display": {
    "name": "OpenAdapter",
    "icon": "hub",
    "color": "#10B981",
    "textIcon": "OD",
    "website": "https://openadapter.dev"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.openadapter.in/v1/chat/completions",
    "modelsUrl": "https://api.openadapter.in/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "glm-4.7",
      "name": "GLM 4.7 (OpenAdapter)",
      "contextLength": 128000,
      "toolCalling": true
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "authHint": "Use your OpenAdapter API key in Authorization: Bearer sk-cv-<key>. Fully OpenAI-compatible. API base URL: https://api.openadapter.in/v1."
};
