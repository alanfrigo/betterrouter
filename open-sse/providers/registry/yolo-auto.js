export default {
  "id": "yolo-auto",
  "alias": "yolo-auto",
  "display": {
    "name": "Yolo-Auto",
    "icon": "auto_awesome",
    "color": "#F59E0B",
    "textIcon": "YA",
    "website": "https://yolo-auto.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://yolo-auto.com/v1/chat/completions",
    "modelsUrl": "https://yolo-auto.com/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "qwen3.6-35b-a3b",
      "name": "Qwen 3.6 35B A3B"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true
};
