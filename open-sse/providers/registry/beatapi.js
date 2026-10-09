export default {
  "id": "beatapi",
  "alias": "beatapi",
  "display": {
    "name": "BeatAPI",
    "icon": "hub",
    "color": "#2563EB",
    "textIcon": "BA",
    "website": "https://beatapi.io"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.beatapi.io/v1/chat/completions",
    "modelsUrl": "https://api.beatapi.io/v1/models",
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
  "passthroughModels": true,
  "authHint": "Create an API key at https://beatapi.io/dashboard/apikeys, then paste it here."
};
