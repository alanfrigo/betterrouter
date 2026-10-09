export default {
  "id": "codestral",
  "alias": "codestral",
  "display": {
    "name": "Codestral",
    "icon": "terminal",
    "color": "#FF7000",
    "textIcon": "CS",
    "website": "https://mistral.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://codestral.mistral.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "codestral-2508",
      "name": "codestral-2508"
    },
    {
      "id": "codestral-latest",
      "name": "codestral-latest"
    }
  ],
  "serviceKinds": [
    "llm"
  ]
};
