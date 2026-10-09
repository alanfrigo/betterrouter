export default {
  "id": "databricks",
  "alias": "databricks",
  "category": "apikey",
  "display": {
    "name": "Databricks",
    "icon": "table_chart",
    "color": "#F97316",
    "textIcon": "DB",
    "website": "https://www.databricks.com"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Workspace serving endpoints URL",
      "required": true,
      "placeholder": "https://<workspace>.azuredatabricks.net/serving-endpoints"
    },
    {
      "name": "validationModelId",
      "label": "Serving endpoint name",
      "required": true,
      "placeholder": "databricks-meta-llama-3-3-70b-instruct"
    }
  ],
  "transport": {
    "baseUrl": ""
  },
  "passthroughModels": true,
  "models": [
    {
      "id": "databricks-gpt-5",
      "name": "databricks-gpt-5"
    },
    {
      "id": "databricks-meta-llama-3-3-70b-instruct",
      "name": "databricks-meta-llama-3-3-70b-instruct"
    },
    {
      "id": "databricks-claude-sonnet-4",
      "name": "databricks-claude-sonnet-4"
    },
    {
      "id": "databricks-gemini-2-5-pro",
      "name": "databricks-gemini-2-5-pro"
    }
  ]
};
