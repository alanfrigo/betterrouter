export default {
  "id": "plamo",
  "alias": "plamo",
  "display": {
    "name": "PLaMo",
    "icon": "public",
    "color": "#DC2626",
    "textIcon": "PL",
    "website": "https://plamo.preferredai.jp/api"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.platform.preferredai.jp/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "plamo-3.0-prime",
      "name": "PLaMo 3.0 Prime",
      "contextLength": 262144,
      "maxOutputTokens": 20000
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": false
};
