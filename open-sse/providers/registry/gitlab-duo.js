export default {
  "id": "gitlab-duo",
  "alias": "gld",
  "category": "oauth",
  "authType": "oauth",
  "display": {
    "name": "GitLab Duo",
    "icon": "hub",
    "color": "#FC6D26",
    "textIcon": "GL",
    "website": "https://docs.gitlab.com/user/duo_agent_platform/code_suggestions/",
    "notice": {
      "text": "GitLab Duo OAuth is not configured. Register an OAuth application at https://gitlab.com/-/profile/applications with redirect URI http://localhost:20128/callback and scopes \"ai_features read_user\", then set GITLAB_DUO_OAUTH_CLIENT_ID (and optionally GITLAB_DUO_OAUTH_CLIENT_SECRET) and restart."
    }
  },
  "models": [
    {
      "id": "claude-sonnet-4-6",
      "name": "Claude Sonnet 4.6 (GitLab Duo)",
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "max"
      ]
    },
    {
      "id": "claude-haiku-4-5",
      "name": "Claude Haiku 4.5 (GitLab Duo)"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasOAuth": true,
  "authModes": [
    "oauth"
  ],
  "transport": {
    "baseUrl": "https://gitlab.com/api/v4/code_suggestions/completions",
    "format": "openai",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "oauth": {
    "clientIdEnv": "GITLAB_DUO_OAUTH_CLIENT_ID",
    "clientIdDefault": "",
    "clientSecretEnv": "GITLAB_DUO_OAUTH_CLIENT_SECRET",
    "clientSecretDefault": "",
    "tokenUrl": "https://gitlab.com/oauth/token",
    "authUrl": "https://gitlab.com/oauth/authorize"
  },
  "hasProviderSpecificData": true
};
