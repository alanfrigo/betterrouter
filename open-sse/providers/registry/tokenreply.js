export default {
  "id": "tokenreply",
  "alias": "tokenreply",
  "display": {
    "name": "TokenReply",
    "icon": "router",
    "color": "#3B82F6",
    "textIcon": "TR",
    "website": "https://www.tokenreply.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.tokenreply.com/v1/chat/completions",
    "modelsUrl": "https://api.tokenreply.com/v1/models",
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
