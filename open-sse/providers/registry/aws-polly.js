import { SPEECH_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "aws-polly",
  "alias": "polly",
  "display": {
    "id": "aws-polly",
    "serviceKinds": [],
    "alias": "polly",
    "name": "AWS Polly",
    "icon": "record_voice_over",
    "color": "#FF9900",
    "textIcon": "PL",
    "website": "https://aws.amazon.com/polly/",
    "authHint": "Use AWS Secret Access Key as API key; set providerSpecificData.accessKeyId and optional region."
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "tts"
  ],
  ttsConfig: SPEECH_PROTOCOLS["aws-polly"]
};
