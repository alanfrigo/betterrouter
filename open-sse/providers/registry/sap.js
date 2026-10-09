export default {
  "id": "sap",
  "alias": "sap",
  "category": "apikey",
  "display": {
    "name": "SAP Generative AI Hub",
    "icon": "business",
    "color": "#0FAAFF",
    "textIcon": "SAP",
    "website": "https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "AI Core deployment URL",
      "required": true,
      "placeholder": "https://<host>/v2/lm/deployments/<id>"
    },
    {
      "name": "resourceGroup",
      "label": "AI resource group",
      "required": false,
      "placeholder": "default"
    },
    {
      "name": "validationModelId",
      "label": "Validation model ID",
      "required": true,
      "placeholder": "gpt-4o"
    }
  ],
  "transport": {
    "baseUrl": ""
  },
  "passthroughModels": true,
  "authHint": "Use your SAP AI Core bearer token. Base URL can be your AI_API_URL root or a deploymentUrl from Generative AI Hub.",
  "apiHint": "Chat requires a Generative AI Hub deployment URL; AI Core root URLs are discovery-only."
};
