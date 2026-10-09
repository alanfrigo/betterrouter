import { randomUUID, createHash } from "node:crypto";
import { BaseExecutor } from "./base.js";
import { PROVIDERS } from "../config/providers.js";
import { enterpriseChatUrl, enterpriseBaseUrl, ENTERPRISE_DEFAULTS, GIGACHAT_AUTH_URL, GIGACHAT_SCOPE } from "../config/enterprise.js";
import { proxyAwareFetch } from "../utils/proxyFetch.js";
import { ROLE, OPENAI_BLOCK } from "../translator/schema/index.js";
import { openaiToOpenAIResponsesRequest } from "../translator/request/openai-responses.js";
import { openaiResponsesToOpenAIResponse } from "../translator/response/openai-responses.js";

const nativeApps = new Set(["dify", "coze"]);
const gigachatTokens = new Map();

function parseObject(value, label) {
  if (!value) return {};
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`${label} must be a JSON object`);
  return parsed;
}

function userId(body, data) {
  if (data.conversationId && !body.user && !data.userId) throw new Error("Existing app conversations require a stable end-user ID");
  return body.user || data.userId || randomUUID();
}

function textContent(message) {
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) return message.content.filter(p => p.type === OPENAI_BLOCK.TEXT).map(p => p.text || "").join("\n");
  return "";
}

function appMessages(body) {
  if (body.tools?.length || body.messages?.some(m => m.tool_calls || m.role === ROLE.TOOL)) {
    throw new Error("Dify and Coze app APIs do not accept OpenAI tool declarations or tool results");
  }
  if (!Array.isArray(body.messages) || !body.messages.length) throw new Error("Chat messages are required");
  return body.messages;
}

