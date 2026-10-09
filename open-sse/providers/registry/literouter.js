export default {
  "id": "literouter",
  "alias": "literouter",
  "display": {
    "name": "LiteRouter",
    "icon": "router",
    "color": "#2563EB",
    "textIcon": "LR",
    "website": "https://literouter.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.literouter.com/v1/chat/completions",
    "modelsUrl": "https://api.literouter.com/v1/models",
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
