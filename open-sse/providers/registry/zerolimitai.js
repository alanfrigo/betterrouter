export default {
  "id": "zerolimitai",
  "alias": "zerolimitai",
  "display": {
    "name": "ZeroLimitAI",
    "icon": "router",
    "color": "#475569",
    "textIcon": "ZL",
    "website": "https://www.zerolimitai.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://www.zerolimitai.com/api/v1/chat/completions",
    "modelsUrl": "https://www.zerolimitai.com/api/v1/models",
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
