export default {
  "id": "getgoapi",
  "alias": "ggo",
  "category": "apikey",
  "display": {
    "name": "GoAPI",
    "icon": "rocket_launch",
    "color": "#FF6D00",
    "textIcon": "GO",
    "website": "https://api.getgoapi.com"
  },
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.goapi.ai/v1/chat/completions",
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "passthroughModels": true
};
