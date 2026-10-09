export default {
  "id": "piapi",
  "alias": "pi",
  "category": "apikey",
  "display": {
    "name": "PiAPI",
    "icon": "api",
    "color": "#7C4DFF",
    "textIcon": "PI",
    "website": "https://piapi.ai"
  },
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.piapi.ai/v1/chat/completions",
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "passthroughModels": true
};
