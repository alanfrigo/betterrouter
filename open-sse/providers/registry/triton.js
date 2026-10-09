export default {
  "id": "triton",
  "alias": "triton",
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
    "name": "NVIDIA Triton",
    "icon": "developer_board",
    "color": "#76B900",
    "textIcon": "TR",
    "website": "https://developer.nvidia.com/triton-inference-server"
  },
  "authHint": "API key optional. Configure the Triton OpenAI-compatible base URL (default: http://localhost:8000/v1).",
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
