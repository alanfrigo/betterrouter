export default {
  "id": "deepai",
  "alias": "deepai",
  "display": {
    "id": "deepai",
    "serviceKinds": [],
    "alias": "deepai",
    "name": "DeepAI",
    "icon": "psychology",
    "color": "#4A90D9",
    "textIcon": "DA",
    "website": "https://deepai.org",
    "authHint": "Use your DeepAI API key. Get one at deepai.org — requires a Pro subscription ($9.99/mo).",
    "apiHint": "DeepAI uses per-endpoint REST calls (e.g. /api/text2img) instead of OpenAI chat/completions. OmniRoute adapts OpenAI image generation requests to DeepAI's /api/{slug} endpoints."
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "image"
  ],
  imageConfig: {baseUrl:"https://api.deepai.org/api/text2img",format:"deepai",authType:"apikey",authHeader:"api-key",models:[{id:"text2img",name:"Text to Image"}]},
  "transport": {
    "baseUrl": "https://api.deepai.org",
    "format": "custom",
    "auth": {
      "header": "api-key",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "text2img",
      "name": "Text to Image"
    }
  ]
};
