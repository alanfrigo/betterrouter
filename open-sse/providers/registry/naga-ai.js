export default {
  "id": "naga-ai",
  "alias": "naga-ai",
  "display": {
    "name": "Naga AI",
    "icon": "router",
    "color": "#059669",
    "textIcon": "NA",
    "website": "https://naga.ac"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.naga.ac/v1/chat/completions",
    "modelsUrl": "https://api.naga.ac/v1/models",
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
