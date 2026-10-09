export default {
  "id": "watsonx",
  "alias": "watsonx",
  "category": "apikey",
  "display": {
    "name": "IBM watsonx.ai Gateway",
    "icon": "hub",
    "color": "#0F62FE",
    "textIcon": "WX",
    "website": "https://www.ibm.com/products/watsonx-ai"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Gateway URL",
      "required": false,
      "placeholder": "https://ca-tor.ml.cloud.ibm.com/ml/gateway/v1"
    }
  ],
  "transport": {
    "baseUrl": "https://ca-tor.ml.cloud.ibm.com/ml/gateway/v1"
  },
  "passthroughModels": true,
  "authHint": "Use a watsonx.ai Gateway bearer token, not a raw IBM Cloud IAM API key.",
  "apiHint": "The watsonx model gateway exposes OpenAI-compatible /chat/completions and /models under /ml/gateway/v1."
};
