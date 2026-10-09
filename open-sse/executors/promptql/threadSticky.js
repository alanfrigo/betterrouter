import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { extractMessageTextFromMessage, isUserLikeRole } from "./messageText.js";
function readStr(v) {
  if (typeof v !== "string")
    return "";
  const t = v.trim();
  return t.length ? t : "";
}
const memoryThreads = new Map;
const THREAD_CACHE_MAX = 200;
function threadCachePath() {
  const dataDir = process.env.DATA_DIR || process.env.DATA_DIR;
  if (!dataDir)
    return null;
  return join(dataDir, "promptql-thread-sessions.json");
}
function loadThreadDisk() {
  const p = threadCachePath();
  if (!p || !existsSync(p))
    return {};
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return {};
  }
}
function saveThreadDisk(map) {
  const p = threadCachePath();
  if (!p)
    return;
  try {
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, JSON.stringify(map), "utf8");
  } catch {}
}
function isFingerprintRole(role) {
  const r = (role || "").toLowerCase();
  if (!r || r === "system" || r === "developer")
    return false;
  return true;
}
export function normalizeForFingerprint(text) {
  let t = (text || "").replace(/\r\n/g, `
`);
  t = t.replace(/<agent_mention\s*\/>/gi, "");
  t = t.replace(/<\/?agent_mention>/gi, "");
  t = t.replace(/^@\S+\s+/gm, "");
  t = t.replace(/^[\s\S]*?\bUser request:\s*/i, "");
  t = t.replace(/^[\s\S]*?\bHere is my request:\s*/i, "");
  t = t.replace(/^[\s\S]*?\bCurrent request:\s*/i, "");
  t = t.replace(/^[\s\S]*?\bMy current task:\s*/i, "");
  t = t.replace(/^Here is data returned by my desktop application[\s\S]*?(?:\n\n|$)/i, "");
  t = t.replace(/^Here is the output from my local tool[\s\S]*?(?:\n\n|$)/i, "");
  t = t.replace(/\n\nBased on this result[\s\S]*$/i, "");
  t = t.replace(/\n\n(?:Please |If a structured)[\s\S]*$/i, "");
  if (/interoperability layer between PromptQL/i.test(t)) {
    const m = t.match(/\bCurrent request:\s*([\s\S]+)$/i);
    if (m)
      t = m[1];
  }
  t = t.replace(/[ \t]+\n/g, `
`).replace(/\n{3,}/g, `

`);
  return t.trim().slice(0, 2000);
}
export function extractToolNameSignature(text) {
  if (!text)
    return "";
  const names = new Set;
  for (const m of text.matchAll(/"tool"\s*:\s*"([^"]+)"/g))
    names.add(m[1].toLowerCase());
  for (const m of text.matchAll(/tool_call:([A-Za-z0-9_.-]+):/g))
    names.add(m[1].toLowerCase());
  for (const m of text.matchAll(/function_call:([A-Za-z0-9_.-]+):/g))
    names.add(m[1].toLowerCase());
  for (const m of text.matchAll(/\[tool result for\s+([^\]]+)\]/gi)) {
    names.add(m[1].trim().toLowerCase());
  }
  return [...names].sort().join(",");
}
export function conversationFingerprint(projectId, messages) {
  const parts = [`project:${projectId}`];
  for (const m of messages) {
    const roleRaw = (m?.role || "").toLowerCase();
    if (!isFingerprintRole(roleRaw))
      continue;
    const role = roleRaw === "tool" || roleRaw === "function" || roleRaw === "human" ? "user" : roleRaw;
    const text = normalizeForFingerprint(extractMessageTextFromMessage(m));
    if (!text)
      continue;
    parts.push(`${role}:${text}`);
  }
  const h = createHash("sha256").update(parts.join(`
`)).digest("hex").slice(0, 32);
  return `pql:${projectId}:${h}`;
}
export function lastAssistantStickyKeys(projectId, messages) {
  const keys = [];
  const seen = new Set;
  const push = (k) => {
    if (!k || seen.has(k))
      return;
    seen.add(k);
    keys.push(k);
  };
  for (let i = messages.length - 1;i >= 0; i--) {
    const role = (messages[i]?.role || "").toLowerCase();
    if (role !== "assistant" && role !== "ai" && role !== "model")
      continue;
    const raw = extractMessageTextFromMessage(messages[i]);
    const text = normalizeForFingerprint(raw);
    if (text) {
      const h = createHash("sha256").update(text).digest("hex").slice(0, 24);
      push(`pql:${projectId}:asst:${h}`);
    }
    const tools = extractToolNameSignature(raw);
    if (tools) {
      const h = createHash("sha256").update(tools).digest("hex").slice(0, 16);
      push(`pql:${projectId}:tools:${h}`);
    }
    break;
  }
  return keys;
}
export function lastAssistantFingerprint(projectId, messages) {
  return lastAssistantStickyKeys(projectId, messages)[0] ?? null;
}
export function historyPrefixBeforeLastUser(messages) {
  let lastUser = -1;
  for (let i = messages.length - 1;i >= 0; i--) {
    if (isUserLikeRole(messages[i]?.role || "")) {
      lastUser = i;
      break;
    }
  }
  if (lastUser <= 0)
    return [];
  return messages.slice(0, lastUser);
}
export function hasAssistantMessage(messages) {
  return messages.some((m) => {
    const r = (m?.role || "").toLowerCase();
    if (r === "assistant" || r === "ai" || r === "model")
      return true;
    return false;
  });
}
function getThreadBinding(key) {
  if (!key)
    return null;
  const mem = memoryThreads.get(key);
  if (mem)
    return mem;
  const disk = loadThreadDisk()[key];
  if (disk) {
    memoryThreads.set(key, disk);
    return disk;
  }
  return null;
}
function setThreadBinding(key, binding) {
  if (!key)
    return;
  memoryThreads.set(key, binding);
  const disk = loadThreadDisk();
  disk[key] = binding;
  const keys = Object.keys(disk);
  if (keys.length > THREAD_CACHE_MAX) {
    keys.sort((a, b) => (disk[a].updatedAt || 0) - (disk[b].updatedAt || 0)).slice(0, keys.length - THREAD_CACHE_MAX).forEach((k) => {
      delete disk[k];
      memoryThreads.delete(k);
    });
  }
  saveThreadDisk(disk);
}
export function clearPromptQlThreadBindingsForTests(opts) {
  memoryThreads.clear();
  if (opts?.disk) {
    const p = threadCachePath();
    if (p && existsSync(p)) {
      try {
        writeFileSync(p, "{}", "utf8");
      } catch {}
    }
  }
}
export function readClientThreadId(body, headers) {
  const fromBody = readStr(body.promptql_thread_id) || readStr(body.thread_id);
  if (fromBody)
    return fromBody;
  if (!headers)
    return "";
  const lower = {};
  for (const [k, v] of Object.entries(headers))
    lower[k.toLowerCase()] = String(v ?? "");
  return readStr(lower["x-promptql-thread-id"]) || readStr(lower["x-thread-id"]) || readStr(lower["x-conversation-id"]) || "";
}
export function resolvePromptQlThreadBinding(projectId, messages, clientThreadId) {
  const clientId = (clientThreadId || "").trim();
  const prefix = historyPrefixBeforeLastUser(messages);
  const prefixKey = prefix.length > 0 && hasAssistantMessage(prefix) ? conversationFingerprint(projectId, prefix) : null;
  if (clientId) {
    return { threadId: clientId, isFollowUp: true, prefixKey };
  }
  if (prefixKey) {
    const cached = getThreadBinding(prefixKey);
    if (cached?.threadId && cached.projectId === projectId) {
      return { threadId: cached.threadId, isFollowUp: true, prefixKey };
    }
  }
  if (hasAssistantMessage(messages)) {
    const scope = prefix.length ? prefix : messages;
    for (const asstKey of lastAssistantStickyKeys(projectId, scope)) {
      const cached = getThreadBinding(asstKey);
      if (cached?.threadId && cached.projectId === projectId) {
        return { threadId: cached.threadId, isFollowUp: true, prefixKey: asstKey };
      }
    }
    if (scope !== messages) {
      for (const asstKey of lastAssistantStickyKeys(projectId, messages)) {
        const cached = getThreadBinding(asstKey);
        if (cached?.threadId && cached.projectId === projectId) {
          return { threadId: cached.threadId, isFollowUp: true, prefixKey: asstKey };
        }
      }
    }
  }
  return { threadId: "", isFollowUp: false, prefixKey: null };
}
export function storePromptQlThreadAfterTurn(projectId, messages, assistantText, threadId) {
  if (!projectId || !threadId)
    return null;
  const full = [
    ...messages,
    { role: "assistant", content: assistantText || "" }
  ];
  if (!hasAssistantMessage(full) || !messages.some((m) => isUserLikeRole(m.role || ""))) {
    return null;
  }
  const key = conversationFingerprint(projectId, full);
  const binding = { threadId, projectId, updatedAt: Date.now() };
  setThreadBinding(key, binding);
  const prefix = historyPrefixBeforeLastUser(messages);
  if (prefix.length > 0 && hasAssistantMessage(prefix)) {
    setThreadBinding(conversationFingerprint(projectId, prefix), binding);
  }
  for (const asstKey of lastAssistantStickyKeys(projectId, full)) {
    setThreadBinding(asstKey, binding);
  }
  return key;
}
