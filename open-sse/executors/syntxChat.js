import { createHash, randomBytes } from "node:crypto";
import { SYNTX_API_BASE, SYNTX_SSE_ORIGIN } from "../services/syntxAuth.js";
import { extractSyntxMessageText } from "../services/syntxSessions.js";
function isSyntxPromptToolEmulationEnabled() {
  const raw = (process.env.OMNIROUTE_PROMPT_EMULATE_TOOLS ?? "").trim().toLowerCase();
  if (!raw)
    return true;
  return raw === "1" || raw === "true" || raw === "on" || raw === "yes";
}
const TOOL_MARK = "<tool_call>";
const TOOL_INSTRUCTIONS = `
# Tool Calling
SYNTX native tools (search, code, shell) are on.
Local proxy tools are also on.
Call a local proxy tool with EXACTLY this block (no markdown fences):
<tool_call>
{"name": "tool_name", "arguments": {"param": "value"}}
</tool_call>
Multiple blocks allowed. If no local tool is needed, answer in plain text.
`;
export const SYNTX_NATIVE_TOOLS = ["search", "code", "shell"];
export const SYNTX_REQUEST_TIMEOUT_MS = 600000;
export function syntxFetchSignal(parent) {
  const timeout = AbortSignal.timeout(SYNTX_REQUEST_TIMEOUT_MS);
  if (!parent)
    return timeout;
  try {
    if (typeof AbortSignal.any === "function")
      return AbortSignal.any([timeout, parent]);
  } catch {}
  return timeout;
}
export const SYNTX_CHATS_URL = `${SYNTX_API_BASE}/api/v1/chats`;
export const SYNTX_UPLOAD_URL = `${SYNTX_API_BASE}/api/v1/chats/upload-files`;
export const SYNTX_SETTINGS_URL = `${SYNTX_API_BASE}/api/v1/user/settings`;
export const SYNTX_GENERATE_PATH = `${SYNTX_API_BASE}/api/v1/llm/generate`;
export const SYNTX_ACCOUNT_SYSTEM_PROMPT_MAX_CHARS = 4000;
export const SYNTX_FILE_COMPACT_PROMPT = `Analyze the attached tmp.txt chat transcript in full (do not ask for it to be pasted).
` + `Write a handoff so this same chat can continue the same task.
` + `Maximum 10000 characters.
` + `Keep: user goal, constraints, files/paths, decisions, errors, current state, next step.
` + `Drop: tool catalogs, system instructions, session secrets, duplicated logs, raw file bodies.
` + "Plain text only. No JSON tool calls.";
export function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
export function toStringOrEmpty(value) {
  return typeof value === "string" ? value : "";
}
export function listSyntxToolNames(tools) {
  if (!Array.isArray(tools))
    return [];
  const names = [];
  for (const tool of tools) {
    if (!tool || typeof tool !== "object" || Array.isArray(tool))
      continue;
    const rec = tool;
    const fn = asRecord(rec.function).name ? asRecord(rec.function) : rec;
    const name = toStringOrEmpty(fn.name);
    if (name)
      names.push(name);
  }
  return names;
}
function formatOneSyntxToolDef(tool) {
  if (!tool || typeof tool !== "object" || Array.isArray(tool))
    return "";
  const rec = tool;
  const fn = asRecord(rec.function).name ? asRecord(rec.function) : rec;
  const name = toStringOrEmpty(fn.name);
  if (!name)
    return "";
  let out = `### ${name}
`;
  if (typeof fn.description === "string" && fn.description)
    out += `${fn.description}
`;
  out += formatSyntxToolParams(fn);
  return `${out}
`;
}
function formatSyntxToolParams(fn) {
  const parameters = asRecord(fn.parameters);
  const properties = asRecord(parameters.properties);
  const required = new Set(Array.isArray(parameters.required) ? parameters.required.filter((item) => typeof item === "string") : []);
  const entries = Object.entries(properties);
  if (entries.length === 0)
    return "";
  let out = `Parameters:
`;
  for (const [key, spec] of entries) {
    const info = asRecord(spec);
    const req = required.has(key) ? ", required" : "";
    const desc = typeof info.description === "string" ? ` — ${info.description}` : "";
    out += `  - ${key} (${toStringOrEmpty(info.type) || "any"}${req})${desc}
`;
  }
  return out;
}
export function formatSyntxToolDefs(tools) {
  if (!Array.isArray(tools) || tools.length === 0)
    return "";
  let out = `${TOOL_INSTRUCTIONS}## Available tools:

`;
  for (const tool of tools)
    out += formatOneSyntxToolDef(tool);
  return out;
}
export function collectSyntxTopLevelSystem(body) {
  const parts = [];
  const push = (value) => {
    if (typeof value === "string" && value.trim())
      parts.push(value.trim());
  };
  const sys = body.system;
  if (typeof sys === "string")
    push(sys);
  else if (Array.isArray(sys)) {
    for (const item of sys) {
      if (typeof item === "string")
        push(item);
      else if (item && typeof item === "object") {
        const rec = item;
        push(extractSyntxMessageText(rec.text ?? rec.content ?? rec));
      }
    }
  }
  push(body.instructions);
  return parts.join(`

`).trim();
}
export function normalizeSyntxRequestMessages(body) {
  const raw = Array.isArray(body.messages) ? body.messages : Array.isArray(body.input) ? body.input : [];
  const top = collectSyntxTopLevelSystem(body);
  const out = [];
  if (top) {
    const already = raw.some((message) => {
      const role = (message?.role || "").toLowerCase();
      if (role !== "system" && role !== "developer")
        return false;
      const text = extractSyntxMessageText(message.content);
      const sample = top.slice(0, Math.min(80, top.length));
      return Boolean(sample) && text.includes(sample);
    });
    if (!already)
      out.push({ role: "system", content: top });
  }
  for (const message of raw) {
    if (!message || typeof message !== "object")
      continue;
    out.push(message);
  }
  return out;
}
function parseToolCallArgs(raw) {
  if (typeof raw !== "string")
    return raw ?? {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function appendAssistantToolCalls(text, toolCalls) {
  if (!Array.isArray(toolCalls))
    return text;
  let out = text;
  for (const toolCall of toolCalls) {
    if (!toolCall || typeof toolCall !== "object" || Array.isArray(toolCall))
      continue;
    const fn = asRecord(toolCall.function);
    const name = toStringOrEmpty(fn.name);
    const args = parseToolCallArgs(fn.arguments);
    out += `
${TOOL_MARK}
${JSON.stringify({ name, arguments: args })}
</tool_call>`;
  }
  return out;
}
function flattenOneSyntxMessage(rec, dropClientSystem) {
  const role = typeof rec.role === "string" ? rec.role.toLowerCase() : "";
  if (role === "system" || role === "developer") {
    if (dropClientSystem)
      return null;
    return `<system>
${extractSyntxMessageText(rec.content)}
</system>`;
  }
  if (role === "user")
    return `<user>
${extractSyntxMessageText(rec.content)}
</user>`;
  if (role === "assistant") {
    const text = appendAssistantToolCalls(extractSyntxMessageText(rec.content), rec.tool_calls);
    return `<assistant>
${text}
</assistant>`;
  }
  if (role === "tool" || role === "function") {
    const name = toStringOrEmpty(rec.name) || toStringOrEmpty(rec.tool_call_id) || "tool";
    return `<tool_result name="${name}">
${extractSyntxMessageText(rec.content)}
</tool_result>`;
  }
  return null;
}
export function flattenSyntxMessages(messages, dropClientSystem = false) {
  if (!Array.isArray(messages))
    return "";
  const parts = [];
  for (const message of messages) {
    if (!message || typeof message !== "object" || Array.isArray(message))
      continue;
    const part = flattenOneSyntxMessage(message, dropClientSystem);
    if (part)
      parts.push(part);
  }
  return parts.join(`

`).trim();
}
export function lastUserText(messages) {
  if (!Array.isArray(messages))
    return "";
  for (let i = messages.length - 1;i >= 0; i--) {
    const message = messages[i];
    if (!message || typeof message !== "object" || Array.isArray(message))
      continue;
    const rec = message;
    if ((rec.role || "").toString().toLowerCase() === "user") {
      return extractSyntxMessageText(rec.content);
    }
  }
  return "";
}
export function messagesHaveSyntxToolTraffic(messages) {
  if (!Array.isArray(messages))
    return false;
  for (const message of messages) {
    if (!message || typeof message !== "object" || Array.isArray(message))
      continue;
    const rec = message;
    const role = typeof rec.role === "string" ? rec.role : "";
    if (role === "tool" || role === "function")
      return true;
    if (role === "assistant" && Array.isArray(rec.tool_calls) && rec.tool_calls.length > 0)
      return true;
    if (extractSyntxMessageText(rec.content).includes(TOOL_MARK))
      return true;
  }
  return false;
}
export function syntxToolCatalogFingerprint(tools) {
  if (!Array.isArray(tools) || tools.length === 0)
    return "";
  return createHash("sha256").update(formatSyntxToolDefs(tools)).digest("hex");
}
export function trailingSyntxToolResults(messages) {
  if (!Array.isArray(messages))
    return "";
  const parts = [];
  for (let i = messages.length - 1;i >= 0; i--) {
    const message = messages[i];
    if (!message || typeof message !== "object" || Array.isArray(message))
      break;
    const rec = message;
    const role = (rec.role || "").toString().toLowerCase();
    if (role === "tool" || role === "function") {
      const name = toStringOrEmpty(rec.name) || toStringOrEmpty(rec.tool_call_id) || "tool";
      parts.unshift(`<tool_result name="${name}">
${extractSyntxMessageText(rec.content)}
</tool_result>`);
      continue;
    }
    if (role === "user" || role === "human") {
      const formatted = formatSyntxUserToolResult(rec);
      if (!formatted)
        break;
      parts.unshift(formatted);
      continue;
    }
    break;
  }
  return parts.join(`

`).trim();
}
function formatOneToolResultBlock(part) {
  if (!part || typeof part !== "object" || Array.isArray(part))
    return null;
  const item = part;
  const type = toStringOrEmpty(item.type).toLowerCase();
  if (type !== "tool_result" && type !== "function_result")
    return null;
  const name = toStringOrEmpty(item.name) || toStringOrEmpty(item.tool_use_id) || toStringOrEmpty(item.tool_call_id) || "tool";
  const body = extractSyntxMessageText(item.content) || extractSyntxMessageText(item.output) || toStringOrEmpty(item.content);
  return `<tool_result name="${name}">
${body}
</tool_result>`;
}
function formatSyntxUserToolResult(rec) {
  if (Array.isArray(rec.content)) {
    const blocks = rec.content.map((part) => formatOneToolResultBlock(part)).filter((block) => Boolean(block));
    if (blocks.length > 0)
      return blocks.join(`

`);
  }
  const text = extractSyntxMessageText(rec.content);
  if (text.includes("<tool_result") || text.includes("TOOL_OBSERVATION") || text.startsWith("Application result")) {
    return text.trim();
  }
  return null;
}
export function buildSyntxFollowUpDelta(messages) {
  const toolResults = trailingSyntxToolResults(messages);
  if (toolResults)
    return toolResults;
  return lastUserText(messages).trim();
}
function wantsSyntxToolCatalog(tools, messages) {
  return Array.isArray(tools) && tools.length > 0 || messagesHaveSyntxToolTraffic(messages);
}
export function buildSyntxGenerateText(options) {
  const emulate = options.emulateTools ?? isSyntxPromptToolEmulationEnabled();
  const injectCatalog = emulate && wantsSyntxToolCatalog(options.tools, options.messages) && !options.toolsAlreadyInjected;
  const catalog = injectCatalog ? Array.isArray(options.tools) && options.tools.length > 0 ? formatSyntxToolDefs(options.tools) : TOOL_INSTRUCTIONS : "";
  const dropSystem = injectCatalog || options.omitClientSystem === true;
  const body = options.threadRollover ? buildSyntxThreadRolloverText(options.messages) : options.reuseChat ? buildSyntxFollowUpDelta(options.messages) : flattenSyntxMessages(options.messages, dropSystem) || lastUserText(options.messages).trim();
  const merged = catalog ? `${catalog}

${body}`.trim() : body.trim();
  return { text: capSyntxGenerateText(merged), injectedCatalog: Boolean(catalog) };
}
export const SYNTX_MAX_GENERATE_CHARS = 200000;
export const SYNTX_ROLLOVER_TRANSCRIPT_CHARS = 150000;
export const SYNTX_ROLLOVER_TOOL_CHARS = 2000;
export const SYNTX_ROLLOVER_LAST_USER_CHARS = 20000;
function looksLikeSyntxToolDump(text) {
  const t = text || "";
  return t.includes("<tool_result") || t.includes("TOOL_OBSERVATION") || t.includes("[tool result") || t.startsWith("Application result") || t.includes("function_call_output");
}
function capSyntxHandoffPart(text, max = SYNTX_ROLLOVER_TOOL_CHARS) {
  const t = typeof text === "string" ? text : "";
  if (!t)
    return "";
  if (t.length <= max)
    return t;
  if (!looksLikeSyntxToolDump(t) && max >= SYNTX_ROLLOVER_TOOL_CHARS) {
    return t;
  }
  return capSyntxGenerateText(t, max);
}
function flattenOneRolloverMessage(rec) {
  const role = typeof rec.role === "string" ? rec.role.toLowerCase() : "";
  if (role === "system" || role === "developer")
    return null;
  if (role === "user") {
    const body = capSyntxHandoffPart(extractSyntxMessageText(rec.content));
    return body ? `<user>
${body}
</user>` : null;
  }
  if (role === "assistant") {
    const text = appendAssistantToolCalls(extractSyntxMessageText(rec.content), rec.tool_calls);
    const body = capSyntxHandoffPart(text, SYNTX_ROLLOVER_TOOL_CHARS * 4);
    return body ? `<assistant>
${body}
</assistant>` : null;
  }
  if (role === "tool" || role === "function") {
    const name = toStringOrEmpty(rec.name) || toStringOrEmpty(rec.tool_call_id) || "tool";
    const body = capSyntxGenerateText(extractSyntxMessageText(rec.content), SYNTX_ROLLOVER_TOOL_CHARS);
    return `<tool_result name="${name}">
${body}
</tool_result>`;
  }
  return null;
}
export function flattenSyntxMessagesForRollover(messages) {
  if (!Array.isArray(messages))
    return "";
  const parts = [];
  for (const message of messages) {
    if (!message || typeof message !== "object" || Array.isArray(message))
      continue;
    const part = flattenOneRolloverMessage(message);
    if (part)
      parts.push(part);
  }
  return parts.join(`

`).trim();
}
export function buildSyntxThreadRolloverText(messages) {
  const last = capSyntxGenerateText(lastUserText(messages).trim() || "Continue.", SYNTX_ROLLOVER_LAST_USER_CHARS);
  const transcript = capSyntxGenerateText(flattenSyntxMessagesForRollover(messages), SYNTX_ROLLOVER_TRANSCRIPT_CHARS);
  return [
    "Continue from the previous SYNTX thread (approaching the 800-message cap). Same task and constraints.",
    "",
    "--- start of thread ---",
    transcript || "(empty)",
    "--- end of thread ---",
    "",
    "Latest user message:",
    last
  ].join(`
`);
}
export function capSyntxGenerateText(text, max = SYNTX_MAX_GENERATE_CHARS) {
  const t = typeof text === "string" ? text : "";
  if (t.length <= max)
    return t;
  const omitted = t.length - max;
  const marker = `
...[logical strip: ${omitted} chars omitted to fit SYNTX ${max} cap]...
`;
  const budget = Math.max(16, max - marker.length);
  const head = Math.max(8, Math.floor(budget * 0.55));
  const tail = Math.max(8, budget - head);
  return `${t.slice(0, head).trimEnd()}${marker}${t.slice(-tail).trimStart()}`;
}
function thinkingEffortEnabled(body) {
  const thinkingObj = asRecord(body.thinking);
  const thinkingType = toStringOrEmpty(thinkingObj.type).toLowerCase();
  if (thinkingType === "enabled" || thinkingType === "auto")
    return true;
  const budget = Number(thinkingObj.budget_tokens ?? body.max_thinking_tokens ?? 0);
  if (Number.isFinite(budget) && budget > 0)
    return true;
  const effort = toStringOrEmpty(body.reasoning_effort) || toStringOrEmpty(asRecord(body.reasoning).effort) || thinkingType;
  const lowered = effort.toLowerCase();
  return Boolean(lowered) && lowered !== "none" && lowered !== "minimal" && lowered !== "disabled" && lowered !== "false";
}
export function wantSyntxThinking(body, modelId, _catalog) {
  if (body.thinking === true)
    return true;
  if (thinkingEffortEnabled(body))
    return true;
  return modelId.toLowerCase().includes("thinking");
}
function makeToolCall(name, args) {
  return {
    id: `call_${randomBytes(6).toString("hex")}`,
    type: "function",
    function: {
      name,
      arguments: typeof args === "string" ? args : JSON.stringify(args ?? {})
    }
  };
}
function toolCallFromUnknown(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj))
    return null;
  const rec = obj;
  const name = toStringOrEmpty(rec.name) || toStringOrEmpty(rec.tool);
  if (!name)
    return null;
  return makeToolCall(name, rec.arguments ?? rec.args ?? rec.parameters ?? {});
}
export function parseSyntxToolCalls(text) {
  const regex = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g;
  const calls = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      let raw = match[1].trim();
      if (raw.startsWith("```"))
        raw = raw.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();
      const call = toolCallFromUnknown(JSON.parse(raw));
      if (call)
        calls.push(call);
    } catch {}
  }
  const content = text.replace(/<tool_call>\s*[\s\S]*?\s*<\/tool_call>/g, "").trim();
  return { calls, content };
}
export function looksLikeSyntxRefusal(text) {
  if (!text || text.includes(TOOL_MARK))
    return false;
  const sample = text.length <= 4000 ? text : `${text.slice(0, 2500)}
${text.slice(-800)}`;
  const phrase = /don['’]?t have|do not have|no access|cannot |can['’]?t (?:access|execute|run|read)|not able to|unable to|not (?:available|exposed|connected)/i;
  const subject = /tool|file|filesystem|shell|bash|terminal|workspace|repositor/i;
  return phrase.test(sample) && subject.test(sample);
}
function applySyntxSsePayload(result, parsed) {
  const type = toStringOrEmpty(parsed.type);
  if (type === "content" && typeof parsed.content === "string" && parsed.content) {
    result.delta = (result.delta || "") + parsed.content;
    return;
  }
  if (type === "usage_final") {
    const prompt = typeof parsed.tokens_input === "number" ? parsed.tokens_input : 0;
    const completion = typeof parsed.tokens_output === "number" ? parsed.tokens_output : 0;
    result.usage = {
      prompt_tokens: prompt,
      completion_tokens: completion,
      total_tokens: prompt + completion
    };
    return;
  }
  if (type === "error") {
    result.error = toStringOrEmpty(parsed.message) || toStringOrEmpty(parsed.content) || "SYNTX stream error";
  }
}
export function extractSyntxSseEvent(event) {
  const result = {};
  for (const line of event.split(`
`)) {
    const match = line.match(/^\s*data:\s*(.*)\s*$/);
    if (!match)
      continue;
    const payload = match[1];
    if (payload === "[DONE]")
      continue;
    try {
      applySyntxSsePayload(result, JSON.parse(payload));
    } catch {}
  }
  return result;
}
export function isSyntxStreamUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.origin === SYNTX_SSE_ORIGIN && parsed.pathname.startsWith("/stream/");
  } catch {
    return false;
  }
}
export function encodeSyntxUploadMultipart(file) {
  const safeName = file.name.replace(/["\r\n]/g, "_") || "image.png";
  const safeMime = file.mime.replace(/[\r\n]/g, "") || "application/octet-stream";
  const boundary = `----WebKitFormBoundary${randomBytes(8).toString("hex")}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r
Content-Disposition: form-data; name="files"; filename="${safeName}"\r
Content-Type: ${safeMime}\r
\r
`),
    Buffer.from(file.bytes),
    Buffer.from(`\r
--${boundary}\r
Content-Disposition: form-data; name="destination"\r
\r
uploaded\r
--${boundary}\r
Content-Disposition: form-data; name="check_duplicates"\r
\r
true\r
--${boundary}\r
Content-Disposition: form-data; name="model_type"\r
\r
\r
--${boundary}--\r
`)
  ]);
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}
export function chatTitleFromText(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned)
    return "New chat";
  return cleaned.length > 80 ? `${cleaned.slice(0, 77)}...` : cleaned;
}
export function buildSyntxGenerateBody(options) {
  const body = {
    chat_uuid: options.chatUuid,
    text: options.text,
    model: options.model,
    thinking: options.thinking === true,
    plan: false,
    deep_research: options.deepResearch === true,
    tools: options.nativeTools === false ? [] : [...SYNTX_NATIVE_TOOLS]
  };
  if (options.files && options.files.length > 0)
    body.files = options.files;
  return body;
}
function imageUrlFromPart(rec) {
  const type = toStringOrEmpty(rec.type).toLowerCase();
  if (type === "image_url" || type === "input_image") {
    const nested = asRecord(rec.image_url);
    return toStringOrEmpty(rec.url) || toStringOrEmpty(nested.url) || toStringOrEmpty(rec.image);
  }
  if (typeof rec.image_url === "string")
    return rec.image_url;
  return "";
}
export function collectSyntxImageSources(content) {
  const out = [];
  if (typeof content === "string") {
    const match = content.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g);
    if (match)
      for (const dataUrl of match)
        out.push({ url: dataUrl });
    return out;
  }
  if (!Array.isArray(content))
    return out;
  for (const part of content) {
    if (!part || typeof part !== "object" || Array.isArray(part))
      continue;
    const url = imageUrlFromPart(part).trim();
    if (url)
      out.push({ url });
  }
  return out;
}
export function decodeDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match)
    return null;
  const mime = match[1];
  const bytes = Uint8Array.from(Buffer.from(match[2], "base64"));
  const ext = mime.split("/")[1]?.replace("jpeg", "jpg") || "png";
  return { bytes, mime, name: `image.${ext}` };
}
export function openAiChunk(id, created, modelId, delta, finish = null) {
  return {
    id,
    object: "chat.completion.chunk",
    created,
    model: modelId,
    choices: [{ index: 0, delta, finish_reason: finish }]
  };
}
export function openAiCompletion(id, created, modelId, content, toolCalls, usage) {
  const message = { role: "assistant", content };
  if (toolCalls && toolCalls.length > 0)
    message.tool_calls = toolCalls;
  return {
    id,
    object: "chat.completion",
    created,
    model: modelId,
    choices: [
      {
        index: 0,
        message,
        finish_reason: toolCalls && toolCalls.length > 0 ? "tool_calls" : "stop"
      }
    ],
    usage: usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  };
}
