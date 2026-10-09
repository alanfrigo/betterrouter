import { AUDIO_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "soniox",
  "alias": "sx",
  "display": {
    "id": "soniox",
    "serviceKinds": [],
    "alias": "sx",
    "name": "Soniox",
    "icon": "mic",
    "color": "#5B5BD6",
    "textIcon": "SX",
    "website": "https://soniox.com"
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "stt"
  ],
  sttConfig: AUDIO_PROTOCOLS["soniox"]
};
