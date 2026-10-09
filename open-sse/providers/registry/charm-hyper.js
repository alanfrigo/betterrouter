export default {
  "id": "charm-hyper",
  "alias": "charm-hyper",
  "display": {
    "name": "Charm Hyper",
    "icon": "router",
    "color": "#7C3AED",
    "textIcon": "CH",
    "website": "https://hyper.charm.land"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://hyper.charm.land/v1/chat/completions",
    "modelsUrl": "https://hyper.charm.land/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "hyper/auto",
      "name": "Charm Hyper Auto"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true
};
