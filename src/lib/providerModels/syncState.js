export const MODEL_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;

export function shouldSyncConnection(connection, { automatic = false, now = Date.now() } = {}) {
  if (!connection || connection.isActive === false) return false;
  if (!automatic) return true;
  const data = connection.providerSpecificData || {};
  if (data.autoSync !== true) return false;
  const attempted = Date.parse(data.modelSyncLastAttemptAt || "");
  return !Number.isFinite(attempted) || now - attempted >= MODEL_SYNC_INTERVAL_MS;
}

// Add only: empty/error/static responses never erase curated, manual or cached models.
export function normalizeDiscoveredModels(result, { providerId, providerAlias, curatedIds = [] }) {
  if (result?.error || result?.warning || result?.source === "static" || !Array.isArray(result?.models)) {
    throw new Error("Live model discovery failed; previous catalog retained");
  }
  const seen = new Set(curatedIds);
  const models = [];
  const prefixes = new Set([providerId, providerAlias, "models"]);
  let usable = 0;
  for (const record of result.models) {
    const raw = typeof record === "string" ? record : record?.id || record?.model || record?.name;
    if (typeof raw !== "string") continue;
    let id = raw.trim();
    for (const prefix of prefixes) {
      if (id.startsWith(`${prefix}/`)) { id = id.slice(prefix.length + 1); break; }
    }
    if (!id || id.length > 512 || /[\x00-\x1f\x7f]/.test(id)) continue;
    usable += 1;
    if (seen.has(id)) continue;
    seen.add(id);
    const kind = record?.kind || record?.type;
    const type = ["llm", "embedding", "image", "tts", "stt", "video", "music", "imageToText", "webSearch", "webFetch"].includes(kind) ? kind : "llm";
    const label = record?.displayName || record?.display_name || record?.name;
    models.push({ providerAlias, id, type, name: typeof label === "string" ? label.slice(0, 512) : id });
  }
  // A fully curated response succeeds with zero additions; a malformed/empty one does not.
  if (!usable) throw new Error("No usable live models returned; previous catalog retained");
  return models;
}
