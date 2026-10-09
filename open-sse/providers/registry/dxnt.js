export default {
  "id": "dxnt",
  "alias": "dxnt",
  "display": {
    "name": "DXNT / DX Token",
    "icon": "hub",
    "color": "#111827",
    "textIcon": "DX",
    "website": "https://www.dxnt.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://www.dxnt.com/v1/chat/completions",
    "modelsUrl": "https://www.dxnt.com/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true
};
