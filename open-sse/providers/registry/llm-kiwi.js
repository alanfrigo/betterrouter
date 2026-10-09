export default {
  "id": "llm-kiwi",
  "alias": "llmkiwi",
  "display": {
    "name": "LLM.Kiwi",
    "icon": "hub",
    "color": "#84CC16",
    "textIcon": "LK",
    "website": "https://llm.kiwi"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.llm.kiwi/v1/chat/completions",
    "modelsUrl": "https://api.llm.kiwi/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "auto",
      "name": "Auto"
    },
    {
      "id": "hrLLM",
      "name": "hrLLM"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true
};
