import { fetchPublic, assertPublicUrl } from "../../src/shared/utils/ssrfGuard.js";
import {
  makeExecutorErrorResult as makeErrorResult,
  sanitizeErrorMessage
} from "../utils/mediaProtocolErrors.js";
import {
  SYNTX_SITE,
  connectionFingerprint,
  looksLikeJwt,
  resolveSyntxToken,
  syntxAuthHeaders
} from "../services/syntxAuth.js";
import { inferSyntxAiName, mapSyntxModel } from "../services/syntxModels.js";
import {
  coalesceSyntxChatCreate,
  forgetSyntxPendingExact,
  hasSyntxGeneratePosted,
  hashSyntxConversation,
  lastUserMessage,
  lookupSyntxChatUuidForMessages,
  markSyntxGeneratePosted,
  rememberSyntxFollowUp,
  rememberSyntxPendingRequest,
  getSyntxChatGenerateCount,
  getSyntxInjectedToolsFingerprint,
  rememberSyntxInjectedTools,
  canonicalizeSyntxUserText,
  firstCanonicalSyntxUserText,
  looksLikeClaudeCodeSessionReset,
  lastUserTextForReset,
  lookupSyntxContinueChatUuid,
  syntxMessagesForNewSession,
  noteSyntxGenerate,
  shouldRolloverSyntxChat
} from "../services/syntxSessions.js";
import {
  SYNTX_ACCOUNT_SYSTEM_PROMPT_MAX_CHARS,
  SYNTX_CHATS_URL,
  SYNTX_FILE_COMPACT_PROMPT,
  SYNTX_GENERATE_PATH,
  SYNTX_SETTINGS_URL,
  SYNTX_UPLOAD_URL,
  asRecord,
  buildSyntxGenerateBody,
  buildSyntxGenerateText,
  capSyntxGenerateText,
  chatTitleFromText,
  collectSyntxImageSources,
  decodeDataUrl,
  encodeSyntxUploadMultipart,
  extractSyntxSseEvent,
  isSyntxStreamUrl,
  lastUserText,
  messagesHaveSyntxToolTraffic,
  normalizeSyntxRequestMessages,
  openAiChunk,
  openAiCompletion,
  parseSyntxToolCalls,
  syntxFetchSignal,
  syntxToolCatalogFingerprint,
  toStringOrEmpty,
  wantSyntxThinking
} from "./syntxChat.js";
export { SYNTX_REQUEST_TIMEOUT_MS } from "./syntxChat.js";
const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive"
};
function redactedGenerate(ctx, extra) {
  if (typeof extra === "object" && extra && "response" in extra) {
    return {
      ...extra,
      headers: { authorization: "Bearer <redacted>" },
      transformedBody: ctx.generateBody
    };
  }
  return extra;
}
export async function readSyntxSse(upstream, onDelta) {
  const reader = upstream.body?.getReader();
  if (!reader)
    return { ok: true, text: "" };
  const decoder = new TextDecoder;
  let buffer = "";
  let full = "";
  let usage;
  const feed = (chunk) => {
    buffer += chunk.replace(/\r\n/g, `
`);
    let idx;
    while ((idx = buffer.indexOf(`

`)) >= 0) {
      const event = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      applySyntxSseChunk(event, (delta) => {
        full += delta;
        onDelta(delta);
      }, (next) => {
        usage = next;
      });
    }
  };
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      feed(decoder.decode(value, { stream: true }));
    }
    feed(decoder.decode());
    if (buffer.trim()) {
      applySyntxSseChunk(buffer, (delta) => {
        full += delta;
        onDelta(delta);
      }, (next) => {
        usage = next;
      });
    }
    return { ok: true, text: full, usage };
  } catch (error) {
    return {
      ok: false,
      text: full,
      usage,
      errorMessage: error instanceof Error ? error.message : "SYNTX stream read failed"
    };
  }
}
function applySyntxSseChunk(event, onDelta, onUsage) {
  const parsed = extractSyntxSseEvent(event);
  if (parsed.delta)
    onDelta(parsed.delta);
  if (parsed.usage)
    onUsage(parsed.usage);
  if (parsed.error)
    throw new Error(parsed.error);
}
async function createSyntxChat(token, title, fetchImpl) {
  const response = await fetchImpl(SYNTX_CHATS_URL, {
    method: "POST",
    headers: {
      ...syntxAuthHeaders(token),
      "content-type": "application/json"
    },
    body: JSON.stringify({ title: chatTitleFromText(title), scope: "text" })
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`SYNTX create chat HTTP ${response.status}: ${sanitizeErrorMessage(errText)}`);
  }
  const json = asRecord(await response.json());
  const uuid = toStringOrEmpty(json.uuid);
  if (!uuid)
    throw new Error("SYNTX create chat returned no uuid");
  return uuid;
}
async function syncSyntxAccountSystemPrompt(token, body, fetchImpl) {
  let prompt = toStringOrEmpty(body.syntx_account_system_prompt);
  const disable = body.syntx_disable_account_system_prompt === true;
  if (!prompt && !disable)
    return;
  if (prompt.length > SYNTX_ACCOUNT_SYSTEM_PROMPT_MAX_CHARS) {
    prompt = trimAccountPrompt(prompt);
  }
  const payload = disable ? { user: { text: { system_prompt_enabled: { default: false } } } } : { user: { text: { system_prompt: { default: prompt } } } };
  try {
    const response = await fetchImpl(SYNTX_SETTINGS_URL, {
      method: "PUT",
      headers: {
        ...syntxAuthHeaders(token),
        "content-type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: syntxFetchSignal()
    });
    if (!response.ok)
      await response.text().catch(() => "");
  } catch {}
}
function trimAccountPrompt(prompt) {
  const slice = prompt.slice(0, SYNTX_ACCOUNT_SYSTEM_PROMPT_MAX_CHARS);
  const nl = slice.lastIndexOf(`
`);
  return (nl >= SYNTX_ACCOUNT_SYSTEM_PROMPT_MAX_CHARS / 2 ? slice.slice(0, nl) : slice).trimEnd();
}
async function uploadSyntxBytes(token, file, fetchImpl) {
  if (!file.bytes || file.bytes.byteLength === 0 || file.bytes.byteLength > 50 * 1024 * 1024) {
    return null;
  }
  const encoded = encodeSyntxUploadMultipart({
    bytes: file.bytes,
    name: file.name || "tmp.txt",
    mime: file.mime || "application/octet-stream"
  });
  const headers = syntxAuthHeaders(token);
  const response = await fetchImpl(SYNTX_UPLOAD_URL, {
    method: "POST",
    headers: {
      authorization: headers.authorization,
      accept: headers.accept,
      origin: headers.origin,
      referer: headers.referer,
      "user-agent": headers["user-agent"],
      "accept-language": headers["accept-language"],
      "content-type": encoded.contentType
    },
    body: encoded.body
  });
  if (!response.ok)
    return null;
  const json = asRecord(await response.json());
  const files = Array.isArray(json.files) ? json.files : [];
  const first = asRecord(files[0]);
  const url = toStringOrEmpty(first.url);
  if (!url)
    return null;
  const objectType = toStringOrEmpty(first.object_type) || toStringOrEmpty(first.type) || (file.mime.startsWith("image/") ? "image" : "file");
  return { url, objectType };
}
async function resolveImageBytes(source, fetchImpl) {
  let bytes = source.bytes;
  let mime = source.mime || "image/png";
  let name = source.name || "image.png";
  if (!bytes && source.url?.startsWith("data:")) {
    const decoded = decodeDataUrl(source.url);
    if (!decoded)
      return null;
    return decoded;
  }
  if (!bytes && source.url?.startsWith("https://")) {
    const fetched = await fetchImpl(source.url);
    if (!fetched.ok)
      return null;
    const buf = new Uint8Array(await fetched.arrayBuffer());
    mime = fetched.headers.get("content-type")?.split(";")[0]?.trim() || mime;
    return { bytes: buf, mime, name };
  }
  if (!bytes)
    return null;
  return { bytes, mime, name };
}
async function uploadSyntxImage(token, source, fetchImpl) {
  if (source.url && source.url.startsWith("https://r2.syntx.ai/"))
    return source.url;
  const resolved = await resolveImageBytes(source, fetchImpl);
  if (!resolved)
    return null;
  const uploaded = await uploadSyntxBytes(token, resolved, fetchImpl);
  return uploaded?.url || null;
}
function parseSyntxExecuteInput(input) {
  const { body, credentials, signal, stream: wantStream } = input;
  const bodyObj = asRecord(body);
  const requestedModel = input.model || toStringOrEmpty(bodyObj.model) || "auto";
  const modelId = mapSyntxModel(requestedModel);
  const token = resolveSyntxToken({
    apiKey: credentials?.apiKey,
    accessToken: credentials?.accessToken,
    providerSpecificData: credentials?.providerSpecificData
  });
  const messages = normalizeSyntxRequestMessages(bodyObj);
  if (!looksLikeJwt(token)) {
    return {
      result: makeErrorResult(401, "Missing SYNTX JWT — paste the Authorization Bearer token from syntx.ai (DevTools → Network).", body, SYNTX_GENERATE_PATH)
    };
  }
  const session = resolveSyntxSession(bodyObj, messages, token, modelId, credentials?.connectionId);
  const generated = composeSyntxText(bodyObj, session);
  return {
    ctx: {
      body,
      bodyObj,
      signal,
      wantStream,
      fetchImpl: fetchPublic,
      requestedModel,
      modelId,
      token,
      messages,
      hasTools: requestHasTools(bodyObj, messages),
      fingerprint: session.fingerprint,
      isolated: session.isolated,
      continueFirst: session.continueFirst,
      wantContinue: session.wantContinue,
      sessionReset: session.sessionReset,
      sessionMessages: session.sessionMessages,
      chatUuid: session.chatUuid,
      threadRollover: session.threadRollover,
      reuseChat: session.reuseChat,
      toolsFingerprint: session.toolsFingerprint,
      generated,
      text: generated.text,
      aiName: inferSyntxAiName(modelId),
      thinking: wantSyntxThinking(bodyObj, modelId),
      deepResearch: bodyObj.syntx_deep_research === true,
      files: [],
      generateBody: {},
      generateUrl: "",
      streamUrl: ""
    }
  };
}
function requestHasTools(bodyObj, messages) {
  return Array.isArray(bodyObj.tools) && bodyObj.tools.length > 0 || messagesHaveSyntxToolTraffic(messages);
}
function composeSyntxText(bodyObj, session) {
  const generated = buildSyntxGenerateText({
    messages: session.sessionMessages,
    tools: session.isolated || session.sessionReset ? undefined : bodyObj.tools,
    reuseChat: session.reuseChat,
    toolsAlreadyInjected: Boolean(session.reuseChat && session.priorToolsFp && !session.catalogChanged),
    threadRollover: session.threadRollover,
    omitClientSystem: session.omitClientSystem && !session.reuseChat
  });
  const passwordBlock = toStringOrEmpty(bodyObj.syntx_session_password_block);
  if (!passwordBlock || session.reuseChat)
    return generated;
  return {
    ...generated,
    text: capSyntxGenerateText(`${passwordBlock}

${generated.text}`.trim())
  };
}
function sessionIsolation(bodyObj) {
  const isolated = bodyObj.syntx_isolated === true || bodyObj.syntx_force_new_chat === true || bodyObj.syntx_deep_research === true;
  const continueFirst = canonicalizeSyntxUserText(toStringOrEmpty(bodyObj.syntx_continue_first_user));
  return {
    isolated,
    continueFirst,
    wantContinue: bodyObj.syntx_continue_chat === true && Boolean(continueFirst)
  };
}
function resolveSyntxSession(bodyObj, messages, token, modelId, connectionId) {
  const fingerprint = connectionFingerprint(token, connectionId);
  const { isolated, continueFirst, wantContinue } = sessionIsolation(bodyObj);
  const sessionReset = looksLikeClaudeCodeSessionReset(lastUserTextForReset(messages));
  const sessionMessages = sessionReset ? syntxMessagesForNewSession(messages) : messages;
  let chatUuid = lookupExistingChat({
    isolated,
    sessionReset,
    fingerprint,
    modelId,
    messages,
    wantContinue,
    continueFirst
  });
  const threadRollover = shouldOpenRollover(isolated, sessionReset, wantContinue, chatUuid);
  if (threadRollover)
    chatUuid = null;
  const posted = Boolean(chatUuid) && hasSyntxGeneratePosted(chatUuid);
  const virginChat = Boolean(chatUuid) && !posted && getSyntxChatGenerateCount(chatUuid) === 0;
  const reuseChat = Boolean(chatUuid) && !virginChat && !threadRollover;
  const toolsFingerprint = syntxToolCatalogFingerprint(bodyObj.tools);
  const priorToolsFp = chatUuid ? getSyntxInjectedToolsFingerprint(chatUuid) : null;
  const catalogChanged = Boolean(toolsFingerprint && priorToolsFp && priorToolsFp !== toolsFingerprint);
  const omitClientSystem = Boolean(toStringOrEmpty(bodyObj.syntx_account_system_prompt));
  return {
    fingerprint,
    isolated,
    continueFirst,
    wantContinue,
    sessionReset,
    sessionMessages,
    chatUuid,
    threadRollover,
    reuseChat,
    toolsFingerprint,
    priorToolsFp,
    catalogChanged,
    omitClientSystem
  };
}
function shouldOpenRollover(isolated, sessionReset, wantContinue, chatUuid) {
  return !isolated && !sessionReset && !wantContinue && Boolean(chatUuid) && shouldRolloverSyntxChat(chatUuid);
}
function lookupExistingChat(options) {
  if (options.isolated || options.sessionReset)
    return null;
  const existing = lookupSyntxChatUuidForMessages(options.fingerprint, options.modelId, options.messages);
  if (existing)
    return existing;
  if (options.wantContinue) {
    return lookupSyntxContinueChatUuid(options.fingerprint, options.modelId, options.continueFirst);
  }
  return null;
}
async function ensureSyntxChat(ctx) {
  try {
    if (!ctx.chatUuid) {
      const title = firstCanonicalSyntxUserText(ctx.sessionMessages) || lastUserText(ctx.sessionMessages) || (ctx.threadRollover ? "Continued SYNTX thread" : ctx.text);
      const create = () => createSyntxChat(ctx.token, title, ctx.fetchImpl);
      if (!ctx.isolated && !ctx.sessionReset) {
        await syncSyntxAccountSystemPrompt(ctx.token, ctx.bodyObj, ctx.fetchImpl);
        ctx.chatUuid = await coalesceSyntxChatCreate(hashSyntxConversation(ctx.fingerprint, ctx.modelId, ctx.sessionMessages), create);
      } else {
        ctx.chatUuid = await create();
      }
    }
    if (ctx.chatUuid && !ctx.isolated && !ctx.sessionReset) {
      rememberSyntxPendingRequest(ctx.fingerprint, ctx.modelId, ctx.sessionMessages, ctx.chatUuid);
    }
    return null;
  } catch (error) {
    return makeErrorResult(502, `SYNTX create chat failed: ${error instanceof Error ? error.message : "unknown"}`, ctx.body, SYNTX_CHATS_URL);
  }
}
async function uploadSyntxExecuteFiles(ctx) {
  const lastUser = lastUserMessage(ctx.sessionMessages) || lastUserMessage(ctx.messages);
  const imageSources = collectSyntxImageSources(lastUser?.content);
  for (const source of imageSources) {
    try {
      const url = await uploadSyntxImage(ctx.token, source, ctx.fetchImpl);
      if (url)
        ctx.files.push({ object_type: "image", object_url: url });
    } catch {}
  }
  return uploadHistoryFile(ctx);
}
async function uploadHistoryFile(ctx) {
  const historyFile = toStringOrEmpty(ctx.bodyObj.syntx_history_file);
  if (!historyFile)
    return null;
  try {
    const uploaded = await uploadSyntxBytes(ctx.token, {
      bytes: new TextEncoder().encode(historyFile),
      mime: "text/plain; charset=utf-8",
      name: toStringOrEmpty(ctx.bodyObj.syntx_history_filename) || "tmp.txt"
    }, ctx.fetchImpl);
    if (!uploaded) {
      return makeErrorResult(422, "SYNTX history file upload failed", ctx.body, SYNTX_UPLOAD_URL);
    }
    ctx.files.push({ object_type: uploaded.objectType || "file", object_url: uploaded.url });
    if (ctx.isolated || ctx.wantContinue) {
      const prompt = toStringOrEmpty(ctx.bodyObj.syntx_history_prompt) || SYNTX_FILE_COMPACT_PROMPT;
      ctx.text = prompt;
    }
    return null;
  } catch {
    return makeErrorResult(422, "SYNTX history file upload failed", ctx.body, SYNTX_UPLOAD_URL);
  }
}
async function postSyntxGenerate(ctx) {
  const emptyClientTools = Array.isArray(ctx.bodyObj.tools) && ctx.bodyObj.tools.length === 0;
  const nativeTools = !emptyClientTools && !(ctx.isolated && !ctx.deepResearch);
  ctx.generateBody = buildSyntxGenerateBody({
    chatUuid: ctx.chatUuid,
    text: ctx.text,
    model: ctx.modelId,
    thinking: ctx.thinking,
    deepResearch: ctx.deepResearch,
    nativeTools,
    files: ctx.files
  });
  ctx.generateUrl = `${SYNTX_GENERATE_PATH}?ai_name=${encodeURIComponent(ctx.aiName)}`;
  let generateResponse;
  try {
    generateResponse = await ctx.fetchImpl(ctx.generateUrl, {
      method: "POST",
      headers: {
        ...syntxAuthHeaders(ctx.token),
        "content-type": "application/json"
      },
      body: JSON.stringify(ctx.generateBody),
      signal: syntxFetchSignal(ctx.signal)
    });
  } catch (error) {
    return redactedGenerate(ctx, makeErrorResult(502, `SYNTX generate failed: ${error instanceof Error ? error.message : "unknown"}`, ctx.body, ctx.generateUrl));
  }
  if (!generateResponse.ok) {
    const errText = await generateResponse.text().catch(() => "");
    return redactedGenerate(ctx, makeErrorResult(generateResponse.status, `SYNTX error: ${sanitizeErrorMessage(errText)}`, ctx.body, ctx.generateUrl));
  }
  const job = asRecord(await generateResponse.json());
  ctx.streamUrl = toStringOrEmpty(job.stream_url);
  if (!isSyntxStreamUrl(ctx.streamUrl)) {
    return redactedGenerate(ctx, makeErrorResult(502, "SYNTX generate returned an invalid stream URL", ctx.body, ctx.generateUrl));
  }
  markSyntxGeneratePosted(ctx.chatUuid);
  return null;
}
function persistSyntxSession(ctx, assistantText) {
  if (ctx.isolated)
    return;
  forgetSyntxPendingExact(ctx.fingerprint, ctx.modelId, ctx.sessionMessages);
  noteSyntxGenerate(ctx.chatUuid);
  const rememberMsgs = ctx.wantContinue && ctx.continueFirst ? [{ role: "user", content: ctx.continueFirst }] : ctx.sessionMessages;
  rememberSyntxFollowUp(ctx.fingerprint, ctx.modelId, rememberMsgs, assistantText, ctx.chatUuid);
  if (ctx.generated.injectedCatalog) {
    rememberSyntxInjectedTools(ctx.chatUuid, ctx.toolsFingerprint || "injected");
  }
}
function openSyntxStream(ctx) {
  return ctx.fetchImpl(ctx.streamUrl, {
    method: "GET",
    headers: {
      accept: "text/event-stream",
      "cache-control": "no-cache",
      referer: SYNTX_SITE
    },
    signal: syntxFetchSignal(ctx.signal)
  });
}
function streamMeta(ctx) {
  return {
    id: `chatcmpl-syntx-${Date.now()}`,
    created: Math.floor(Date.now() / 1000),
    clientModel: toStringOrEmpty(ctx.bodyObj.model) || ctx.requestedModel
  };
}
function enqueueSse(controller, encoder, payload) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}

