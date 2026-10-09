export default {
  "id": "nomic",
  "alias": "nomic",
  "category": "apikey",
  "display": {
    "name": "Nomic",
    "icon": "hub",
    "color": "#7C3AED",
    "textIcon": "NM",
    "website": "https://nomic.ai"
  },
  "serviceKinds": [
    "embedding"
  ],
  "models": [
    {
      "id": "nomic-embed-text-v1",
      "name": "Nomic Embed Text v1",
      "dimensions": 768,
      "kind": "embedding"
    },
    {
      "id": "nomic-embed-text-v1.5",
      "name": "Nomic Embed Text v1.5",
      "dimensions": 768,
      "kind": "embedding"
    }
  ],
  "embeddingConfig": {
    "baseUrl": "https://api-atlas.nomic.ai/v1/embedding/text",
    "authType": "apikey",
    "authHeader": "bearer",
    "format": "nomic"
  }
};
