export default {
  "id": "muse-spark-web",
  "priority": 300,
  "alias": "ms-web",
  "display": {
    "name": "Muse Spark Web (Meta AI)",
    "icon": "auto_awesome",
    "color": "#0866FF",
    "textIcon": "MS",
    "website": "https://www.meta.ai"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste your ecto_1_sess cookie AND the ecto1:... WS auth token from meta.ai. Capture the ecto1: token in DevTools → Network → WS → the clippy request's Authorization query param. Example: ecto_1_sess=4240a308...NVDg0; ecto1:ABCD...",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://www.meta.ai/api/graphql",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "muse-spark",
      "name": "Muse Spark",
      "toolCalling": false
    },
    {
      "id": "muse-spark-thinking",
      "name": "Muse Spark Thinking",
      "supportsReasoning": true
    },
    {
      "id": "muse-spark-contemplating",
      "name": "Muse Spark Contemplating",
      "supportsReasoning": true
    }
  ],
  "passthroughModels": false,
  "toolCalling": "emulated"
};
