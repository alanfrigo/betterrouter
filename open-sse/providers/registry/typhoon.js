export default {
  "id": "typhoon",
  "alias": "typhoon",
  "display": {
    "name": "Typhoon",
    "icon": "public",
    "color": "#7C3AED",
    "textIcon": "TY",
    "website": "https://docs.opentyphoon.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.opentyphoon.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "typhoon-v2.5-30b-a3b-instruct",
      "name": "Typhoon v2.5 30B A3B Instruct",
      "contextLength": 131072
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true
};
