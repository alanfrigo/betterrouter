import { DefaultExecutor } from "./default.js";
import { buildGlmChatUrl, buildGlmBaseHeaders, buildGlmCodingHeaders, getGlmTransport } from "../config/glmProvider.js";
import { translateRequest } from "../translator/index.js";
import { translateNonStreamingResponse } from "../handlers/chatCore/nonStreamingHandler.js";
import { createSSETransformStreamWithLogger } from "../utils/stream.js";
import { FORMATS } from "../translator/formats.js";
import { publicProtocolFetch } from "./protocolSupport.js";

export function parseGlmEffortTier(model) {
  const match = /^(glm-5\.(?:2|3)(?:-flash)?)-(low|medium|high|xhigh|max)$/.exec(model || "");
  if (!match) return null;
  const effort = match[1].startsWith("glm-5.2") ? (["low", "medium"].includes(match[2]) ? "high" : match[2] === "xhigh" ? "max" : match[2]) : match[2];
  return { baseModel: match[1], effort };
}

export class GlmExecutor extends DefaultExecutor {
  constructor(provider = "glm") { super(provider); }
  buildUrl(model, stream, index = 0, credentials = {}) {
    return buildGlmChatUrl(credentials.providerSpecificData, getGlmTransport(credentials.providerSpecificData, this.config.baseUrl), this.config.baseUrl);
  }
  transformRequest(model, body, stream, credentials) {
    const tier = parseGlmEffortTier(model);
    const result = { ...super.transformRequest(tier?.baseModel || model, body, stream, credentials), model: tier?.baseModel || model, stream };
    if (tier) { result.reasoning_effort = tier.effort; result.thinking = { ...result.thinking, type: "enabled" }; }
    if (/^glm-5\.3/.test(result.model) && result.thinking?.type === "disabled") result.thinking = { ...result.thinking, type: "enabled" };
    if (/^glm-5\.[23]/.test(result.model) && body.max_tokens == null && body.max_completion_tokens == null) result.max_tokens = 131072;
    if (stream && result.tools?.length && result.tool_stream == null) result.tool_stream = true;
    if (this.provider === "glmt") {
      result.thinking ??= { type: "enabled", budget_tokens: 24576 };
      result.temperature ??= 0.2;
      result.max_tokens ??= 65536;
    }
    return result;
  }
  async execute(input) {
    const data = input.credentials.providerSpecificData;
    const transport = getGlmTransport(data, this.config.baseUrl);
    const key = input.credentials.apiKey || input.credentials.accessToken;
    let transformedBody = this.transformRequest(input.model, input.body, input.stream, input.credentials);
    const url = buildGlmChatUrl(data, transport, this.config.baseUrl);
    const headers = { ...(transport === "anthropic" ? buildGlmBaseHeaders(key, input.stream) : buildGlmCodingHeaders(key, input.stream)), ...input.providerOverrides?.headers };
    if (transport === "anthropic") {
      transformedBody = translateRequest(FORMATS.OPENAI, FORMATS.CLAUDE, transformedBody.model, { ...transformedBody, _disableToolPrefix: true }, input.stream, input.credentials, this.provider);
      delete transformedBody._toolNameMap;
      const tier = parseGlmEffortTier(input.model);
      if (tier) { transformedBody.effort = tier.effort; transformedBody.thinking = { ...transformedBody.thinking, type: "enabled" }; }
    }
    const signal = input.signal ? AbortSignal.any([input.signal, AbortSignal.timeout(this.config.timeoutMs || 300000)]) : AbortSignal.timeout(this.config.timeoutMs || 300000);
    let response = await publicProtocolFetch(url, { method: "POST", headers, body: JSON.stringify(transformedBody), signal });
    if (response.ok && transport === "anthropic") {
      if ((response.headers.get("content-type") || "").includes("text/event-stream")) {
        response = new Response(response.body.pipeThrough(createSSETransformStreamWithLogger(FORMATS.CLAUDE, FORMATS.OPENAI, this.provider, null, null, input.model)), { status: response.status, headers: response.headers });
      } else {
        response = Response.json(translateNonStreamingResponse(await response.json(), FORMATS.CLAUDE, FORMATS.OPENAI));
      }
    }
    return { response, url, headers, transformedBody };
  }
}
