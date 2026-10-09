export default {
  "id": "uncloseai",
  "alias": "unc",
  "display": {
    "name": "UncloseAI",
    "icon": "auto_awesome",
    "color": "#8B5CF6",
    "textIcon": "UN",
    "website": "https://uncloseai.com",
    "notice": {
      "text": "UncloseAI needs no API key. API accepts any non-empty string as key for identification. If older built-in models return 404, use Available Models → Import from /models or Auto-Sync."
    }
  },
  "category": "free",
  "transport": {
    "format": "openai",
    "baseUrl": "https://hermes.ai.unturf.com/v1/chat/completions",
    "modelsUrl": "https://hermes.ai.unturf.com/v1/models",
    "noAuth": true,
    "anonymousApiKey": "anonymous",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "Lorbus/Qwen3.6-27B-int4-AutoRound",
      "name": "Qwen3.6 27B int4 AutoRound (🆓 Free)",
      "contextLength": 65536
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true,
  "authHint": "No auth required. API accepts any non-empty string as key for identification. If older built-in models return 404, use Available Models → Import from /models or Auto-Sync; verified live model: Lorbus/Qwen3.6-27B-int4-AutoRound."
};
