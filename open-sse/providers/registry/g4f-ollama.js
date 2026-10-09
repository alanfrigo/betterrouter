export default {
  "id": "g4f-ollama",
  "alias": "g4foll",
  "display": {
    "name": "g4f.space — Ollama",
    "icon": "bolt",
    "color": "#F97316",
    "textIcon": "G4F",
    "website": "https://g4f.space",
    "notice": {
      "text": "Remote third-party gateway: prompts and request metadata leave OmniRoute and are handled by g4f.space. Its Terms and Privacy links were unavailable when last verified on 2026-08-27.",
      "apiKeyUrl": "https://g4f.dev/members.html"
    }
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://g4f.space/api/ollama/v1/chat/completions",
    "modelsUrl": "https://g4f.space/api/ollama/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "gemma3:4b",
      "name": "Gemma 3 4B (g4f/Ollama)"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": false,
  "passthroughModels": true,
  "authHint": "Bake anonymous cake credits at g4f.dev/chat, or use a g4f.dev member key (create one at g4f.dev/members.html)."
};
