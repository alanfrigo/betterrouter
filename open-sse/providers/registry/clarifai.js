export default {
  "id": "clarifai",
  "alias": "clarifai",
  "category": "apikey",
  "display": {
    "name": "Clarifai",
    "icon": "hub",
    "color": "#7C3AED",
    "textIcon": "CF",
    "website": "https://docs.clarifai.com"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "OpenAI-compatible API URL",
      "required": false,
      "placeholder": "https://api.clarifai.com/v2/ext/openai/v1"
    }
  ],
  "transport": {
    "baseUrl": "https://api.clarifai.com/v2/ext/openai/v1"
  },
  "passthroughModels": true,
  "authHint": "Use your Clarifai PAT or app-specific API key. Better Router targets the OpenAI-compatible endpoint at https://api.clarifai.com/v2/ext/openai/v1 and authenticates with Authorization: Key <token>.",
  "apiHint": "Clarifai exposes OpenAI-compatible chat, responses and /models on /v2/ext/openai/v1. Public/community models typically require a PAT; app-scoped keys only work for resources inside that app."
};
