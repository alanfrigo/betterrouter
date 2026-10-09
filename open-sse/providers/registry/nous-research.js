export default {
  "id": "nous-research",
  "alias": "nous",
  "display": {
    "name": "Nous Research",
    "icon": "hub",
    "color": "#2563EB",
    "textIcon": "NO",
    "website": "https://portal.nousresearch.com/help"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://inference-api.nousresearch.com/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "Hermes-4-405B",
      "name": "Hermes 4 405B (Nous Research)"
    },
    {
      "id": "Hermes-4-70B",
      "name": "Hermes 4 70B (Nous Research)"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "authHint": "Use your Nous Portal API key. OmniRoute targets the official OpenAI-compatible inference endpoint at https://inference-api.nousresearch.com/v1."
};
