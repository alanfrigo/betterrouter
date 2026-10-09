export default {
  "id": "yi",
  "alias": "yi",
  "display": {
    "name": "Yi (01.AI)",
    "icon": "auto_awesome",
    "color": "#10B981",
    "textIcon": "YI",
    "website": "https://01.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.lingyiwanwu.com/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "yi-large",
      "name": "Yi Large"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": false,
  "passthroughModels": true,
  "authHint": "Get API key at platform.lingyiwanwu.com"
};
