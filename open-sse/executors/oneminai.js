import { fetchPublic, assertPublicUrl } from "../../src/shared/utils/ssrfGuard.js";
import { randomUUID } from "node:crypto";
import {
  BaseExecutor
} from "./base.js";
import { PROVIDERS } from "../config/constants.js";
import { buildErrorBody } from "../utils/mediaProtocolErrors.js";
const CHAT_URL = "https://api.1min.ai/api/chat-with-ai";
const MAX_STREAM_ERROR_DATA_CHARS = 64 * 1024;
const STREAM_ERROR_FALLBACK = "1min.ai upstream stream failed";
const ROLE_LABELS = {
  system: "System",
  developer: "System",
  user: "User",
  assistant: "Assistant"
};
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function extractTextContent(content) {
  if (typeof content === "string")
    return content;
  if (!Array.isArray(content))
    return "";
  return content.map((part) => {
    if (!part || typeof part !== "object")
      return "";
    const item = part;
    return item.type === "text" && typeof item.text === "string" ? item.text : "";
  }).filter((text) => text.length > 0).join(`
`);
}
export function buildPrompt(messages) {
  const list = Array.isArray(messages) ? messages : [];
  if (list.length === 1 && list[0]?.role === "user") {
    return extractTextContent(list[0].content);
  }
  return list.map((message) => {
    const role = String(message?.role || "user").toLowerCase();
    const text = extractTextContent(message?.content);
    const label = ROLE_LABELS[role] || role;
    return `${label}: ${text}`;
  }).filter((line) => line.length > 0).join(`

`);
}
function buildSseChunk(data) {
  return `data: ${JSON.stringify(data)}

`;
}
function parseStreamErrorMessage(data) {
  if (!data || data.length > MAX_STREAM_ERROR_DATA_CHARS)
    return STREAM_ERROR_FALLBACK;
  try {
    const parsed = asRecord(JSON.parse(data));
    const directMessage = typeof parsed.message === "string" ? parsed.message.trim() : "";
    if (directMessage)
      return directMessage;
    if (typeof parsed.error === "string") {
      const errorMessage = parsed.error.trim();
      if (errorMessage)
        return errorMessage;
    }
    const nestedError = asRecord(parsed.error);
    const nestedMessage = typeof nestedError.message === "string" ? nestedError.message.trim() : "";
    if (nestedMessage)
      return nestedMessage;
  } catch {}
  return STREAM_ERROR_FALLBACK;
}
function buildOpenAiJsonCompletion(content, model, id, created) {
  return new Response(JSON.stringify({
    id,
    object: "chat.completion",
    created,
    model,
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  }), { status: 200, headers: { "Content-Type": "application/json" } });
}
function toOpenAiErrorResponse(status, message, upstreamDetails) {
  return new Response(JSON.stringify(buildErrorBody(status, message, upstreamDetails)), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function translateSseStream(upstreamBody, model, id, created) {
  const decoder = new TextDecoder;
  const encoder = new TextEncoder;
  const reader = upstreamBody.getReader();
  const pendingChunks = [];
  let buffer = "";
  let finished = false;
  let roleEmitted = false;
  let terminalError = null;
  let upstreamCancelRequested = false;
  let downstreamCancelled = false;
  let readInFlight = false;
  let readerReleased = false;
  const releaseReader = () => {
    if (readerReleased)
      return;
    readerReleased = true;
    reader.releaseLock();
  };
  const cancelUpstream = (reason) => {
    if (upstreamCancelRequested)
      return;
    upstreamCancelRequested = true;
    try {
      reader.cancel(reason).catch(() => {});
    } catch {}
  };
  const queueChunk = (text) => {
    pendingChunks.push(encoder.encode(text));
  };
  const emitRole = () => {
    if (roleEmitted)
      return;
    roleEmitted = true;
    queueChunk(buildSseChunk({
      id,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }]
    }));
  };
  const finish = () => {
    if (finished)
      return;
    finished = true;
    queueChunk(buildSseChunk({
      id,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [{ index: 0, delta: {}, finish_reason: "stop" }]
    }));
    queueChunk(`data: [DONE]

`);
  };
  const emitContent = (text) => {
    if (!text)
      return;
    emitRole();
    queueChunk(buildSseChunk({
      id,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [{ index: 0, delta: { content: text }, finish_reason: null }]
    }));
  };
  const emitError = (data) => {
    if (finished)
      return;
    finished = true;
    cancelUpstream("1min.ai upstream stream error");
    if (!roleEmitted) {
      const message = parseStreamErrorMessage(data);
      queueChunk(buildSseChunk(buildErrorBody(502, message)));
      queueChunk(`data: [DONE]

`);
      return;
    }
    terminalError = Object.assign(new Error(STREAM_ERROR_FALLBACK), {
      statusCode: 502
    });
  };
  const processEvent = (eventText) => {
    let eventType = "message";
    const dataLines = [];
    for (const rawLine of eventText.split(`
`)) {
      if (rawLine.startsWith("event:")) {
        eventType = rawLine.slice(6).trim();
      } else if (rawLine.startsWith("data:")) {
        dataLines.push(rawLine.slice(5).trim());
      }
    }
    const data = dataLines.join(`
`);
    if (eventType === "content") {
      try {
        const parsed = asRecord(JSON.parse(data));
        if (typeof parsed.content === "string")
          emitContent(parsed.content);
      } catch {}
    } else if (eventType === "error") {
      emitError(data);
    } else if (eventType === "done") {
      finish();
    }
  };
  const processBufferedEvents = () => {
    let separatorIndex = buffer.indexOf(`

`);
    while (separatorIndex !== -1 && !finished) {
      processEvent(buffer.slice(0, separatorIndex));
      buffer = buffer.slice(separatorIndex + 2);
      separatorIndex = buffer.indexOf(`

`);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      if (downstreamCancelled)
        return;
      if (pendingChunks.length > 0) {
        controller.enqueue(pendingChunks.shift());
        return;
      }
      if (terminalError) {
        releaseReader();
        controller.error(terminalError);
        return;
      }
      if (finished) {
        releaseReader();
        controller.close();
        return;
      }
      readInFlight = true;
      try {
        while (pendingChunks.length === 0 && !finished && !downstreamCancelled) {
          const { done, value } = await reader.read();
          if (downstreamCancelled)
            return;
          if (done) {
            buffer += decoder.decode();
            if (buffer.trim())
              processEvent(buffer);
            finish();
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          processBufferedEvents();
        }
        if (downstreamCancelled)
          return;
        if (pendingChunks.length > 0) {
          controller.enqueue(pendingChunks.shift());
        } else if (terminalError) {
          releaseReader();
          controller.error(terminalError);
        } else if (finished) {
          releaseReader();
          controller.close();
        }
      } catch (error) {
        releaseReader();
        if (!downstreamCancelled)
          controller.error(error);
      } finally {
        readInFlight = false;
        if (downstreamCancelled)
          releaseReader();
      }
    },
    cancel(reason) {
      downstreamCancelled = true;
      pendingChunks.length = 0;
      cancelUpstream(reason ?? "1min.ai downstream cancelled");
      if (!readInFlight)
        releaseReader();
    }
  });
}

