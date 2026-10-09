import { AUDIO_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "speechmatics",
  "alias": "sm",
  "display": {
    "id": "speechmatics",
    "serviceKinds": [],
    "alias": "sm",
    "name": "Speechmatics",
    "icon": "record_voice_over",
    "color": "#0A2540",
    "textIcon": "SM",
    "website": "https://www.speechmatics.com",
    "hasFree": true,
    "freeNote": "Free tier — 8 hours/month, no credit card required. Batch (async) mode only."
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "stt"
  ],
  sttConfig: AUDIO_PROTOCOLS["speechmatics"]
};
