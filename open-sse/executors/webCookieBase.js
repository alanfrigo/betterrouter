import { BaseExecutor as CurrentBaseExecutor } from "./base.js";
import { runWebCookieRequest } from "../utils/webCookieProxy.js";
import { FORMATS } from "../translator/formats.js";
import { SessionPool } from "../services/sessionPool/sessionPool.js";
import { PoolRegistry } from "../services/sessionPool/poolRegistry.js";
export { mergeUpstreamExtraHeaders, applyConfiguredUserAgent } from "./webCookieHeaders.js";

export function mergeAbortSignals(...signals) {
  return AbortSignal.any(signals.filter(Boolean));
}

// Adapt browser protocols to the gateway's executor input/output contract.
export class BaseExecutor extends CurrentBaseExecutor {
  constructor(provider, config) {
    super(provider, config);
    this.noAuth = ["duckduckgo-web", "cloudflare-playground", "veoaifree-web"].includes(provider);
    const execute = this.execute.bind(this);
    this.execute = async (input) => runWebCookieRequest(input, async () => {
      if (["maxai", "uc"].includes(provider) && input.credentials?.apiKey?.trim().startsWith("{")) {
        const data = JSON.parse(input.credentials.apiKey);
        if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Web credential JSON must be an object");
        input = { ...input, credentials: { ...input.credentials, providerSpecificData: { ...input.credentials.providerSpecificData, ...data } } };
      }
      const result = await execute({
        ...input,
        credentials: { ...input.credentials, connectionId: input.connectionId || input.credentials?.connectionId || input.credentials?.id },
        rawBody: input.rawBody || input.body,
        originalBody: input.originalBody || input.body,
        connectionId: input.connectionId || input.credentials?.id,
        upstreamExtraHeaders: input.upstreamExtraHeaders || input.providerOverrides?.headers,
      });
      const adapted = result instanceof Response ? { response: result, url: config.baseUrl, headers: {}, transformedBody: input.body } : result.errorResult || result;
      return { ...adapted, responseFormat: adapted.responseFormat || (provider === "chatgpt-web-codex" ? FORMATS.OPENAI_RESPONSES : FORMATS.OPENAI) };
    });
  }

  getPool() {
    if (!this.poolConfig) return null;
    if (!this._pool) {
      this._pool = new SessionPool(this.provider, this.poolConfig);
      this._pool.warmUp(this.poolConfig.minSessions).catch(() => {});
      PoolRegistry.register(this.provider, this._pool);
    }
    return this._pool;
  }
}
