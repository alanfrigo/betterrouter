export default {
  "id": "mixedbread",
  "alias": "mxbai",
  "category": "apikey",
  "display": {
    "name": "Mixedbread AI",
    "icon": "hub",
    "color": "#F59E0B",
    "textIcon": "MB",
    "website": "https://www.mixedbread.com"
  },
  "serviceKinds": [
    "embedding"
  ],
  "models": [
    {
      "id": "mixedbread-ai/mxbai-embed-large-v1",
      "name": "Mixedbread Embed Large v1",
      "dimensions": 1024,
      "kind": "embedding"
    },
    {
      "id": "mixedbread-ai/mxbai-embed-2d-large-v1",
      "name": "Mixedbread Embed 2D Large v1",
      "dimensions": 1024,
      "kind": "embedding"
    }
  ],
  "embeddingConfig": {
    "baseUrl": "https://api.mixedbread.com/v1/embeddings",
    "authType": "apikey",
    "authHeader": "bearer",
    "format": "openai"
  }
};
