export default {
  "id": "dify",
  "alias": "dify",
  "category": "apikey",
  "display": {
    "name": "Dify",
    "icon": "smart_toy",
    "color": "#6366F1",
    "textIcon": "DF",
    "website": "https://dify.ai"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Dify Service API URL",
      "required": false,
      "placeholder": "https://api.dify.ai/v1"
    },
    {
      "name": "inputs",
      "label": "App inputs (JSON object)",
      "required": false,
      "placeholder": "{}"
    },
    {
      "name": "userId",
      "label": "End-user ID (optional)",
      "required": false,
      "placeholder": "user-123"
    },
    {
      "name": "conversationId",
      "label": "Existing Dify conversation ID",
      "required": false,
      "placeholder": ""
    }
  ],
  "transport": {
    "baseUrl": "https://api.dify.ai/v1"
  },
  "passthroughModels": true,
  "authHint": "Get API key from your Dify instance.",
  "models": [
    {
      "id": "auto",
      "name": "Auto"
    }
  ]
};
