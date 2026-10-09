export default {
  "id": "sarvam",
  "alias": "sarvam",
  "display": {
    "name": "Sarvam AI",
    "icon": "public",
    "color": "#0EA5E9",
    "textIcon": "SV",
    "website": "https://docs.sarvam.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.sarvam.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "sarvam-105b",
      "name": "Sarvam 105B",
      "contextLength": 131072
    },
    {
      "id": "sarvam-30b",
      "name": "Sarvam 30B",
      "contextLength": 65536
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true
};
