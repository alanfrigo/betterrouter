import { IMAGE_PROTOCOLS } from '../../config/mediaProtocols.js';
export default {
  "id": "magnific",
  "alias": "freepik",
  "display": {
    "id": "magnific",
    "serviceKinds": [],
    "alias": "freepik",
    "name": "Magnific",
    "icon": "image",
    "color": "#1B9E7F",
    "textIcon": "MG",
    "website": "https://www.magnific.com",
    "authHint": "Get an API key at magnific.com/user/api-keys (header x-magnific-api-key). Legacy Freepik developer keys still work.",
    "hasFree": true,
    "freeNote": "One-time ~€5 API credit for new accounts; pay-per-use afterward."
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "image"
  ],
  "transport": {
    "format": "openai"
  },
  "models": [],
  imageConfig: IMAGE_PROTOCOLS["magnific"]
};
