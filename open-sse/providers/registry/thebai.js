export default {
  "id": "thebai",
  "alias": "thebai",
  "category": "apikey",
  "display": {
    "name": "TheB.AI",
    "icon": "hub",
    "color": "#3B82F6",
    "textIcon": "TB",
    "website": "https://theb.ai"
  },
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.theb.ai/v1/chat/completions",
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
  "passthroughModels": true
};
