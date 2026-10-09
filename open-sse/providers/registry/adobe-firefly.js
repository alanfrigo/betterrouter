import {EXTRA_IMAGES,EXTRA_VIDEOS} from '../../config/extraMediaProtocols.js';
export default {
  "id": "adobe-firefly",
  "alias": "firefly",
  "display": {
    "id": "adobe-firefly",
    "serviceKinds": [],
    "alias": "firefly",
    "name": "Adobe Firefly (Image/Video)",
    "icon": "auto_awesome",
    "color": "#EB1000",
    "textIcon": "FF",
    "website": "https://firefly.adobe.com",
    "authHint": "RECOMMENDED: firefly.adobe.com signed-in → F12 → Network → click firefly-3p.ff.adobe.io (generate-async or models/discovery) → Request Headers → Authorization → copy the token AFTER 'Bearer ' (starts with eyJ…). Cookie-only from firefly.adobe.com mints a GUEST token → 401/403; only multi-domain IMS cookies (adobelogin.com) or that Bearer JWT work. Unofficial/experimental media + Limits.",
    "subscriptionRisk": true,
    "riskNoticeVariant": "webCookie"
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "image",
    "video"
  ],
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie",
 imageConfig:EXTRA_IMAGES['adobe-firefly'],
 videoConfig:EXTRA_VIDEOS['adobe-firefly']
};
