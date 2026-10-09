export const CLOVA_V3_MAX_OUTPUT_TOKENS = 4096;
export const CLOVA_V3_REASONING_MAX_OUTPUT_TOKENS = 32768;
export const CLOVA_V3_MIN_TOOL_TOKENS = 1024;
export const CLOVA_V3_REASONING_MODELS = new Set(["HCX-007"]);
export const CLOVA_V3_VISION_MODELS = new Set(["HCX-005"]);
export const CLOVA_V3_FUNCTION_CALLING_MODELS = new Set([
  "HCX-005",
  "HCX-007",
  "HCX-DASH-002"
]);
export const CLOVA_V3_STRUCTURED_OUTPUT_MODELS = new Set(["HCX-007"]);
const CLOVA_THINKING_EFFORTS = new Set(["none", "low", "medium", "high"]);
function toRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function nonEmptyString(value) {
  return typeof value === "string" && value.length > 0 ? value : "";
}
export function isClovaReasoningModel(model) {
  return typeof model === "string" && CLOVA_V3_REASONING_MODELS.has(model.toUpperCase());
}
export function isClovaVisionModel(model) {
  return typeof model === "string" && CLOVA_V3_VISION_MODELS.has(model.toUpperCase());
}
export function isClovaFunctionCallingModel(model) {
  return typeof model === "string" && CLOVA_V3_FUNCTION_CALLING_MODELS.has(model.toUpperCase());
}
export function isClovaStructuredOutputModel(model) {
  return typeof model === "string" && CLOVA_V3_STRUCTURED_OUTPUT_MODELS.has(model.toUpperCase());
}
function clampNumeric(value, min, max) {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n))
    return null;
  return Math.min(Math.max(n, min), max);
}
export function toClovaThinkingEffort(reasoningEffort) {
  if (typeof reasoningEffort !== "string")
    return "";
  const effort = reasoningEffort.toLowerCase();
  if (effort === "minimal")
    return "low";
  return CLOVA_THINKING_EFFORTS.has(effort) ? effort : "";
}
function contentToString(content) {
  if (typeof content === "string")
    return content;
  if (!Array.isArray(content))
    return content == null ? "" : String(content);
  return content.map((part) => part && typeof part === "object" && typeof part.text === "string" ? part.text : "").filter(Boolean).join(`
`);
}
export function toClovaContent(content, supportsImages) {
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }
  if (!Array.isArray(content)) {
    return [{ type: "text", text: content == null ? "" : String(content) }];
  }
  const parts = content.map((part) => toClovaContentPart(part, supportsImages)).filter((part) => part !== null);
  return parts.length > 0 ? parts : [{ type: "text", text: "" }];
}
function toClovaContentPart(part, supportsImages) {
  const record = toRecord(part);
  if (!record)
    return null;
  const text = nonEmptyString(record.text);
  if (record.type === "text" || text)
    return text ? { type: "text", text } : null;
  if (record.type !== "image_url" || !supportsImages)
    return null;
  const imageUrl = toRecord(record.image_url);
  const url = nonEmptyString(imageUrl?.url) || nonEmptyString(record.url);
  if (!url)
    return null;
  return url.startsWith("data:") ? { type: "image_url", dataUri: { data: url } } : { type: "image_url", imageUrl: { url } };
}
function toolArgumentsToObject(raw) {
  if (raw == null)
    return {};
  if (typeof raw === "object")
    return raw;
  if (typeof raw !== "string" || !raw.trim())
    return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
export function toClovaTools(tools) {
  if (!Array.isArray(tools))
    return [];
  return tools.map(toClovaTool).filter((tool) => tool !== null);
}
function toClovaTool(tool) {
  const record = toRecord(tool);
  if (!record)
    return null;
  const fn = toRecord(record.function);
  const name = nonEmptyString(fn?.name) || nonEmptyString(record.name);
  if (!name)
    return null;
  const description = nonEmptyString(fn?.description) || nonEmptyString(record.description) || `Tool: ${name}`;
  const parameters = fn?.parameters ?? record.parameters;
  return {
    type: "function",
    function: {
      name,
      description,
      ...parameters ? { parameters } : {}
    }
  };
}
export function resolveClovaMode(model, body) {
  const tools = toClovaTools(body?.tools);
  if (tools.length > 0 && isClovaFunctionCallingModel(model))
    return "tools";
  const format = toRecord(body?.response_format);
  const wantsSchema = format && (format.type === "json_schema" || format.type === "json_object");
  if (wantsSchema && isClovaStructuredOutputModel(model))
    return "structured";
  return "plain";
}
function normalizeMessageRole(role) {
  return role === "assistant" || role === "system" ? role : "user";
}
function toClovaToolCall(call) {
  const record = toRecord(call) ?? {};
  const fn = toRecord(record.function);
  return {
    id: record.id ?? "",
    type: "function",
    function: {
      name: fn?.name ?? record.name ?? "",
      arguments: toolArgumentsToObject(fn?.arguments ?? record.arguments)
    }
  };
}
function toClovaToolModeMessage(message) {
  const record = toRecord(message) ?? {};
  if (record.role === "tool") {
    return {
      role: "tool",
      content: contentToString(record.content),
      ...record.tool_call_id ? { toolCallId: String(record.tool_call_id) } : {}
    };
  }
  const toolCalls = Array.isArray(record.tool_calls) ? record.tool_calls : [];
  if (record.role === "assistant" && toolCalls.length > 0) {
    return {
      role: "assistant",
      content: "",
      toolCalls: toolCalls.map(toClovaToolCall)
    };
  }
  return {
    role: normalizeMessageRole(record.role),
    content: contentToString(record.content)
  };
}
function toClovaPlainMessage(message, supportsImages) {
  const record = toRecord(message) ?? {};
  return {
    role: normalizeMessageRole(record.role),
    content: toClovaContent(record.content, supportsImages)
  };
}
function toClovaMessages(body, mode, supportsImages) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  return messages.map((message) => mode === "tools" ? toClovaToolModeMessage(message) : toClovaPlainMessage(message, supportsImages));
}
function applyThinking(payload, body, reasoning, mode) {
  if (!reasoning)
    return;
  const effort = toClovaThinkingEffort(body.reasoning_effort);
  if (mode === "tools" || mode === "structured") {
    payload.thinking = { effort: "none" };
  } else if (effort) {
    payload.thinking = { effort };
  }
}
function applySampling(payload, body) {
  const temperature = clampNumeric(body.temperature, 0, 1);
  if (temperature !== null)
    payload.temperature = temperature;
  const topP = clampNumeric(body.top_p, 0, 1);
  if (topP !== null && topP > 0)
    payload.topP = topP;
  const topK = clampNumeric(body.top_k, 0, 128);
  if (topK !== null && topK > 0)
    payload.topK = topK;
  const penalty = clampNumeric(body.repetition_penalty, 0, 2);
  if (penalty !== null && penalty > 0)
    payload.repetitionPenalty = penalty;
}
function applyOutputCap(payload, body, reasoning, mode) {
  const cap = reasoning ? CLOVA_V3_REASONING_MAX_OUTPUT_TOKENS : CLOVA_V3_MAX_OUTPUT_TOKENS;
  const key = reasoning ? "maxCompletionTokens" : "maxTokens";
  let tokens = clampNumeric(body.max_completion_tokens ?? body.max_tokens, 1, cap);
  if (mode === "tools") {
    const floor = Math.min(CLOVA_V3_MIN_TOOL_TOKENS, cap);
    tokens = tokens === null ? floor : Math.max(tokens, floor);
  }
  if (tokens !== null)
    payload[key] = tokens;
}
function responseSchema(body) {
  const format = toRecord(body.response_format);
  const jsonSchema = toRecord(format?.json_schema);
  return jsonSchema?.schema ?? format?.schema;
}
function applyModeFields(payload, body, mode) {
  if (mode === "tools") {
    payload.tools = toClovaTools(body.tools);
    if (body.tool_choice === "none")
      payload.toolChoice = "none";
    if (body.tool_choice === "auto" || body.tool_choice === "required") {
      payload.toolChoice = "auto";
    }
    return;
  }
  if (mode !== "structured")
    return;
  const schema = responseSchema(body);
  if (schema && typeof schema === "object") {
    payload.responseFormat = { type: "json", schema };
  } else {
    delete payload.thinking;
  }
}
function applyPlainOptions(payload, body, reasoning, mode) {
  if (mode === "plain" && !reasoning) {
    if (Array.isArray(body.stop) && body.stop.length > 0) {
      payload.stop = body.stop.filter((value) => typeof value === "string");
    } else if (typeof body.stop === "string" && body.stop) {
      payload.stop = [body.stop];
    }
  }
  const seed = clampNumeric(body.seed, 0, 4294967295);
  if (seed !== null && seed > 0)
    payload.seed = Math.floor(seed);
  if (body.include_ai_filters === true)
    payload.includeAiFilters = true;
}
export function buildClovaPayload(model, body, stream, credentials) {
  const reasoning = isClovaReasoningModel(model);
  const mode = resolveClovaMode(model, body);
  const supportsImages = mode === "plain" && isClovaVisionModel(model);
  const payload = { messages: toClovaMessages(body, mode, supportsImages) };
  applyThinking(payload, body, reasoning, mode);
  applySampling(payload, body);
  applyOutputCap(payload, body, reasoning, mode);
  applyModeFields(payload, body, mode);
  applyPlainOptions(payload, body, reasoning, mode);
  return payload;
}
