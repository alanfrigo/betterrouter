export default {
  "id": "inception",
  "alias": "inception",
  "display": {
    "name": "Inception",
    "icon": "auto_awesome",
    "color": "#F97316",
    "textIcon": "IN",
    "website": "https://docs.inceptionlabs.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.inceptionlabs.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "mercury-2",
      "name": "Mercury 2",
      "contextLength": 128000,
      "maxOutputTokens": 50000
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true
};
