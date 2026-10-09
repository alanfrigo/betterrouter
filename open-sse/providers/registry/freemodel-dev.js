export default {
  "id": "freemodel-dev",
  "alias": "fmd",
  "display": {
    "name": "FreeModel.dev",
    "icon": "auto_awesome",
    "color": "#8B5CF6",
    "textIcon": "FM",
    "website": "https://freemodel.dev"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.freemodel.dev/v1/chat/completions",
    "modelsUrl": "https://api.freemodel.dev/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "gpt-5.5",
      "name": "GPT-5.5",
      "contextLength": 400000
    },
    {
      "id": "gpt-5.4",
      "name": "GPT-5.4",
      "contextLength": 400000
    },
    {
      "id": "gpt-5.4-mini",
      "name": "GPT-5.4 Mini"
    },
    {
      "id": "gpt-5.3-codex",
      "name": "GPT-5.3 Codex"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true
};
