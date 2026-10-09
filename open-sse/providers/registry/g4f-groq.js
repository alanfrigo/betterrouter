export default {
  "id": "g4f-groq",
  "alias": "g4fgroq",
  "display": {
    "name": "g4f.space — Groq",
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
    "baseUrl": "https://g4f.space/api/groq/v1/chat/completions",
    "modelsUrl": "https://g4f.space/api/groq/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "llama-3.3-70b-versatile",
      "name": "Llama 3.3 70B (g4f/Groq)"
    },
    {
      "id": "llama-3.1-8b-instant",
      "name": "Llama 3.1 8B Instant (g4f/Groq)"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": false,
  "passthroughModels": true,
  "authHint": "Bake anonymous cake credits at g4f.dev/chat, or use a g4f.dev member key (create one at g4f.dev/members.html)."
};
