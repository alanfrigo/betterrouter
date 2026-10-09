export default {
  "id": "seekai",
  "alias": "ska",
  "display": {
    "name": "SeekAi",
    "icon": "hub",
    "color": "#0D9488",
    "textIcon": "SK",
    "website": "https://seekai.cc"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://seekai.cc/v1/chat/completions",
    "modelsUrl": "https://seekai.cc/v1/models",
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
  "hasFree": true,
  "passthroughModels": true,
  "authHint": "Create an API key at https://seekai.cc, then paste it here as a Bearer token."
};
