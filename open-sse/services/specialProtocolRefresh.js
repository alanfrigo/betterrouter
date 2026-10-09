import { publicProtocolFetch } from "../executors/protocolSupport.js";
import { OPENFERENCE_CONFIG, GITLAB_DUO_CONFIG } from "../../src/lib/oauth/constants/specialProtocols.js";
import { buildGitLabOAuthEndpoints } from "../../src/lib/oauth/gitlab.js";

export async function refreshSpecialProtocolToken(provider, credentials) {
  if (!credentials.refreshToken) return null;
  let url, options;
  if (provider === "workbuddy") {
    url = "https://www.workbuddy.ai/v2/plugin/auth/token/refresh";
    options = { method: "POST", headers: { "X-Refresh-Token": credentials.refreshToken, "X-Product": "SaaS", Accept: "application/json" } };
  } else {
    const config = provider === "openference" ? OPENFERENCE_CONFIG : GITLAB_DUO_CONFIG;
    const data = credentials.providerSpecificData || {};
    url = provider === "openference" ? config.tokenUrl : buildGitLabOAuthEndpoints(data.baseUrl).tokenUrl;
    const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: credentials.refreshToken, client_id: data.clientId || config.clientId });
    const trustedOrigin = provider === "openference" || new URL(url).origin === new URL(config.baseUrl).origin;
    const secret = typeof data.clientSecret === "string" ? data.clientSecret : trustedOrigin ? config.clientSecret : "";
    if (secret) body.set("client_secret", secret);
    options = { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body };
  }
  const response = await publicProtocolFetch(url, { ...options, signal: AbortSignal.timeout(20000) });
  if (!response.ok) return null;
  const raw = await response.json();
  const tokens = provider === "workbuddy" ? raw.data : raw;
  const accessToken = tokens?.access_token || tokens?.accessToken;
  if (!accessToken) return null;
  return { accessToken, refreshToken: tokens.refresh_token || tokens.refreshToken || credentials.refreshToken, expiresIn: tokens.expires_in || tokens.expiresIn || (provider === "workbuddy" ? 31104000 : 3600) };
}
