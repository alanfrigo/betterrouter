export default {
  "id": "lyceum",
  "alias": "lyceum",
  "display": {
    "name": "Lyceum",
    "icon": "router",
    "color": "#4F46E5",
    "textIcon": "LY",
    "website": "https://lyceum.technology"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.lyceum.technology/openai/v1/chat/completions",
    "modelsUrl": "https://api.lyceum.technology/openai/v1/models",
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
