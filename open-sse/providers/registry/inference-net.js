export default {
  "id": "inference-net",
  "alias": "inet",
  "display": {
    "name": "Inference.net",
    "icon": "dns",
    "color": "#2563EB",
    "textIcon": "IN",
    "website": "https://inference.net"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.inference.net/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "meta-llama/Llama-3.3-70B-Instruct",
      "name": "meta-llama/Llama-3.3-70B-Instruct"
    },
    {
      "id": "deepseek-ai/DeepSeek-R1",
      "name": "deepseek-ai/DeepSeek-R1"
    },
    {
      "id": "Qwen/Qwen2.5-72B-Instruct",
      "name": "Qwen/Qwen2.5-72B-Instruct"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true
};
