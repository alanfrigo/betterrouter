import { createHash } from "node:crypto";
const SESSION_MAX_AGE_MS = 6 * 3600000;
const SESSION_PENDING_MAX_AGE_MS = 3 * 60000;
const SESSION_MAX_ENTRIES = 300;
export const SYNTX_CHAT_MESSAGE_LIMIT = 800;
export const SYNTX_CHAT_ROLLOVER_TURNS = 700;
const sessions = new Map;
const chatTools = new Map;
const chatGenerateCounts = new Map;
const postedGenerates = new Map;
const createLocks = new Map;
const PINNED_TASK_MARKERS = ["My current task: ", "Current request: "];
export function canonicalizeSyntxUserText(text) {
  let t = (text || "").trim();
  if (!t)
    return "";
  for (const marker of PINNED_TASK_MARKERS) {
    const idx = t.lastIndexOf(marker);
    if (idx >= 0) {
      t = t.slice(idx + marker.length).trim();
      break;
    }
  }
  return t.replace(/\s+/g, " ").trim();
}
function extractFromObject(content) {
  if (typeof content.text === "string" && content.text)
    return content.text;
  if (typeof content.content === "string" && content.content)
    return content.content;
  if (Array.isArray(content.content))
    return extractSyntxMessageText(content.content);
  if (Array.isArray(content.parts))
    return extractSyntxMessageText(content.parts);
  return "";
}
function extractFromPart(part) {
  if (typeof part === "string")
    return part;
  if (!part || typeof part !== "object")
    return "";
  const rec = part;
  const type = typeof rec.type === "string" ? rec.type.toLowerCase() : "";
  if (type === "tool_result" || type === "function_result") {
    return extractSyntxMessageText(rec.content) || extractSyntxMessageText(rec.output) || (typeof rec.content === "string" ? rec.content : "");
  }
  if (typeof rec.text === "string" && rec.text)
    return rec.text;
  if (typeof rec.content === "string" && rec.content)
    return rec.content;
  return "";
}
export function extractSyntxMessageText(content) {
  if (typeof content === "string")
    return content;
  if (content && typeof content === "object" && !Array.isArray(content)) {
    return extractFromObject(content);
  }
  if (!Array.isArray(content))
    return "";
  const parts = [];
  for (const part of content) {
    const text = extractFromPart(part);
    if (text)
      parts.push(text);
  }
  return parts.join(`
`);
}
export function conversationPrefixBeforeLastUser(messages) {
  if (!messages.length)
    return [];
  let lastUser = -1;
  for (let i = messages.length - 1;i >= 0; i--) {
    const role = (messages[i]?.role || "").toLowerCase();
    if (role === "user") {
      lastUser = i;
      break;
    }
  }
  if (lastUser <= 0)
    return [];
  return messages.slice(0, lastUser);
}
export function lastUserMessage(messages) {
  for (let i = messages.length - 1;i >= 0; i--) {
    if ((messages[i]?.role || "").toLowerCase() === "user")
      return messages[i];
  }
  return null;
}
export function hashSyntxConversation(fingerprint, model, messages) {
  const payload = messages.map((message) => {
    const role = (message.role || "").toLowerCase();
    let text = extractSyntxMessageText(message.content);
    if (role === "user" || role === "human")
      text = canonicalizeSyntxUserText(text);
    return `${role}:${text}`;
  }).join(`
`);
  return createHash("sha256").update(`${fingerprint}|${model}|${payload}`).digest("hex");
}
function readSession(key) {
  const entry = sessions.get(key);
  if (!entry)
    return null;
  const maxAge = entry.pending ? SESSION_PENDING_MAX_AGE_MS : SESSION_MAX_AGE_MS;
  if (Date.now() - entry.ts > maxAge) {
    sessions.delete(key);
    return null;
  }
  return entry.chatUuid;
}
export function lookupSyntxChatUuid(key) {
  return readSession(key);
}
export function syntxUserSpine(messages) {
  const spine = [];
  for (const message of messages) {
    const role = (message?.role || "").toLowerCase();
    if (role !== "user" && role !== "human")
      continue;
    spine.push({
      role: "user",
      content: canonicalizeSyntxUserText(extractSyntxMessageText(message.content))
    });
  }
  return spine;
}
export function firstCanonicalSyntxUserText(messages) {
  const spine = syntxUserSpine(messages);
  return typeof spine[0]?.content === "string" ? spine[0].content : "";
}
export function lastUserTextForReset(messages) {
  const last = lastUserMessage(messages);
  return last ? extractSyntxMessageText(last.content) : "";
}
export function looksLikeClaudeCodeSessionReset(text) {
  const t = (text || "").trim();
  if (!t)
    return false;
  if (/<command-name>\s*\/(?:new|clear)\s*<\/command-name>/i.test(t))
    return true;
  if (/<command-message>\s*(?:new|clear)\s*<\/command-message>/i.test(t))
    return true;
  if (t.includes("<local-command-caveat>") && /<\/command-name>/i.test(t) && /\/(?:new|clear)/i.test(t)) {
    return true;
  }
  return false;
}
export function stripClaudeCodeLocalCommandEnvelope(text) {
  let t = text || "";
  t = t.replace(/<local-command-caveat>[\s\S]*?<\/local-command-caveat>/gi, "");
  t = t.replace(/<command-name>[\s\S]*?<\/command-name>/gi, "");
  t = t.replace(/<command-message>[\s\S]*?<\/command-message>/gi, "");
  t = t.replace(/<command-args>[\s\S]*?<\/command-args>/gi, "");
  t = t.replace(/<local-command-stdout>[\s\S]*?<\/local-command-stdout>/gi, "");
  t = t.replace(/<local-command-stderr>[\s\S]*?<\/local-command-stderr>/gi, "");
  return t.replace(/[ \t]+\n/g, `
`).replace(/\n{3,}/g, `

`).trim();
}
function userHasToolResult(content) {
  if (!Array.isArray(content))
    return false;
  for (const part of content) {
    if (!part || typeof part !== "object")
      continue;
    const type = String(part.type || "").toLowerCase();
    if (type === "tool_result" || type === "function_result")
      return true;
  }
  return false;
}
export function isSyntxFollowUpHistory(messages) {
  for (const message of messages || []) {
    const role = (message?.role || "").toLowerCase();
    if (role === "assistant" || role === "model" || role === "tool" || role === "function")
      return true;
    if ((role === "user" || role === "human") && userHasToolResult(message.content))
      return true;
  }
  return false;
}
export function syntxMessagesForNewSession(messages) {
  const raw = lastUserTextForReset(messages);
  const stripped = stripClaudeCodeLocalCommandEnvelope(raw) || canonicalizeSyntxUserText(raw) || raw.trim();
  return [{ role: "user", content: stripped || "hi" }];
}
export function lookupSyntxChatUuidForMessages(fingerprint, model, messages) {
  if (looksLikeClaudeCodeSessionReset(lastUserTextForReset(messages)))
    return null;
  const exact = lookupSyntxChatUuid(hashSyntxConversation(fingerprint, model, messages));
  if (exact)
    return exact;
  if (!isSyntxFollowUpHistory(messages))
    return null;
  const prefix = conversationPrefixBeforeLastUser(messages);
  if (prefix.length > 0) {
    const hit = lookupSyntxChatUuid(hashSyntxConversation(fingerprint, model, prefix));
    if (hit)
      return hit;
  }
  const spine = syntxUserSpine(messages);
  if (spine.length > 0) {
    const hit = lookupSyntxChatUuid(hashSyntxConversation(fingerprint, model, spine));
    if (hit)
      return hit;
  }
  if (spine.length > 1) {
    const hit = lookupSyntxChatUuid(hashSyntxConversation(fingerprint, model, spine.slice(0, -1)));
    if (hit)
      return hit;
  }
  const firstUser = firstCanonicalSyntxUserText(messages);
  if (firstUser) {
    const hit = lookupSyntxChatUuid(hashSyntxConversation(fingerprint, model, [{ role: "user", content: firstUser }]));
    if (hit)
      return hit;
  }
  return null;
}
export function lookupSyntxContinueChatUuid(fingerprint, model, firstUserText) {
  const first = canonicalizeSyntxUserText(firstUserText);
  if (!first)
    return null;
  return lookupSyntxChatUuid(hashSyntxConversation(fingerprint, model, [{ role: "user", content: first }]));
}
export function rememberSyntxChatUuid(key, chatUuid, pending = false) {
  if (!key || !chatUuid)
    return;
  sessions.set(key, { chatUuid, ts: Date.now(), pending: pending || undefined });
  if (sessions.size <= SESSION_MAX_ENTRIES)
    return;
  let oldestKey = null;
  let oldestTs = 1 / 0;
  for (const [k, v] of sessions) {
    if (v.ts < oldestTs) {
      oldestTs = v.ts;
      oldestKey = k;
    }
  }
  if (oldestKey)
    sessions.delete(oldestKey);
}
export function rememberSyntxPendingRequest(fingerprint, model, messages, chatUuid) {
  if (!chatUuid || !messages?.length)
    return;
  rememberSyntxChatUuid(hashSyntxConversation(fingerprint, model, messages), chatUuid, true);
  const first = firstCanonicalSyntxUserText(messages);
  if (first) {
    rememberSyntxChatUuid(hashSyntxConversation(fingerprint, model, [{ role: "user", content: first }]), chatUuid, true);
  }
}
export function forgetSyntxPendingExact(fingerprint, model, messages) {
  const keys = [hashSyntxConversation(fingerprint, model, messages)];
  const first = firstCanonicalSyntxUserText(messages);
  if (first) {
    keys.push(hashSyntxConversation(fingerprint, model, [{ role: "user", content: first }]));
  }
  for (const key of keys) {
    const entry = sessions.get(key);
    if (entry?.pending)
      sessions.delete(key);
  }
}
export function markSyntxGeneratePosted(chatUuid) {
  if (!chatUuid)
    return;
  postedGenerates.set(chatUuid, { ts: Date.now() });
  if (postedGenerates.size <= SESSION_MAX_ENTRIES)
    return;
  let oldestKey = null;
  let oldestTs = 1 / 0;
  for (const [k, v] of postedGenerates) {
    if (v.ts < oldestTs) {
      oldestTs = v.ts;
      oldestKey = k;
    }
  }
  if (oldestKey)
    postedGenerates.delete(oldestKey);
}
export function hasSyntxGeneratePosted(chatUuid) {
  if (!chatUuid)
    return false;
  const entry = postedGenerates.get(chatUuid);
  if (!entry)
    return false;
  if (Date.now() - entry.ts > SESSION_MAX_AGE_MS) {
    postedGenerates.delete(chatUuid);
    return false;
  }
  return true;
}
export async function coalesceSyntxChatCreate(key, factory) {
  if (!key)
    return factory();
  const existing = lookupSyntxChatUuid(key);
  if (existing)
    return existing;
  const inflight = createLocks.get(key);
  if (inflight)
    return inflight;
  const pending = (async () => {
    try {
      const again = lookupSyntxChatUuid(key);
      if (again)
        return again;
      const uuid = await factory();
      if (uuid)
        rememberSyntxChatUuid(key, uuid, true);
      return uuid;
    } finally {
      createLocks.delete(key);
    }
  })();
  createLocks.set(key, pending);
  return pending;
}
export function rememberSyntxFollowUp(fingerprint, model, messages, assistantText, chatUuid) {
  const prefix = conversationPrefixBeforeLastUser(messages);
  if (prefix.length > 0) {
    rememberSyntxChatUuid(hashSyntxConversation(fingerprint, model, prefix), chatUuid);
  }
  const next = [
    ...messages.map((message) => ({
      role: message.role,
      content: extractSyntxMessageText(message.content)
    })),
    { role: "assistant", content: assistantText }
  ];
  rememberSyntxChatUuid(hashSyntxConversation(fingerprint, model, next), chatUuid);
  const spine = syntxUserSpine(messages);
  if (spine.length > 0) {
    rememberSyntxChatUuid(hashSyntxConversation(fingerprint, model, spine), chatUuid);
    rememberSyntxChatUuid(hashSyntxConversation(fingerprint, model, [spine[0]]), chatUuid);
  }
}
export function getSyntxInjectedToolsFingerprint(chatUuid) {
  if (!chatUuid)
    return null;
  const entry = chatTools.get(chatUuid);
  if (!entry)
    return null;
  if (Date.now() - entry.ts > SESSION_MAX_AGE_MS) {
    chatTools.delete(chatUuid);
    return null;
  }
  return entry.fingerprint;
}
function pruneGenerateCounts() {
  if (chatGenerateCounts.size <= SESSION_MAX_ENTRIES)
    return;
  let oldestKey = null;
  let oldestTs = 1 / 0;
  for (const [k, v] of chatGenerateCounts) {
    if (v.ts < oldestTs) {
      oldestTs = v.ts;
      oldestKey = k;
    }
  }
  if (oldestKey)
    chatGenerateCounts.delete(oldestKey);
}
export function noteSyntxGenerate(chatUuid) {
  if (!chatUuid)
    return 0;
  const prev = chatGenerateCounts.get(chatUuid);
  const next = { count: (prev?.count ?? 0) + 1, ts: Date.now() };
  chatGenerateCounts.set(chatUuid, next);
  pruneGenerateCounts();
  return next.count;
}
export function getSyntxChatGenerateCount(chatUuid) {
  if (!chatUuid)
    return 0;
  return chatGenerateCounts.get(chatUuid)?.count ?? 0;
}
export function shouldRolloverSyntxChat(chatUuid) {
  return getSyntxChatGenerateCount(chatUuid) >= SYNTX_CHAT_ROLLOVER_TURNS;
}
export function __setSyntxChatGenerateCountForTests(chatUuid, count) {
  if (!chatUuid)
    return;
  chatGenerateCounts.set(chatUuid, { count: Math.max(0, count), ts: Date.now() });
}
export function rememberSyntxInjectedTools(chatUuid, fingerprint) {
  if (!chatUuid || !fingerprint)
    return;
  chatTools.set(chatUuid, { fingerprint, ts: Date.now() });
  if (chatTools.size <= SESSION_MAX_ENTRIES)
    return;
  let oldestKey = null;
  let oldestTs = 1 / 0;
  for (const [k, v] of chatTools) {
    if (v.ts < oldestTs) {
      oldestTs = v.ts;
      oldestKey = k;
    }
  }
  if (oldestKey)
    chatTools.delete(oldestKey);
}
export function __resetSyntxSessionsForTests() {
  sessions.clear();
  chatTools.clear();
  chatGenerateCounts.clear();
  postedGenerates.clear();
  createLocks.clear();
}
