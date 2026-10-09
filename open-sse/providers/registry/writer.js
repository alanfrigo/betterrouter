export default {
  "id": "writer",
  "alias": "writer",
  "display": {
    "name": "Writer",
    "icon": "auto_awesome",
    "color": "#111827",
    "textIcon": "WR",
    "website": "https://dev.writer.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.writer.com/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "palmyra-x5",
      "name": "Palmyra X5",
      "contextLength": 1048576
    },
    {
      "id": "palmyra-x4",
      "name": "Palmyra X4",
      "contextLength": 131072
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": false
};
