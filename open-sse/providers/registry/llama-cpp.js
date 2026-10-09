export default {
  "id": "llama-cpp",
  "alias": "llamacpp",
  "category": "apikey",
  "noAuth": true,
  "hasProviderSpecificData": true,
  "localDefault": "http://127.0.0.1:8080/v1",
  "credentialFields": [
    {
      "name": "baseUrl",
      "label": "Base URL",
      "placeholder": "http://127.0.0.1:8080/v1"
    }
  ],
  "display": {
    "name": "llama.cpp",
    "icon": "memory",
    "color": "#795548",
    "textIcon": "LC",
    "website": "https://github.com/ggml-org/llama.cpp"
  },
  "authHint": "API key optional (use any value, e.g. sk-no-key-required). Configure the llama-server OpenAI-compatible base URL (default: http://127.0.0.1:8080/v1). Note: if Llamafile is also installed, both default to port 8080 — run only one at a time or override the port.",
  "passthroughModels": true,
  "serviceKinds": [
    "llm",
    "embedding"
  ],
  "transport": {
    "format": "openai",
    "baseUrl": "http://127.0.0.1:8080/v1/chat/completions",
    "modelsUrl": "http://127.0.0.1:8080/v1/models",
    "connectionBaseUrl": true,
    "noAuth": true
  },
  "models": [],
  "embeddingConfig": {
    "baseUrl": "http://127.0.0.1:8080/v1/embeddings",
    "authType": "none",
    "format": "openai",
    "connectionBaseUrl": true
  }
};
