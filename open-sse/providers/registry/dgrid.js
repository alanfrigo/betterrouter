export default {
  "id": "dgrid",
  "alias": "dgrid",
  "display": {
    "name": "DGrid",
    "icon": "router",
    "color": "#65A30D",
    "textIcon": "DG",
    "website": "https://dgrid.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.dgrid.ai/v1/chat/completions",
    "modelsUrl": "https://api.dgrid.ai/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "dgridai/free",
      "name": "DGrid Free Models Router"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true
};
