import { GHE_COPILOT_CONFIG } from "../constants/specialProtocols.js";
import { publicProtocolFetch } from "../../../../open-sse/executors/protocolSupport.js";

function root(value) {
  const url = new URL(value || "");
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error("gheUrl must be HTTPS URL without credentials, query or fragment");
  return url.href.replace(/\/+$/, "");
}
const headers = { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" };
const gheCopilot = {
  config: GHE_COPILOT_CONFIG,
  flowType: "device_code",
  prepareConfig: (config, meta) => ({ ...config, gheUrl: root(meta.gheUrl), clientId: meta.clientId || config.clientId }),
  async requestDeviceCode(config) {
    const response = await publicProtocolFetch(`${root(config.gheUrl)}/login/device/code`, { method: "POST", headers, body: new URLSearchParams({ client_id: config.clientId, scope: config.scopes || "read:user" }) });
    if (!response.ok) throw new Error(`GHE device code request failed (${response.status})`);
    const data = await response.json();
    return { ...Object.fromEntries(["device_code", "user_code", "verification_uri", "verification_uri_complete", "expires_in", "interval"].filter(key => typeof data[key] === "string" || typeof data[key] === "number").map(key => [key, data[key]])), gheUrl: config.gheUrl, clientId: config.clientId };
  },
  async pollToken(config, deviceCode, verifier, extra) {
    const response = await publicProtocolFetch(`${root(extra?.gheUrl || config.gheUrl)}/login/oauth/access_token`, { method: "POST", headers, body: new URLSearchParams({ client_id: extra?.clientId || config.clientId, device_code: deviceCode, grant_type: "urn:ietf:params:oauth:grant-type:device_code" }) });
    const data = await response.json();
    return { ok: response.ok, data: Object.fromEntries(["access_token", "refresh_token", "token_type", "scope", "expires_in", "error"].filter(key => typeof data[key] === "string" || typeof data[key] === "number").map(key => [key, data[key]])) };
  },
  async postExchange(tokens, extra) {
    const gheUrl = root(extra.gheUrl);
    const response = await publicProtocolFetch(`${gheUrl}/api/v3/copilot_internal/v2/token`, { headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: "application/json" } });
    if (!response.ok) throw new Error(`GHE Copilot token exchange failed (${response.status})`);
    return { gheUrl, clientId: extra.clientId, copilotToken: await response.json() };
  },
  mapTokens: (tokens, extra) => ({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, expiresIn: tokens.expires_in, copilotToken: extra.copilotToken.token, copilotTokenExpiresAt: extra.copilotToken.expires_at, providerSpecificData: { gheUrl: extra.gheUrl, clientId: extra.clientId, copilotApiUrl: extra.copilotToken.endpoints?.api, copilotProxyUrl: extra.copilotToken.endpoints?.proxy, copilotToken: extra.copilotToken.token, copilotTokenExpiresAt: extra.copilotToken.expires_at } }),
};
export default gheCopilot;
