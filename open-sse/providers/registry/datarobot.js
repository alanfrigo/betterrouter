export default {
  "id": "datarobot",
  "alias": "datarobot",
  "category": "apikey",
  "display": {
    "name": "DataRobot",
    "icon": "precision_manufacturing",
    "color": "#6D28D9",
    "textIcon": "DR",
    "website": "https://docs.datarobot.com"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Gateway root or deployment URL",
      "required": false,
      "placeholder": "https://app.datarobot.com"
    },
    {
      "name": "validationModelId",
      "label": "Deployment model ID",
      "required": false,
      "placeholder": "datarobot-deployed-llm"
    }
  ],
  "transport": {
    "baseUrl": "https://app.datarobot.com"
  },
  "passthroughModels": true,
  "authHint": "Use your DataRobot API token. Optional Base URL can be the account root (for LLM Gateway) or a deployment URL under /api/v2/deployments/<id>.",
  "apiHint": "The default gateway catalogs active models from /genai/llmgw/catalog/. Deployment URLs are also supported for direct OpenAI-compatible chat requests."
};
