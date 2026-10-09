export default {
  "id": "wandb",
  "alias": "wandb",
  "display": {
    "name": "Weights & Biases Inference",
    "icon": "monitoring",
    "color": "#FFBE0B",
    "textIcon": "WB",
    "website": "https://wandb.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.inference.wandb.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "openai/gpt-oss-120b",
      "name": "openai/gpt-oss-120b"
    },
    {
      "id": "Qwen/Qwen3-Coder-480B-A35B-Instruct",
      "name": "Qwen/Qwen3-Coder-480B-A35B-Instruct"
    },
    {
      "id": "deepseek-ai/DeepSeek-V3.1",
      "name": "deepseek-ai/DeepSeek-V3.1"
    }
  ],
  "serviceKinds": [
    "llm"
  ]
};
