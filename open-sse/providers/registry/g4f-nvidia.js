export default {
  "id": "g4f-nvidia",
  "alias": "g4fnv",
  "display": {
    "name": "g4f.space — NVIDIA",
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
    "baseUrl": "https://g4f.space/api/nvidia/v1/chat/completions",
    "modelsUrl": "https://g4f.space/api/nvidia/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "nvidia/nemotron-3-nano-30b-a3b",
      "name": "Nemotron 3 Nano 30B (g4f/NVIDIA)"
    },
    {
      "id": "z-ai/glm-5.2",
      "name": "GLM 5.2 (g4f/NVIDIA)"
    },
    {
      "id": "minimaxai/minimax-m2.7",
      "name": "MiniMax M2.7 (g4f/NVIDIA)"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": false,
  "passthroughModels": true,
  "authHint": "Bake anonymous cake credits at g4f.dev/chat, or use a g4f.dev member key (create one at g4f.dev/members.html)."
};
