import { randomUUID } from "node:crypto";
import { sanitizeErrorMessage } from "../protocolSupport.js";

function usage(value = {}) {
  return { input_tokens: value.inputTokens || 0, output_tokens: value.outputTokens || 0, total_tokens: value.totalTokens ?? ((value.inputTokens || 0) + (value.outputTokens || 0)), input_tokens_details: { cached_tokens: value.cachedInputTokens || 0 }, output_tokens_details: { reasoning_tokens: value.reasoningOutputTokens || 0 } };
}
function toolItem(call, options) {
  const identity = options.toolNsMap?.get(call.name);
  const name = identity?.name || call.name;
  if (options.freeformToolNames?.has(call.name)) {
    let input = call.arguments;
    try { input = JSON.parse(input).input ?? input; } catch {}
    return { type: "custom_tool_call", id: `ctc_${call.id}`, call_id: call.id, name, input, status: "completed", ...(identity ? { namespace: identity.namespace } : {}) };
  }
  if (options.toolSearchToolNames?.has(call.name)) {
    let argumentsValue;
    try { argumentsValue = JSON.parse(call.arguments); } catch { argumentsValue = { query: call.arguments }; }
    return { type: "tool_search_call", id: `ts_${call.id}`, call_id: call.id, arguments: argumentsValue, status: "completed" };
  }
  return { type: "function_call", id: `fc_${call.id}`, call_id: call.id, name, arguments: call.arguments, status: "completed", ...(identity ? { namespace: identity.namespace } : {}) };
}
export function buildResponseJSON(events, model, options = {}) {
  const output = [];
  let text = "", thinking = "", call = null, error = null, tokens;
  for (const event of events) {
    if (event.type === "text_delta") text += event.text;
    if (event.type === "thinking_delta") thinking += event.thinking;
    if (event.type === "tool_call_start") call = { id: event.id, name: event.name, arguments: "" };
    if (event.type === "tool_call_delta" && call) call.arguments += event.arguments || "";
    if (event.type === "tool_call_end" && call) { output.push(toolItem(call, options)); call = null; }
    if (event.type === "error") error = { code: event.code || "provider_error", message: sanitizeErrorMessage(event.message) };
    if (event.usage) tokens = usage(event.usage);
  }
  if (thinking) output.unshift({ type: "reasoning", id: `rs_${randomUUID()}`, summary: [{ type: "summary_text", text: thinking }] });
  if (text) output.push({ type: "message", id: `msg_${randomUUID()}`, role: "assistant", status: "completed", content: [{ type: "output_text", text, annotations: [] }] });
  return { id: `resp_${randomUUID()}`, object: "response", created_at: Math.floor(Date.now() / 1000), model, status: error ? "failed" : "completed", output, error, usage: tokens || usage() };
}
export function bridgeToResponsesSSE(events, model, toolNsMap, freeformToolNames, toolSearchToolNames, cancel) {
  const encoder = new TextEncoder();
  const options = { toolNsMap, freeformToolNames, toolSearchToolNames };
  return new ReadableStream({
    async start(controller) {
      const collected = [];
      let sequence = 0, nextIndex = 0, message = null, reasoning = null, call = null, text = "", thinking = "";
      const initial = buildResponseJSON([], model, options);
      initial.status = "in_progress";
      const emit = (type, data) => controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify({ type, sequence_number: sequence++, ...data })}\n\n`));
      try {
        emit("response.created", { response: initial });
        emit("response.in_progress", { response: initial });
        for await (const event of events) {
          collected.push(event);
          if (event.type === "text_delta") {
            if (!message) {
              message = { index: nextIndex++, item: { id: `msg_${randomUUID()}`, type: "message", role: "assistant", status: "in_progress", content: [] } };
              emit("response.output_item.added", { output_index: message.index, item: message.item });
              emit("response.content_part.added", { item_id: message.item.id, output_index: message.index, content_index: 0, part: { type: "output_text", text: "", annotations: [] } });
            }
            text += event.text;
            emit("response.output_text.delta", { item_id: message.item.id, output_index: message.index, content_index: 0, delta: event.text });
          }
          if (event.type === "thinking_delta") {
            if (!reasoning) {
              reasoning = { index: nextIndex++, item: { id: `rs_${randomUUID()}`, type: "reasoning", summary: [] } };
              emit("response.output_item.added", { output_index: reasoning.index, item: reasoning.item });
              emit("response.reasoning_summary_part.added", { item_id: reasoning.item.id, output_index: reasoning.index, summary_index: 0, part: { type: "summary_text", text: "" } });
            }
            thinking += event.thinking;
            emit("response.reasoning_summary_text.delta", { item_id: reasoning.item.id, output_index: reasoning.index, summary_index: 0, delta: event.thinking });
          }
          if (event.type === "tool_call_start") {
            call = { id: event.id, name: event.name, arguments: "", index: nextIndex++ };
            const item = toolItem(call, options); item.status = "in_progress";
            emit("response.output_item.added", { output_index: call.index, item });
          }
          if (event.type === "tool_call_delta" && call) {
            call.arguments += event.arguments || "";
            const item = toolItem(call, options);
            if (item.type === "function_call") emit("response.function_call_arguments.delta", { item_id: item.id, output_index: call.index, delta: event.arguments || "" });
          }
          if (event.type === "tool_call_end" && call) {
            const item = toolItem(call, options);
            if (item.type === "function_call") emit("response.function_call_arguments.done", { item_id: item.id, output_index: call.index, arguments: item.arguments });
            emit("response.output_item.done", { output_index: call.index, item });
            call = null;
          }
        }
        const response = buildResponseJSON(collected, model, options); response.id = initial.id;
        if (message) {
          const part = { type: "output_text", text, annotations: [] };
          emit("response.output_text.done", { item_id: message.item.id, output_index: message.index, content_index: 0, text });
          emit("response.content_part.done", { item_id: message.item.id, output_index: message.index, content_index: 0, part });
          emit("response.output_item.done", { output_index: message.index, item: { ...message.item, status: "completed", content: [part] } });
        }
        if (reasoning) emit("response.output_item.done", { output_index: reasoning.index, item: { ...reasoning.item, summary: [{ type: "summary_text", text: thinking }] } });
        emit(response.error ? "response.failed" : "response.completed", { response });
        controller.close();
      } catch (error) { controller.error(error); }
    },
    cancel,
  });
}
