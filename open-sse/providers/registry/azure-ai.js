export default {
  "id": "azure-ai",
  "alias": "azure-ai",
  "category": "apikey",
  "display": {
    "name": "Azure AI Foundry",
    "icon": "cloud",
    "color": "#2563EB",
    "textIcon": "AF",
    "website": "https://learn.microsoft.com/azure/ai-foundry"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Azure resource URL",
      "required": true,
      "placeholder": "https://<resource>.services.ai.azure.com/openai/v1"
    },
    {
      "name": "apiVersion",
      "label": "Classic API version",
      "required": false,
      "placeholder": "2024-12-01-preview"
    },
    {
      "name": "apiType",
      "label": "Upstream API (chat or responses)",
      "required": false,
      "placeholder": "chat"
    },
    {
      "name": "validationModelId",
      "label": "Deployment name",
      "required": false,
      "placeholder": "my-deployment"
    }
  ],
  "transport": {
    "baseUrl": ""
  },
  "passthroughModels": true,
  "authHint": "Use your Azure AI Foundry key. Base URL can be https://<resource>.services.ai.azure.com/openai/v1/ or https://<resource>.openai.azure.com/openai/v1/.",
  "apiHint": "Foundry uses the OpenAI v1 surface with deployment names as models. Better Router normalizes root resource URLs to the v1 chat and /models endpoints."
};