`));
}
async function pumpPlainSse(ctx, controller, encoder, meta, upstream) {
  const read = await readSyntxSse(upstream, (delta) => {
    enqueueSse(controller, encoder, openAiChunk(meta.id, meta.created, meta.clientModel, { content: delta }));
  });
  persistSyntxSession(ctx, read.text);
  enqueueSse(controller, encoder, openAiChunk(meta.id, meta.created, meta.clientModel, {}, "stop"));
}
async function pumpToolSse(ctx, controller, encoder, meta, upstream) {
  const read = await readSyntxSse(upstream, () => {
    return;
  });
  persistSyntxSession(ctx, read.text);
  const parsed = parseSyntxToolCalls(read.text);
  if (parsed.calls.length > 0) {
    enqueueSse(controller, encoder, openAiChunk(meta.id, meta.created, meta.clientModel, {
      tool_calls: parsed.calls.map((call, index) => ({ ...call, index }))
    }));
    enqueueSse(controller, encoder, openAiChunk(meta.id, meta.created, meta.clientModel, {}, "tool_calls"));
    return;
  }
  if (read.text) {
    enqueueSse(controller, encoder, openAiChunk(meta.id, meta.created, meta.clientModel, { content: read.text }));
  }
  enqueueSse(controller, encoder, openAiChunk(meta.id, meta.created, meta.clientModel, {}, "stop"));
}
function streamSyntxResponse(ctx) {
  const encoder = new TextEncoder;
  const meta = streamMeta(ctx);
  const stream = new ReadableStream({
    start: async (controller) => {
      await runSyntxStreamStart(ctx, controller, encoder, meta);
    }
  });
  return {
    response: new Response(stream, { headers: SSE_HEADERS }),
    url: ctx.generateUrl,
    headers: { authorization: "Bearer <redacted>" },
    transformedBody: ctx.generateBody
  };
}
async function runSyntxStreamStart(ctx, controller, encoder, meta) {
  enqueueSse(controller, encoder, openAiChunk(meta.id, meta.created, meta.clientModel, { role: "assistant" }));
  try {
    const upstream = await openSyntxStream(ctx);
    if (!upstream.ok) {
      controller.error(new Error(`SYNTX stream HTTP ${upstream.status}`));
      return;
    }
    if (!ctx.hasTools)
      await pumpPlainSse(ctx, controller, encoder, meta, upstream);
    else
      await pumpToolSse(ctx, controller, encoder, meta, upstream);
    controller.enqueue(encoder.encode(`data: [DONE]

