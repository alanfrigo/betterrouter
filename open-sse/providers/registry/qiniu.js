export default {
  "id": "qiniu",
  "alias": "qiniu",
  "display": {
    "name": "Qiniu",
    "icon": "cloud",
    "color": "#1E88E5",
    "textIcon": "QN",
    "website": "https://www.qiniu.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.qnaigc.com/v1/chat/completions",
    "modelsUrl": "https://api.qnaigc.com/v1/models",
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
  "passthroughModels": true
};
