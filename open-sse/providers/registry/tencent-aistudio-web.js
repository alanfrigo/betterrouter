export default {
  "id": "tencent-aistudio-web",
  "priority": 300,
  "alias": "tasw",
  "display": {
    "name": "Tencent AI Studio (Free)",
    "icon": "auto_awesome",
    "color": "#0052D9",
    "textIcon": "TAS",
    "website": "https://aistudio.tencent.ai"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Log in to aistudio.tencent.ai, open DevTools -> Network, copy any request Cookie header containing session tokens.",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://aistudio.tencent.ai/api/chat",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "hy3-g",
      "name": "HY3-G (via Tencent AI Studio)",
      "toolCalling": false
    },
    {
      "id": "hunyuan-default",
      "name": "Hunyuan Default (via Tencent AI Studio)",
      "toolCalling": false
    },
    {
      "id": "hunyuan-3d",
      "name": "Hunyuan 3D (via Tencent AI Studio)",
      "toolCalling": false
    }
  ],
  "passthroughModels": false,
  "riskNoticeVariant": "webCookie"
};