export class OneMinAiExecutor extends BaseExecutor {
  constructor() {
    super("oneminai", PROVIDERS["oneminai"] || { format: "openai", baseUrl: CHAT_URL });
  }
  buildUrl(_model, stream) {
    return stream ? `${CHAT_URL}?isStreaming=true` : CHAT_URL;
  }
  buildHeaders(credentials) {
    const key = credentials?.apiKey || credentials?.accessToken || "";
    return {
      "Content-Type": "application/json",
      "API-KEY": key
    };
  }
  transformRequest(model, body) {
    const payload = asRecord(body);
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    return {
      type: "UNIFY_CHAT_WITH_AI",
      model,
      promptObject: { prompt: buildPrompt(messages) }
    };
  }
  async execute({ model, body, stream, credentials, signal, providerOverrides }) {
    const url = this.buildUrl(model, stream);
    const headers = this.buildHeaders(credentials);
    if (providerOverrides?.headers)
      Object.assign(headers, providerOverrides.headers);
    const payload = this.transformRequest(model, body);
    const id = `chatcmpl-oneminai-${randomUUID()}`;
    const created = Math.floor(Date.now() / 1000);
    try {
      assertPublicUrl(url);
      const response = await fetchPublic(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal
      });
      if (!response.ok) {
        const errorText = await response.text();
        let message = `1min.ai API failed with status ${response.status}`;
        try {
          const parsed = asRecord(JSON.parse(errorText));
          const err = asRecord(parsed.error);
          if (typeof err.message === "string")
            message = err.message;
        } catch {
          if (errorText)
            message = errorText;
        }
        return {
          response: toOpenAiErrorResponse(response.status, message),
          url,
          headers,
          transformedBody: payload
        };
      }
      if (stream) {
        if (!response.body) {
          return {
            response: toOpenAiErrorResponse(502, "1min.ai returned an empty stream"),
            url,
            headers,
            transformedBody: payload
          };
        }
        return {
          response: new Response(translateSseStream(response.body, model, id, created), {
            status: 200,
            headers: { "Content-Type": "text/event-stream" }
          }),
          url,
          headers,
          transformedBody: payload
        };
      }
      const json = asRecord(await response.json());
      const aiRecord = asRecord(json.aiRecord);
      const detail = asRecord(aiRecord.aiRecordDetail);
      const resultObject = Array.isArray(detail.resultObject) ? detail.resultObject : [];
      const content = resultObject.filter((part) => typeof part === "string").join("");
      return {
        response: buildOpenAiJsonCompletion(content, model, id, created),
        url,
        headers,
        transformedBody: payload
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "Unknown error");
      return {
        response: toOpenAiErrorResponse(502, `1min.ai fetch error: ${message}`),
        url,
        headers,
        transformedBody: payload
      };
    }
  }
}
export default OneMinAiExecutor;
