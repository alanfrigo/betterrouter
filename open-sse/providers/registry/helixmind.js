export default {
  "id": "helixmind",
  "alias": "helixmind",
  "display": {
    "name": "HelixMind",
    "icon": "hub",
    "color": "#4F46E5",
    "textIcon": "HM",
    "website": "https://helixmind.online"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://helixmind.online/v1/chat/completions",
    "modelsUrl": "https://helixmind.online/v1/models",
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
  "hasFree": false,
  "passthroughModels": true,
  "transports": [
    {
      "format": "openai",
      "baseUrl": "https://helixmind.online/v1/chat/completions",
      "headers": {},
      "auth": {
        "combined": true,
        "header": "Authorization",
        "scheme": "bearer"
      }
    },
    {
      "format": "claude",
      "baseUrl": "https://helixmind.online/v1/messages",
      "auth": {
        "combined": true,
        "header": "x-api-key",
        "scheme": "raw"
      }
    },
    {
      "format": "openai-responses",
      "baseUrl": "https://helixmind.online/v1/responses",
      "auth": {
        "combined": true,
        "header": "Authorization",
        "scheme": "bearer"
      }
    }
  ]
};
