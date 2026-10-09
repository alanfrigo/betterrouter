export default {
  "id": "oci",
  "alias": "oci",
  "category": "apikey",
  "display": {
    "name": "OCI Generative AI",
    "icon": "cloud",
    "color": "#C74634",
    "textIcon": "OCI",
    "website": "https://www.oracle.com/artificial-intelligence/generative-ai"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Regional inference URL",
      "required": false,
      "placeholder": "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/openai/v1"
    },
    {
      "name": "projectId",
      "label": "Project or compartment ID",
      "required": false,
      "placeholder": "ocid1.compartment..."
    },
    {
      "name": "apiType",
      "label": "Upstream API (chat or responses)",
      "required": false,
      "placeholder": "chat"
    }
  ],
  "transport": {
    "baseUrl": "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/openai/v1"
  },
  "passthroughModels": true,
  "authHint": "Use your OCI Generative AI API key or IAM bearer token. Base URL can be https://inference.generativeai.<region>.oci.oraclecloud.com/openai/v1/.",
  "apiHint": "OCI exposes OpenAI-compatible chat and responses endpoints. Project ID is optional in Better Router but may be required for Responses and agentic workflows."
};
