export default {
  "id": "cliproxyapi",
  "alias": "cpa",
  "category": "apikey",
  "authType": "apikey",
  "display": {
    "name": "CLIProxyAPI",
    "icon": "proxy",
    "color": "#6366F1",
    "textIcon": "CPA",
    "website": "https://github.com/router-for-me/CLIProxyAPI",
    "notice": {
      "text": ""
    }
  },
  "models": [],
  "serviceKinds": ["llm"],
  "credentialFields": [{ "name": "baseUrl", "label": "Upstream base URL", "required": true, "placeholder": "http://127.0.0.1:8317" }],
  "transport": {
    "baseUrl": "http://127.0.0.1:8317/v1/chat/completions",
    "format": "openai"
  },
  "passthroughModels": true,
  "hasProviderSpecificData": true
};
