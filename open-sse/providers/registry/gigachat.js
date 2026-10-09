export default {
  "id": "gigachat",
  "alias": "gigachat",
  "category": "apikey",
  "display": {
    "name": "GigaChat (Sber)",
    "icon": "lock_person",
    "color": "#10B981",
    "textIcon": "GC",
    "website": "https://developers.sber.ru"
  },
  "hasProviderSpecificData": true,
  "credentialFields": [
    {
      "name": "scope",
      "label": "OAuth scope",
      "required": false,
      "placeholder": "GIGACHAT_API_PERS"
    },
    {
      "name": "baseUrl",
      "label": "Chat API URL",
      "required": false,
      "placeholder": "https://gigachat.devices.sberbank.ru/api/v1"
    }
  ],
  "transport": {
    "baseUrl": "https://gigachat.devices.sberbank.ru/api/v1"
  },
  "passthroughModels": true,
  "models": [
    {
      "id": "GigaChat-2-Max",
      "name": "GigaChat-2-Max"
    },
    {
      "id": "GigaChat-2-Pro",
      "name": "GigaChat-2-Pro"
    },
    {
      "id": "GigaChat-2-Lite",
      "name": "GigaChat-2-Lite"
    }
  ],
  "authHint": "Use the base64 authorization key from Sber; it is exchanged for a short-lived GigaChat OAuth token."
};