`));
    controller.close();
  } catch (error) {
    closeSyntxStreamOnError(controller, ctx.signal, error);
  }
}
function closeSyntxStreamOnError(controller, signal, error) {
  if (!signal?.aborted) {
    controller.error(error instanceof Error ? error : new Error("SYNTX stream error"));
    return;
  }
  try {
    controller.close();
  } catch {}
}
async function jsonSyntxResponse(ctx) {
  let upstream;
  try {
    upstream = await openSyntxStream(ctx);
  } catch (error) {
    return redactedGenerate(ctx, makeErrorResult(502, `SYNTX stream failed: ${error instanceof Error ? error.message : "unknown"}`, ctx.body, ctx.streamUrl));
  }
  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    return redactedGenerate(ctx, makeErrorResult(upstream.status, `SYNTX stream error: ${sanitizeErrorMessage(errText)}`, ctx.body, ctx.streamUrl));
  }
  const read = await readSyntxSse(upstream, () => {
    return;
  });
  if (!read.ok) {
    return redactedGenerate(ctx, makeErrorResult(502, `SYNTX protocol error: ${sanitizeErrorMessage(read.errorMessage || "unknown")}`, ctx.body, ctx.streamUrl));
  }
  persistSyntxSession(ctx, read.text);
  return assembleJsonCompletion(ctx, read);
}
function assembleJsonCompletion(ctx, read) {
  const meta = streamMeta(ctx);
  const parsed = ctx.hasTools ? parseSyntxToolCalls(read.text) : { calls: [], content: read.text };
  return {
    response: new Response(JSON.stringify(openAiCompletion(meta.id, meta.created, meta.clientModel, parsed.calls.length > 0 ? parsed.content || null : read.text, parsed.calls.length > 0 ? parsed.calls : undefined, read.usage)), { headers: { "Content-Type": "application/json" } }),
    url: ctx.generateUrl,
    headers: { authorization: "Bearer <redacted>" },
    transformedBody: ctx.generateBody
  };
}
export async function runSyntxExecute(input) {
  const parsed = parseSyntxExecuteInput(input);
  if ("result" in parsed)
    return parsed.result;
  const ctx = parsed.ctx;
  const created = await ensureSyntxChat(ctx);
  if (created)
    return created;
  const uploaded = await uploadSyntxExecuteFiles(ctx);
  if (uploaded)
    return uploaded;
  if (!ctx.text) {
    return makeErrorResult(400, "SYNTX requires a non-empty user message", ctx.body, SYNTX_GENERATE_PATH);
  }
  const posted = await postSyntxGenerate(ctx);
  if (posted)
    return posted;
  if (ctx.wantStream)
    return streamSyntxResponse(ctx);
  return jsonSyntxResponse(ctx);
}
