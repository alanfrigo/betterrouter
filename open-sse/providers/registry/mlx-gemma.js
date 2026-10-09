export default {
  "id": "mlx-gemma",
  "alias": "mlx-gemma",
  "display": {
    "name": "MLX Gemma 26B",
    "icon": "memory",
    "color": "#8B5CF6",
    "textIcon": "MG",
    "website": "https://github.com/ml-explore/mlx"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "http://localhost:11435/v1/chat/completions",
    "modelsUrl": "http://localhost:11435/v1/models",
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
      "id": "mlx-community/gemma-4-26B-A4B-it-qat-q4_0-mlx-aligned",
      "name": "Gemma 4 26B A4B IT-QAT (MLX)",
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
  "authHint": "No API key required. Runs mlx-lm server locally on port 11435. Requires uv and mlx-lm installed. Model: mlx-community/gemma-4-26B-A4B-it-qat-q4_0-mlx-aligned (~15.9GB peak memory).",
  "noAuth": true,
  "localDefault": "http://localhost:11435/v1",
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Base URL",
      "placeholder": "http://localhost:11435/v1"
    }
  ]
};
