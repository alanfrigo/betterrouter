export default {
  "id": "nube",
  "alias": "nube",
  "display": {
    "name": "Nube.sh",
    "icon": "cloud",
    "color": "#2563EB",
    "textIcon": "NB",
    "website": "https://nube.sh",
    "notice": {
      "text": "OpenAI-compatible gateway (LiteLLM). Bring your own API key — models are resolved live from the account (passthrough).",
      "apiKeyUrl": "https://nube.sh/dashboard/api-keys"
    }
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://ai.nube.sh/api/v1/chat/completions",
    "modelsUrl": "https://ai.nube.sh/api/v1/models",
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
  "hasFree": false
};
