export default {
  "id": "fastrouter",
  "alias": "fastrouter",
  "display": {
    "name": "FastRouter",
    "icon": "speed",
    "color": "#F97316",
    "textIcon": "FR",
    "website": "https://fastrouter.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.fastrouter.ai/api/v1/chat/completions",
    "modelsUrl": "https://api.fastrouter.ai/api/v1/models",
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
