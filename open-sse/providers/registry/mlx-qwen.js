export default {
  "id": "mlx-qwen",
  "alias": "mlx-qwen",
  "display": {
    "name": "MLX Qwen 3.8 27B",
    "icon": "memory",
    "color": "#EC4899",
    "textIcon": "MQ",
    "website": "https://github.com/ml-explore/mlx"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "http://localhost:11436/v1/chat/completions",
    "modelsUrl": "http://localhost:11436/v1/models",
    "timeoutMs": 120000,
    "connectionBaseUrl": true,
    "noAuth": true,
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "maglun/Qwen3.8-27B-MLX-Mixed-3.80bpw",
      "name": "Qwen 3.8 27B MLX Mixed 3.80bpw",
      "toolCalling": true,
      "supportsVision": false,
      "supportsReasoning": false,
      "contextLength": 8192,
      "maxOutputTokens": 8192
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "passthroughModels": false,
  "authHint": "No API key required. Runs mlx-lm server locally on port 11436. Requires uv and mlx-lm installed. Model: maglun/Qwen3.8-27B-MLX-Mixed-3.80bpw (~13.1GB peak memory).",
  "noAuth": true,
  "localDefault": "http://localhost:11436/v1",
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Base URL",
      "placeholder": "http://localhost:11436/v1"
    }
  ]
};