export async function getEnterpriseToken(credentials, signal, proxyOptions = null, force = false) {
  if (!force && credentials.accessToken && (!credentials.expiresAt || new Date(credentials.expiresAt).getTime() > Date.now() + 60000)) return credentials;
  if (!credentials.apiKey) throw new Error("Missing GigaChat authorization key");
  const data = credentials.providerSpecificData || {};
  const key = createHash("sha256").update(`${credentials.apiKey}\0${data.scope || GIGACHAT_SCOPE}`).digest("hex");
  const cached = gigachatTokens.get(key);
  if (!force && cached && new Date(cached.expiresAt).getTime() > Date.now() + 60000) return { ...credentials, ...cached };
  const response = await proxyAwareFetch(GIGACHAT_AUTH_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials.apiKey}`, RqUID: randomUUID(), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ scope: data.scope || GIGACHAT_SCOPE }).toString(),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
  }, proxyOptions);
  if (!response.ok) throw new Error(`GigaChat token request failed (${response.status})`);
  const token = await response.json();
  const accessToken = token.access_token || token.tok;
  let expiry = token.expires_at ?? token.exp;
  if (typeof expiry === "number" && expiry < 1e12) expiry *= 1000;
  if (!accessToken || !Number.isFinite(new Date(expiry).getTime())) throw new Error("Invalid GigaChat token response");
  const result = { accessToken, expiresAt: new Date(expiry).toISOString() };
  if (gigachatTokens.size >= 100) gigachatTokens.delete(gigachatTokens.keys().next().value);
  gigachatTokens.set(key, result);
  return { ...credentials, ...result };
}

// Decode complete SSE frames; event/data fields can span arbitrary network chunks.
async function* events(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let boundary;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        let event = "";
        const data = [];
        for (const line of frame.split(/\r?\n/)) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
        }
        const text = data.join("\n");
        if (!text || text === "[DONE]") continue;
        yield { event, data: JSON.parse(text) };
      }
      if (done) break;
    }
    if (buffer.trim() && !buffer.trim().startsWith(":")) throw new Error("Upstream SSE ended with an incomplete event");
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

function usage(value) {
  if (!value) return undefined;
  const prompt = value.prompt_tokens ?? value.input_tokens ?? 0;
  const completion = value.completion_tokens ?? value.output_tokens ?? 0;
  return { prompt_tokens: prompt, completion_tokens: completion, total_tokens: value.total_tokens ?? (prompt + completion) };
}

async function* appChunks(response, provider, model, responsesApi) {
  const state = { model };
  const id = `chatcmpl-${randomUUID()}`;
  let complete = false;
  const chunk = (delta, finish = null, tokenUsage) => ({ id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta, finish_reason: finish }], ...(tokenUsage ? { usage: usage(tokenUsage) } : {}) });
  for await (const entry of events(response)) {
    const data = entry.data;
    const event = entry.event || data.event || data.type;
    if (responsesApi) {
      if (event === "error" || event === "response.failed") throw new Error(data.message || data.response?.error?.message || "Upstream Responses API failed");
      const converted = openaiResponsesToOpenAIResponse(data, state);
      if (converted) {
        for (const part of Array.isArray(converted) ? converted : [converted]) yield part;
      }
      if (event === "response.completed" || event === "response.incomplete") complete = true;
      continue;
    }
    if (event === "error" || event === "conversation.chat.failed") throw new Error(data.message || data.last_error?.msg || "Upstream chat failed");
    if (event === "conversation.chat.requires_action") throw new Error("Coze bot requires external tool execution, unsupported by this chat API");
    if (event === "workflow_paused" || event === "human_input_required") throw new Error("Dify app paused for human input");
    if (provider === "dify") {
      if (event === "message" || event === "agent_message") yield chunk({ content: data.answer || "" });
      else if (event === "reasoning_chunk") yield chunk({ reasoning_content: data.data?.reasoning || "" });
      else if (event === "message_replace") throw new Error("Dify moderation replaced an already streamed message");
      else if (event === "message_file") yield chunk({ content: `\n${data.url || ""}` });
      else if (event === "message_end") { complete = true; yield chunk({}, "stop", data.metadata?.usage); }
    } else {
      if (event === "conversation.message.delta" && data.type === "answer") yield chunk({ content: data.content || "", ...(data.reasoning_content ? { reasoning_content: data.reasoning_content } : {}) });
      else if (event === "conversation.chat.completed") { complete = true; yield chunk({}, "stop", data.usage); }
    }
  }
  if (!complete) throw new Error("Upstream chat ended before completion");
  if (responsesApi) {
    const final = openaiResponsesToOpenAIResponse(null, state);
    if (final) yield final;
  }
}

async function convertResponse(response, provider, model, stream, responsesApi) {
  const iterator = appChunks(response, provider, model, responsesApi);
  if (stream) {
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async pull(controller) {
        try {
          const next = await iterator.next();
          if (next.done) { controller.enqueue(encoder.encode("data: [DONE]\n\n")); controller.close(); }
          else controller.enqueue(encoder.encode(`data: ${JSON.stringify(next.value)}\n\n`));
        } catch (error) { controller.error(error); }
      },
      async cancel() { await iterator.return(); },
    });
    return new Response(body, { headers: { "Content-Type": "text/event-stream" } });
  }
  let id, tokenUsage, content = "", reasoning = "", finish = "stop";
  const tools = [];
  for await (const part of iterator) {
    id = part.id;
    tokenUsage = part.usage || tokenUsage;
    const choice = part.choices?.[0];
    const delta = choice?.delta || {};
    content += delta.content || "";
    reasoning += delta.reasoning_content || "";
    finish = choice?.finish_reason || finish;
    for (const tool of delta.tool_calls || []) {
      const target = tools[tool.index] ||= { id: tool.id, type: OPENAI_BLOCK.FUNCTION, function: { name: "", arguments: "" } };
      if (tool.id) target.id = tool.id;
      target.function.name += tool.function?.name || "";
      target.function.arguments += tool.function?.arguments || "";
    }
  }
  return Response.json({ id, object: "chat.completion", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, message: { role: ROLE.ASSISTANT, content, ...(reasoning ? { reasoning_content: reasoning } : {}), ...(tools.length ? { tool_calls: tools } : {}) }, finish_reason: finish }], ...(tokenUsage ? { usage: tokenUsage } : {}) });
}

export class EnterpriseExecutor extends BaseExecutor {
  constructor(provider) {
    super(provider, PROVIDERS[provider] || { baseUrl: ENTERPRISE_DEFAULTS[provider] });
  }

  buildUrl(model, stream, index = 0, credentials = {}) {
    const data = credentials?.providerSpecificData || {};
    const url = enterpriseChatUrl(this.provider, model, data);
    if ((this.provider === "azure-ai" || this.provider === "oci") && data.apiType === "responses" && !url.includes("/deployments/")) return url.replace(/\/chat\/completions$/, "/responses");
    return url;
  }

  buildHeaders(credentials, stream = true) {
    const headers = super.buildHeaders(credentials, stream);
    const data = credentials.providerSpecificData || {};
    const token = credentials.accessToken || credentials.apiKey;
    if (this.provider === "azure-ai") { delete headers.Authorization; headers["api-key"] = token; }
    if (this.provider === "clarifai") headers.Authorization = `Key ${token}`;
    if (this.provider === "sap") headers["AI-Resource-Group"] = data.resourceGroup || data.aiResourceGroup || data.resource_group || "default";
    if (this.provider === "oci" && (credentials.projectId || data.projectId || data.project)) headers["OpenAI-Project"] = credentials.projectId || data.projectId || data.project;
    if (this.provider === "snowflake") {
      const pat = token?.startsWith("pat/");
      headers.Authorization = `Bearer ${pat ? token.slice(4) : token}`;
      if (pat || data.tokenType) headers["X-Snowflake-Authorization-Token-Type"] = pat ? "PROGRAMMATIC_ACCESS_TOKEN" : data.tokenType;
    }
    return headers;
  }

  transformRequest(model, body, stream, credentials) {
    const data = credentials.providerSpecificData || {};
    if (this.provider === "dify") {
      const messages = appMessages(body);
      const latest = messages.at(-1);
      if (latest.role !== ROLE.USER) throw new Error("Dify chat must end with a user message");
      if (messages.slice(0, -1).some(m => Array.isArray(m.content) && m.content.some(p => p.type !== OPENAI_BLOCK.TEXT))) throw new Error("Dify history supports text only; upload current message images using remote URLs");
      const files = [];
      for (const part of Array.isArray(latest.content) ? latest.content : []) {
        if (part.type === OPENAI_BLOCK.IMAGE_URL) {
          const url = typeof part.image_url === "string" ? part.image_url : part.image_url?.url;
          if (!url?.startsWith("https://")) throw new Error("Dify images require publicly reachable HTTPS URLs");
          files.push({ type: "image", transfer_method: "remote_url", url });
        } else if (part.type !== OPENAI_BLOCK.TEXT) throw new Error(`Unsupported Dify content type: ${part.type}`);
      }
      // New app conversations retain all caller context in query; existing Dify IDs own history.
      const query = data.conversationId || messages.length === 1 ? textContent(latest) : messages.map(m => `${m.role}: ${textContent(m)}`).join("\n\n");
      return { inputs: parseObject(data.inputs, "Dify inputs"), query, response_mode: "streaming", user: userId(body, data), ...(data.conversationId ? { conversation_id: data.conversationId } : {}), ...(files.length ? { files } : {}) };
    }
    if (this.provider === "coze") {
      const messages = appMessages(body);
      const botId = data.botId || (model !== "auto" ? model : "");
      if (!botId) throw new Error("Coze bot ID is required");
      const additional_messages = messages.map(m => {
        if (![ROLE.USER, ROLE.ASSISTANT, ROLE.SYSTEM, ROLE.DEVELOPER].includes(m.role)) throw new Error(`Unsupported Coze message role: ${m.role}`);
        const role = m.role === ROLE.ASSISTANT ? ROLE.ASSISTANT : ROLE.USER;
        const prefix = m.role === ROLE.SYSTEM || m.role === ROLE.DEVELOPER ? `[${m.role}]\n` : "";
        if (typeof m.content === "string") return { role, content: prefix + m.content, content_type: "text" };
        const content = m.content.map(p => {
          if (p.type === OPENAI_BLOCK.TEXT) return { type: "text", text: p.text };
          if (p.type === OPENAI_BLOCK.IMAGE_URL) return { type: "image", file_url: typeof p.image_url === "string" ? p.image_url : p.image_url.url };
          throw new Error(`Unsupported Coze content type: ${p.type}`);
        });
        if (prefix) content.unshift({ type: "text", text: prefix });
        return { role, content: JSON.stringify(content), content_type: "object_string" };
      });
      return { bot_id: botId, user_id: userId(body, data), stream: true, auto_save_history: false, additional_messages, custom_variables: parseObject(data.customVariables, "Coze custom variables") };
    }
    if ((this.provider === "azure-ai" || this.provider === "oci") && data.apiType === "responses" && !this.buildUrl(model, stream, 0, credentials).includes("/deployments/")) return openaiToOpenAIResponsesRequest(model, body, true, credentials);
    return { ...body, model, stream };
  }

  needsRefresh(credentials) {
    if (this.provider !== "gigachat") return false;
    return !credentials.accessToken || (credentials.expiresAt && new Date(credentials.expiresAt).getTime() <= Date.now() + 60000);
  }

  async refreshCredentials(credentials, log, proxyOptions = null) {
    if (this.provider !== "gigachat") return null;
    return getEnterpriseToken({ ...credentials, accessToken: null }, null, proxyOptions, true);
  }

  async execute(args) {
    if (this.provider === "gigachat") args = { ...args, credentials: await getEnterpriseToken(args.credentials, args.signal, args.proxyOptions) };
    const url = this.buildUrl(args.model, args.stream, 0, args.credentials);
    const responsesApi = url.endsWith("/responses");
    const convert = nativeApps.has(this.provider) || responsesApi;
    const result = await super.execute(convert ? { ...args, stream: true } : args);
    if (convert && result.response.ok) result.response = await convertResponse(result.response, this.provider, args.model, args.stream, responsesApi);
    return result;
  }
}

export async function validateEnterpriseProvider(provider, apiKey, providerSpecificData = {}) {
  if (!Object.hasOwn(ENTERPRISE_DEFAULTS, provider)) return null;
  try {
    if (!apiKey?.trim()) return { valid: false, error: "API key is required" };
    const executor = new EnterpriseExecutor(provider);
    const credentials = { apiKey, providerSpecificData };
    if (provider === "gigachat") {
      await getEnterpriseToken(credentials);
      return { valid: true, error: null };
    }
    const base = enterpriseBaseUrl(provider, providerSpecificData);
    if (nativeApps.has(provider)) userId({}, providerSpecificData);
    let url, method = "GET", body;
    if (provider === "dify") {
      url = enterpriseChatUrl(provider, "auto", providerSpecificData).replace(/\/chat-messages$/, "/parameters");
      parseObject(providerSpecificData.inputs, "Dify inputs");
    } else if (provider === "coze") {
      if (!providerSpecificData.botId) return { valid: false, error: "Coze bot ID is required" };
      url = new URL("/v1/bot/get_online_info", base);
      url.searchParams.set("bot_id", providerSpecificData.botId);
      parseObject(providerSpecificData.customVariables, "Coze custom variables");
    } else if (["sap", "snowflake", "databricks", "heroku"].includes(provider)) {
      if (!providerSpecificData.validationModelId) return { valid: false, error: "Validation model ID is required" };
      method = "POST";
      url = executor.buildUrl(providerSpecificData.validationModelId, false, 0, credentials);
      body = { model: providerSpecificData.validationModelId, messages: [{ role: ROLE.USER, content: "Hi" }], max_tokens: 1, stream: false };
    } else if (provider === "datarobot") {
      const chatUrl = executor.buildUrl("", false, 0, credentials);
      if (/\/deployments\//.test(chatUrl)) {
        method = "POST";
        url = chatUrl;
        body = { model: providerSpecificData.validationModelId || "datarobot-deployed-llm", messages: [{ role: ROLE.USER, content: "Hi" }], max_tokens: 1, stream: false };
      } else url = chatUrl.replace(/\/api\/v2\/genai\/llmgw\/chat\/completions\/$/, "/genai/llmgw/catalog/");
    } else if (provider === "azure-ai" && executor.buildUrl(providerSpecificData.validationModelId || "", false, 0, credentials).includes("/deployments/")) {
      method = "POST";
      url = executor.buildUrl(providerSpecificData.validationModelId, false, 0, credentials);
      body = { model: providerSpecificData.validationModelId, messages: [{ role: ROLE.USER, content: "Hi" }], max_tokens: 1, stream: false };
    } else {
      url = enterpriseChatUrl(provider, providerSpecificData.validationModelId || "", providerSpecificData).replace(/\/chat\/completions(?:\?.*)?$/, "/models");
    }
    const response = await proxyAwareFetch(url, { method, headers: executor.buildHeaders(credentials, false), ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000) });
    if (!response.ok) return { valid: false, error: response.status === 401 || response.status === 403 ? "Invalid credentials or missing provider permissions" : `Provider validation failed (${response.status})` };
    const data = await response.json();
    if (provider === "coze" && data.code !== 0) return { valid: false, error: data.msg || "Coze validation failed" };
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
