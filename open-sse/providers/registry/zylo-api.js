export default {
  "id": "zylo-api",
  "alias": "zylo",
  "display": {
    "name": "Zylo API",
    "icon": "hub",
    "color": "#2563EB",
    "textIcon": "ZY",
    "website": "https://zyloai.net"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.zyloai.net/v1/chat/completions",
    "modelsUrl": "https://api.zyloai.net/v1/models",
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
