export default {
  "id": "mixlayer",
  "alias": "mixlayer",
  "display": {
    "name": "Mixlayer",
    "icon": "router",
    "color": "#0EA5E9",
    "textIcon": "MX",
    "website": "https://www.mixlayer.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://models.mixlayer.ai/v1/chat/completions",
    "modelsUrl": "https://models.mixlayer.ai/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "qwen/qwen3.5-4b-free",
      "name": "Qwen 3.5 4B (free)"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true
};
