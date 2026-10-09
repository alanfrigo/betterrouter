import githubProvider from "../../../../open-sse/providers/registry/github.js";
import { buildGitLabOAuthEndpoints } from "../gitlab.js";
const GITHUB_CONFIG = githubProvider.oauth;

export const OPENFERENCE_CONFIG = {
  clientId: process.env.OPENFERENCE_OAUTH_CLIENT_ID || "omniroute",
  authorizeUrl: "https://openference.com/app/oauth/authorize",
  tokenUrl: "https://openference.com/oauth/token",
  userinfoUrl: "https://openference.com/oauth/userinfo",
  scope: "openid profile email model:invoke offline_access",
  codeChallengeMethod: "S256", loopbackPort: 56123, callbackPath: "/callback", callbackHost: "127.0.0.1",
};
export const GHE_COPILOT_CONFIG = { ...GITHUB_CONFIG, clientId: process.env.GHE_COPILOT_OAUTH_CLIENT_ID || GITHUB_CONFIG.clientId };
const endpoints = buildGitLabOAuthEndpoints();
export const GITLAB_DUO_CONFIG = {
  baseUrl: endpoints.root,
  clientId: process.env.GITLAB_DUO_OAUTH_CLIENT_ID || process.env.GITLAB_OAUTH_CLIENT_ID || "",
  clientSecret: process.env.GITLAB_DUO_OAUTH_CLIENT_SECRET || process.env.GITLAB_OAUTH_CLIENT_SECRET || "",
  authorizeUrl: endpoints.authorizeUrl, tokenUrl: endpoints.tokenUrl, userInfoUrl: endpoints.userUrl,
  scope: "ai_features read_user", codeChallengeMethod: "S256",
};
export const DEVIN_DESKTOP_CONFIG = { apiServerUrl: "https://server.codeium.com", inferenceUrl: "https://inference.codeium.com", ideName: "windsurf", defaultVersion: "3.6.27" };
