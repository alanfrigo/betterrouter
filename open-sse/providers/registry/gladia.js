import { AUDIO_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "gladia",
  "alias": "gladia",
  "display": {
    "id": "gladia",
    "serviceKinds": [],
    "alias": "gladia",
    "name": "Gladia",
    "icon": "record_voice_over",
    "color": "#6425FE",
    "textIcon": "GL",
    "website": "https://gladia.io"
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "stt"
  ],
  sttConfig: AUDIO_PROTOCOLS["gladia"]
};
