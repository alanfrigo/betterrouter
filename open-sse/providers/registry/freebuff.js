export default {
  "id": "freebuff",
  "alias": "fb",
  "category": "apikey",
  "authType": "apikey",
  "display": {
    "name": "Freebuff",
    "icon": "terminal",
    "color": "#10B981",
    "textIcon": "FB",
    "website": "https://freebuff.com",
    "notice": {
      "text": "Enter your Freebuff / Codebuff auth token from the CLI login."
    }
  },
  "models": [
    {
      "id": "deepseek/deepseek-v4-flash",
      "name": "DeepSeek V4 Flash",
      "supportsReasoning": true,
      "contextLength": 131072
    },
    {
      "id": "deepseek/deepseek-v4-pro",
      "name": "DeepSeek V4 Pro",
      "supportsReasoning": true,
      "contextLength": 131072
    },
    {
      "id": "openai/gpt-5.6-luna",
      "name": "GPT-5.6 Luna",
      "supportsReasoning": true,
      "contextLength": 131072
    },
    {
      "id": "minimax/minimax-m3",
      "name": "MiniMax M3",
      "supportsVision": true,
      "supportsReasoning": true,
      "contextLength": 131072
    },
    {
      "id": "mimo/mimo-v2.5",
      "name": "MiMo v2.5",
      "supportsReasoning": true,
      "contextLength": 131072
    },
    {
      "id": "z-ai/glm-5.2",
      "name": "GLM 5.2",
      "supportsReasoning": true,
      "contextLength": 131072
    },
    {
      "id": "crof/kimi-k3-eco",
      "name": "Kimi K3 Eco",
      "supportsVision": true,
      "supportsReasoning": true,
      "contextLength": 131072
    },
    {
      "id": "anthropic/claude-fable-5",
      "name": "Claude Fable 5",
      "supportsVision": true,
      "supportsReasoning": true,
      "contextLength": 131072,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ]
    },
    {
      "id": "meta/muse-spark-1.2-contributor",
      "name": "Meta Muse Spark 1.2 Contributor",
      "supportsReasoning": true,
      "contextLength": 131072
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://www.codebuff.com/api/v1",
    "format": "openai",
    "headers": {},
    "auth": {
      "header": "Authorization",
      "scheme": "bearer",
      "combined": true
    }
  }
};
