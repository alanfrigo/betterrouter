export default {
  "id": "9router",
  "alias": "nr",
  "category": "apikey",
  "authType": "apikey",
  "display": {
    "name": "9router",
    "icon": "router",
    "color": "#0EA5E9",
    "textIcon": "9R",
    "website": "https://www.npmjs.com/package/9router",
    "notice": {
      "text": ""
    }
  },
  "models": [],
  "serviceKinds": ["llm"],
  "credentialFields": [{ "name": "baseUrl", "label": "Upstream base URL", "required": true, "placeholder": "http://127.0.0.1:20130" }],
  "transport": {
    "baseUrl": "http://127.0.0.1:20130/v1/chat/completions",
    "format": "openai"
  },
  "passthroughModels": true,
  "hasProviderSpecificData": true
};
