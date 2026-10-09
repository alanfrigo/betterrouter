import { getAdapter } from "../driver.js";
import { parseJson, stringifyJson } from "../helpers/jsonCol.js";

// Read latest credentials/settings inside transaction: OAuth refresh or disabling
// sync during discovery must not be undone by a stale connection snapshot.
export async function updateModelSyncState(id, patch, { models = [], automatic = false, requireActive = false } = {}) {
  const db = await getAdapter();
  let result = null;
  db.transaction(() => {
    const row = db.get("SELECT data, isActive FROM providerConnections WHERE id = ?", [id]);
    if (!row) return;
    const data = parseJson(row.data, {});
    const specific = data.providerSpecificData || {};
    if (requireActive && (!row.isActive || (automatic && specific.autoSync !== true))) return;
    let added = 0;
    for (const model of models) {
      const key = `${model.providerAlias}|${model.id}|${model.type}`;
      // Existing manual entries retain name, capabilities and transport unchanged.
      if (db.get("SELECT 1 FROM kv WHERE scope = 'customModels' AND key = ?", [key])) continue;
      db.run("INSERT INTO kv(scope, key, value) VALUES('customModels', ?, ?)", [key, stringifyJson(model)]);
      added += 1;
    }
    const next = { ...specific, ...patch };
    db.run("UPDATE providerConnections SET data = ?, updatedAt = ? WHERE id = ?", [
      stringifyJson({ ...data, providerSpecificData: next }), new Date().toISOString(), id,
    ]);
    result = { ...next, added };
  });
  return result;
}
