export default {
  "id": "electronhub",
  "alias": "electronhub",
  "display": {
    "name": "Electron Hub",
    "icon": "hub",
    "color": "#22C55E",
    "textIcon": "EH",
    "website": "https://www.electronhub.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.electronhub.ai/v1/chat/completions",
    "modelsUrl": "https://api.electronhub.ai/v1/models",
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
