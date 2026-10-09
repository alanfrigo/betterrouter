export default {
  "id": "llamagate",
  "alias": "llamagate",
  "display": {
    "name": "LlamaGate",
    "icon": "gate",
    "color": "#16A34A",
    "textIcon": "LG",
    "website": "https://llamagate.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://llamagate.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "qwen2.5-coder-7b",
      "name": "qwen2.5-coder-7b"
    },
    {
      "id": "deepseek-coder-6.7b",
      "name": "deepseek-coder-6.7b"
    },
    {
      "id": "qwen3-vl-8b",
      "name": "qwen3-vl-8b"
    }
  ],
  "serviceKinds": [
    "llm"
  ]
};
