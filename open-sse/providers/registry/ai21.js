export default {
  "id": "ai21",
  "alias": "ai21",
  "display": {
    "name": "AI21 Labs",
    "icon": "psychology_alt",
    "color": "#0284C7",
    "textIcon": "AI21",
    "website": "https://www.ai21.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.ai21.com/studio/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "jamba-large-1.7",
      "name": "jamba-large-1.7"
    },
    {
      "id": "jamba-mini-2",
      "name": "jamba-mini-2"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true
};
