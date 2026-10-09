export default {
  "id": "vllm",
  "alias": "vllm",
  "category": "apikey",
  "noAuth": true,
  "hasProviderSpecificData": true,
  "localDefault": "http://localhost:8000/v1",
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Base URL",
      "placeholder": "http://localhost:8000/v1"
    }
  ],
  "display": {
    "name": "vLLM",
    "icon": "memory",
    "color": "#0F766E",
    "textIcon": "VL",
    "website": "https://github.com/vllm-project/vllm"
  },
  "authHint": "API key optional. Configure the local vLLM OpenAI-compatible base URL (default: http://localhost:8000/v1).",
  "passthroughModels": true,
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "format": "openai",
    "baseUrl": "http://localhost:8000/v1/chat/completions",
    "modelsUrl": "http://localhost:8000/v1/models",
    "connectionBaseUrl": true,
    "noAuth": true
  },
  "models": []
};
