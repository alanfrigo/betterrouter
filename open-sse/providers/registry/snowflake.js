export default {
  "id": "snowflake",
  "alias": "snowflake",
  "category": "apikey",
  "display": {
    "name": "Snowflake Cortex",
    "icon": "ac_unit",
    "color": "#29B5E8",
    "textIcon": "SF",
    "website": "https://www.snowflake.com"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Snowflake account or gateway URL",
      "required": true,
      "placeholder": "https://<account>.snowflakecomputing.com"
    },
    {
      "name": "tokenType",
      "label": "Token type",
      "required": false,
      "placeholder": "PROGRAMMATIC_ACCESS_TOKEN, KEYPAIR_JWT, or OAUTH"
    },
    {
      "name": "validationModelId",
      "label": "Validation model ID",
      "required": true,
      "placeholder": "llama3.3-70b"
    }
  ],
  "transport": {
    "baseUrl": ""
  },
  "passthroughModels": true,
  "models": [
    {
      "id": "llama3.1-70b",
      "name": "llama3.1-70b"
    },
    {
      "id": "llama3.3-70b",
      "name": "llama3.3-70b"
    },
    {
      "id": "deepseek-r1",
      "name": "deepseek-r1"
    },
    {
      "id": "claude-3-5-sonnet",
      "name": "claude-3-5-sonnet"
    }
  ],
  "authHint": "Use a PAT (optionally prefixed pat/), key-pair JWT, or OAuth token. Set Token type when needed.",
  "apiHint": "Account roots use the OpenAI-compatible Cortex /api/v2/cortex/v1/chat/completions API; AI Gateway URLs are supported."
};
