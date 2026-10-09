export default {
  "id": "y-api",
  "alias": "y-api",
  "display": {
    "name": "Y-API",
    "icon": "router",
    "color": "#0891B2",
    "textIcon": "YA",
    "website": "https://y-api.bestvirtualgoods.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.y-api.bestvirtualgoods.com/v1/chat/completions",
    "modelsUrl": "https://api.y-api.bestvirtualgoods.com/v1/models",
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
