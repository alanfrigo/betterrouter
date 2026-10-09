export default {
  "id": "onomeo",
  "alias": "onomeo",
  "display": {
    "name": "onomeo",
    "icon": "router",
    "color": "#C2410C",
    "textIcon": "ONO",
    "website": "https://onomeo.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://onomeo.com/v1/chat/completions",
    "modelsUrl": "https://onomeo.com/v1/models",
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
