export default {
  "id": "g4f-gemini",
  "alias": "g4fgem",
  "display": {
    "name": "g4f.space — Gemini",
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
    "baseUrl": "https://g4f.space/api/gemini/v1/chat/completions",
    "modelsUrl": "https://g4f.space/api/gemini/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "models/gemini-2.5-flash",
      "name": "Gemini 2.5 Flash (g4f)"
    },
    {
      "id": "models/gemini-2.5-pro",
      "name": "Gemini 2.5 Pro (g4f)"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": false,
  "passthroughModels": true,
  "authHint": "Bake anonymous cake credits at g4f.dev/chat, or use a g4f.dev member key (create one at g4f.dev/members.html)."
};
