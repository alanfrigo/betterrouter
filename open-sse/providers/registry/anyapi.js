export default {
  "id": "anyapi",
  "alias": "anyapi",
  "display": {
    "name": "AnyAPI AI",
    "icon": "hub",
    "color": "#0EA5E9",
    "textIcon": "AA",
    "website": "https://anyapi.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.anyapi.ai/v1/chat/completions",
    "modelsUrl": "https://api.anyapi.ai/v1/models",
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
