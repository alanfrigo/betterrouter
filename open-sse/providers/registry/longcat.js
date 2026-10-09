export default {
  "id": "longcat",
  "alias": "lc",
  "display": {
    "name": "LongCat AI",
    "icon": "auto_awesome",
    "color": "#FF6B9D",
    "textIcon": "LC",
    "website": "https://longcat.chat/platform/docs"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.longcat.chat/openai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "LongCat-2.0",
      "name": "LongCat 2.0 (10M tok free 🆓)",
      "contextLength": 1048576
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true
};
