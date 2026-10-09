import { IMAGE_PROTOCOLS, VIDEO_PROTOCOLS } from '../../config/mediaProtocols.js';
export default {
  "id": "leonardo",
  "alias": "leo",
  "display": {
    "id": "leonardo",
    "serviceKinds": [],
    "alias": "leo",
    "name": "Leonardo AI",
    "icon": "palette",
    "color": "#8B5CF6",
    "textIcon": "LE",
    "website": "https://leonardo.ai",
    "authHint": "Get API key at leonardo.ai/developer"
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "image",
    "video"
  ],
  "transport": {
    "baseUrl": "https://cloud.leonardo.ai/api/rest/v1",
    "format": "openai"
  },
  "models": [
    {
      "id": "phoenix",
      "name": "Phoenix"
    },
    {
      "id": "sdxl",
      "name": "SDXL"
    }
  ],
  imageConfig: IMAGE_PROTOCOLS["leonardo"],
  videoConfig: VIDEO_PROTOCOLS["leonardo"]
};
