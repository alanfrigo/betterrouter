export default {
  "id": "mnn-ai",
  "alias": "mnn-ai",
  "display": {
    "name": "MNN AI",
    "icon": "hub",
    "color": "#0F766E",
    "textIcon": "MNN",
    "website": "https://mnnai.ru"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.mnnai.ru/v1/chat/completions",
    "modelsUrl": "https://api.mnnai.ru/v1/models",
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
