export default {
  "id": "arcee-ai",
  "alias": "arcee",
  "display": {
    "name": "Arcee AI",
    "icon": "auto_awesome",
    "color": "#8B5CF6",
    "textIcon": "AR",
    "website": "https://arcee.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.arcee.ai/api/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true,
  "authHint": "Get API key at arcee.ai"
};
