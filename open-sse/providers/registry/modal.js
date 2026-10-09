export default {
  "id": "modal",
  "alias": "modal",
  "display": {
    "name": "Modal",
    "icon": "cloud_queue",
    "color": "#7C3AED",
    "textIcon": "MDL",
    "website": "https://modal.com/docs"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.modal.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "google/gemini-2.0-flash",
      "name": "Gemini 2.0 Flash"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true,
  "authHint": "Use the bearer token that protects your Modal deployment, if enabled. Base URL should point to your OpenAI-compatible Modal app, for example https://<workspace>--<app>.modal.run/v1."
};
