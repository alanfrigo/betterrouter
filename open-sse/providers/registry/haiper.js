import { IMAGE_PROTOCOLS, VIDEO_PROTOCOLS } from '../../config/mediaProtocols.js';
export default {
  "id": "haiper",
  "alias": "hp",
  "display": {
    "id": "haiper",
    "serviceKinds": [],
    "alias": "hp",
    "name": "Haiper",
    "icon": "videocam",
    "color": "#6366F1",
    "textIcon": "HP",
    "website": "https://haiper.ai",
    "authHint": "Get API key at haiper.ai/haiper-api"
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "image",
    "video"
  ],
  "transport": {
    "baseUrl": "https://api.haiper.ai/v1",
    "format": "openai",
    "auth": {
      "header": "HAIPER_KEY",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "gen2",
      "name": "Gen 2 Video"
    },
    {
      "id": "gen2-image",
      "name": "Gen 2 Image"
    }
  ],
  imageConfig: IMAGE_PROTOCOLS["haiper"],
  videoConfig: VIDEO_PROTOCOLS["haiper"]
};
