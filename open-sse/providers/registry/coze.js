export default {
  "id": "coze",
  "alias": "coze",
  "category": "apikey",
  "display": {
    "name": "Coze",
    "icon": "smart_toy",
    "color": "#3B82F6",
    "textIcon": "CZ",
    "website": "https://coze.com"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Coze API URL",
      "required": false,
      "placeholder": "https://api.coze.com"
    },
    {
      "name": "botId",
      "label": "Published bot ID",
      "required": true,
      "placeholder": "737..."
    },
    {
      "name": "userId",
      "label": "End-user ID (optional)",
      "required": false,
      "placeholder": "user-123"
    },
    {
      "name": "conversationId",
      "label": "Existing Coze conversation ID",
      "required": false,
      "placeholder": ""
    },
    {
      "name": "customVariables",
      "label": "Bot variables (JSON object)",
      "required": false,
      "placeholder": "{}"
    }
  ],
  "transport": {
    "baseUrl": "https://api.coze.com"
  },
  "passthroughModels": true,
  "authHint": "Use a Coze personal access token and published bot ID. Model IDs select bots, not foundation models.",
  "models": [
    {
      "id": "auto",
      "name": "Configured Coze bot"
    }
  ]
};
