export default {
  "id": "modelscope",
  "alias": "ms",
  "display": {
    "name": "ModelScope",
    "icon": "cloud",
    "color": "#FF6A00",
    "textIcon": "MS",
    "website": "https://modelscope.cn"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api-inference.modelscope.cn/v1/chat/completions",
    "modelsUrl": "https://api-inference.modelscope.cn/v1/models",
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
  "hasFree": true
};
