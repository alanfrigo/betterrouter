import { BaseExecutor } from "./base.js";
import { proxyAwareFetch } from "../utils/proxyFetch.js";

export class UpstreamProxyExecutor extends BaseExecutor {
  constructor(provider = "cliproxyapi") {
    const name = provider === "9router" ? "NINEROUTER" : "CLIPROXYAPI";
    const port = provider === "9router" ? 20130 : 8317;
    super(provider, { baseUrl: `http://${process.env[`${name}_HOST`] || "127.0.0.1"}:${process.env[`${name}_PORT`] || port}`, noAuth: true });
  }
  async execute(input) {
    const raw = input.credentials.providerSpecificData?.baseUrl || this.config.baseUrl;
    const base = new URL(raw);
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error("Upstream proxy requires HTTP(S) base URL without credentials, query or fragment");
    const body = { ...input.body, model: input.model, stream: input.stream };
    const format = input.wireFormat || input.credentials.runtimeTransport?.format || this.config.format || "openai";
    const endpoint = format === "claude" ? "/v1/messages" : format === "openai-responses" ? "/v1/responses" : "/v1/chat/completions";
    const url = `${base.href.replace(/\/(?:v1\/)?(?:chat\/completions|messages|responses)\/?$/, "").replace(/\/v1\/?$/, "").replace(/\/+$/, "")}${endpoint}`;
    const headers = this.buildHeaders(input.credentials, input.stream);
    Object.assign(headers, input.providerOverrides?.headers);
    const response = await proxyAwareFetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: input.signal, redirect: "error" }, input.proxyOptions);
    return { response, url, headers, transformedBody: body, responseFormat: format };
  }
}
