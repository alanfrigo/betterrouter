export default {
  "id": "baseten",
  "alias": "baseten",
  "display": {
    "name": "Baseten",
    "icon": "deployed_code",
    "color": "#111827",
    "textIcon": "BT",
    "website": "https://baseten.co"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://inference.baseten.co/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "moonshotai/Kimi-K2.6",
      "name": "moonshotai/Kimi-K2.6"
    },
    {
      "id": "deepseek-ai/DeepSeek-V4-Pro",
      "name": "deepseek-ai/DeepSeek-V4-Pro"
    },
    {
      "id": "zai-org/GLM-5",
      "name": "zai-org/GLM-5"
    },
    {
      "id": "MiniMaxAI/MiniMax-M2.5",
      "name": "MiniMaxAI/MiniMax-M2.5"
    },
    {
      "id": "nvidia/Nemotron-120B-A12B",
      "name": "nvidia/Nemotron-120B-A12B"
    },
    {
      "id": "openai/gpt-oss-120b",
      "name": "openai/gpt-oss-120b"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true
};
