export default {
  "id": "empower",
  "alias": "empower",
  "category": "apikey",
  "display": {
    "name": "Empower",
    "icon": "hub",
    "color": "#14B8A6",
    "textIcon": "EM",
    "website": "https://docs.empower.dev"
  },
  "transport": {
    "format": "openai",
    "baseUrl": "https://app.empower.dev/api/v1/chat/completions",
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "empower-functions",
      "name": "Empower Functions"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "passthroughModels": true
};
