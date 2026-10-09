export default {
  "id": "chatanywhere",
  "alias": "chatanywhere",
  "display": {
    "name": "ChatAnywhere",
    "icon": "router",
    "color": "#2563EB",
    "textIcon": "CA",
    "website": "https://chatanywhere.tech"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.chatanywhere.org/v1/chat/completions",
    "modelsUrl": "https://api.chatanywhere.org/v1/models",
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
