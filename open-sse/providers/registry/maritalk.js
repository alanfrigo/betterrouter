export default {
  "id": "maritalk",
  "alias": "maritalk",
  "display": {
    "name": "Maritalk",
    "icon": "translate",
    "color": "#1D4ED8",
    "textIcon": "MT",
    "website": "https://www.maritaca.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://chat.maritaca.ai/api",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "key",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "sabia-4",
      "name": "sabia-4"
    },
    {
      "id": "sabia-4-thinking",
      "name": "sabia-4-thinking"
    },
    {
      "id": "sabiazinho-4",
      "name": "sabiazinho-4"
    }
  ],
  "serviceKinds": [
    "llm"
  ]
};
