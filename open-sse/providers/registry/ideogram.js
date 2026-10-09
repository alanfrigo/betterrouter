import { IMAGE_PROTOCOLS } from '../../config/mediaProtocols.js';
export default {
  "id": "ideogram",
  "alias": "ideo",
  "display": {
    "id": "ideogram",
    "serviceKinds": [],
    "alias": "ideo",
    "name": "Ideogram",
    "icon": "image",
    "color": "#EC4899",
    "textIcon": "ID",
    "website": "https://ideogram.ai",
    "authHint": "Get API key at ideogram.ai/docs/api"
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "image"
  ],
  "transport": {
    "baseUrl": "https://api.ideogram.ai",
    "format": "openai",
    "auth": {
      "header": "Api-Key",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "V_3",
      "name": "Ideogram V3"
    },
    {
      "id": "V_2A",
      "name": "Ideogram V2A"
    }
  ],
  imageConfig: IMAGE_PROTOCOLS["ideogram"]
};
