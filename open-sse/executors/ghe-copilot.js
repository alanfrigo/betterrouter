import { GithubExecutor } from "./github.js";
import { publicProtocolFetch } from "./protocolSupport.js";
import { GHE_COPILOT_CONFIG } from "../../src/lib/oauth/constants/specialProtocols.js";
import { assertPublicUrlResolved } from "../../src/shared/utils/ssrfGuard.js";

export class GheCopilotExecutor extends GithubExecutor {
  constructor() { super(); this.provider = "ghe-copilot"; }
  endpoint(credentials) {
    const data = credentials.providerSpecificData || {};
    const root = data.copilotApiUrl || data.copilotProxyUrl || data.gheUrl;
    if (!root) throw new Error("GHE Copilot requires gheUrl");
    return root.replace(/\/(?:chat\/completions|responses|v1\/messages)\/?$/, "").replace(/\/+$/, "");
  }
  buildHeaders(credentials, stream) {
    return super.buildHeaders({ ...credentials, copilotToken: credentials.copilotToken || credentials.providerSpecificData?.copilotToken }, stream);
  }
  async execute(input) {
    // Request-scoped instance: dynamic tenant endpoints must never race across accounts.
    const scoped = new GithubExecutor();
    const base = this.endpoint(input.credentials);
    scoped.provider = this.provider;
    scoped.fetchUpstream = publicProtocolFetch;
    scoped.config = { ...this.config, baseUrl: `${base}/chat/completions`, responsesUrl: `${base}/responses`, messagesUrl: `${base}/v1/messages` };
    const credentials = { ...input.credentials, copilotToken: input.credentials.copilotToken || input.credentials.providerSpecificData?.copilotToken };
    const url = new URL(base);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("GHE Copilot requires HTTPS endpoint");
    await assertPublicUrlResolved(base);
    return scoped.execute({ ...input, credentials, model: input.model.replace(/^ghe-copilot\//, "") });
  }
  async refreshCredentials(credentials) {
    const data = credentials.providerSpecificData || {};
    const base = data.gheUrl?.replace(/\/+$/, "");
    if (!base) return null;
    let accessToken = credentials.accessToken;
    const exchange = async () => publicProtocolFetch(`${base}/api/v3/copilot_internal/v2/token`, { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" }, signal: AbortSignal.timeout(20000) });
    let response = await exchange();
    let tokens;
    if (!response.ok && credentials.refreshToken) {
      const refresh = await publicProtocolFetch(`${base}/login/oauth/access_token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: credentials.refreshToken, client_id: data.clientId || GHE_COPILOT_CONFIG.clientId }), signal: AbortSignal.timeout(20000) });
      if (!refresh.ok) return null;
      tokens = await refresh.json(); accessToken = tokens.access_token;
      if (!accessToken) return null;
      response = await exchange();
    }
    if (!response.ok) return null;
    const copilot = await response.json();
    return { accessToken, refreshToken: tokens?.refresh_token || credentials.refreshToken, expiresIn: tokens?.expires_in, copilotToken: copilot.token, copilotTokenExpiresAt: copilot.expires_at, providerSpecificData: { ...data, copilotToken: copilot.token, copilotTokenExpiresAt: copilot.expires_at, copilotApiUrl: copilot.endpoints?.api || data.copilotApiUrl, copilotProxyUrl: copilot.endpoints?.proxy || data.copilotProxyUrl } };
  }
}
