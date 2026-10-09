export default {
  "id": "chat-oripe",
  "alias": "chat-oripe",
  "display": {
    "name": "Chat Oripe",
    "icon": "router",
    "color": "#64748B",
    "textIcon": "CO",
    "website": "https://api.oriper.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.oriper.com/v1/chat/completions",
    "modelsUrl": "https://api.oriper.com/v1/models",
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
