// Run from repo root: node tests/model-sync.self-check.mjs
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import "./register-aliases.mjs";
import { MODEL_SYNC_INTERVAL_MS, shouldSyncConnection, normalizeDiscoveredModels } from "../src/lib/providerModels/syncState.js";


const dir = await mkdtemp(join(tmpdir(), "betterrouter-model-sync-"));
process.env.DATA_DIR = dir;
const { createProviderConnection, getProviderConnectionById, updateProviderConnection, deleteProviderConnection } = await import("../src/lib/db/repos/connectionsRepo.js");
const { getCustomModels, addCustomModel } = await import("../src/lib/db/repos/aliasRepo.js");
const { updateModelSyncState } = await import("../src/lib/db/repos/modelSyncRepo.js");
const { getAdapter } = await import("../src/lib/db/driver.js");
const options = { providerId: "openai", providerAlias: "openai", curatedIds: ["curated"] };
try {
  const { discoverProviderModels } = await import("../src/lib/providerModels/discovery.js");
  const paths = [];
  const upstream = createServer((request, response) => {
    paths.push(request.url);
    if (request.url.startsWith("/authenticated/") && request.headers.authorization !== "Bearer optional-local-key") {
      response.writeHead(401);
      response.end();
      return;
    }
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ data: [{ id: "configured-local-model" }] }));
  });
  await new Promise((resolve) => upstream.listen(0, "127.0.0.1", resolve));
  try {
    const baseUrl = `http://127.0.0.1:${upstream.address().port}/custom/v1`;
    for (const provider of ["lm-studio", "llama-cpp", "lemonade"]) {
      const result = await discoverProviderModels({ provider, providerSpecificData: { baseUrl } });
      assert.equal(result.models[0].id, "configured-local-model");
    }
    assert.deepEqual(paths, ["/custom/v1/models", "/custom/v1/models", "/custom/v1/models"]);
    const authenticated = await discoverProviderModels({ provider: "lm-studio", apiKey: "optional-local-key", providerSpecificData: { baseUrl: `http://127.0.0.1:${upstream.address().port}/authenticated/v1` } });
    assert.equal(authenticated.models[0].id, "configured-local-model");
    assert.equal(paths.at(-1), "/authenticated/v1/models");
  } finally {
    upstream.closeAllConnections();
    await new Promise((resolve) => upstream.close(resolve));
  }
  const connection = await createProviderConnection({ provider: "openai", authType: "apikey", name: "Sync check", apiKey: "original", providerSpecificData: { autoSync: true } });
  assert.equal(shouldSyncConnection(connection, { automatic: true }), true);
  assert.equal(shouldSyncConnection({ ...connection, isActive: false }, { automatic: true }), false);
  assert.equal(shouldSyncConnection({ ...connection, providerSpecificData: { autoSync: false } }, { automatic: true }), false);
  const now = Date.now();
  assert.equal(shouldSyncConnection({ ...connection, providerSpecificData: { autoSync: true, modelSyncLastAttemptAt: new Date(now - MODEL_SYNC_INTERVAL_MS + 1).toISOString() } }, { automatic: true, now }), false);
  const models = normalizeDiscoveredModels({ models: [{ id: "curated" }, { id: "openai/new", name: "New" }, { id: "openai/new" }, { id: "bad\nid" }] }, options);
  assert.deepEqual(models, [{ providerAlias: "openai", id: "new", name: "New", type: "llm" }]);
  assert.deepEqual(normalizeDiscoveredModels({ models: [{ id: "curated" }] }, options), []);
  assert.equal(normalizeDiscoveredModels({ models: [{ id: "Stable Diffusion XL", type: "image" }] }, options)[0].id, "Stable Diffusion XL");
  for (const response of [{ models: [] }, { models: [{ id: "bad\nid" }] }, { error: "secret", models }, { source: "static", models }, { warning: "fallback", models }]) {
    assert.throws(() => normalizeDiscoveredModels(response, options));
  }
  await addCustomModel({ providerAlias: "openai", id: "manual", name: "Keep manual", caps: { tools: true } });
  const saved = await updateModelSyncState(connection.id, { modelSyncLastSuccessAt: new Date().toISOString() }, {
    automatic: true, requireActive: true, models: [...models, { providerAlias: "openai", id: "manual", type: "llm", name: "Overwrite attempt" }],
  });
  assert.equal(saved.added, 1);
  assert.equal((await getCustomModels()).find((m) => m.id === "manual").name, "Keep manual");
  await updateProviderConnection(connection.id, { apiKey: "rotated", providerSpecificData: { autoSync: false, otherSetting: "keep" } });
  assert.equal(await updateModelSyncState(connection.id, {}, { models: [{ providerAlias: "openai", id: "disabled", type: "llm" }], automatic: true, requireActive: true }), null);
  await updateModelSyncState(connection.id, { modelSyncError: "Model sync failed; previous catalog retained" });
  assert.equal((await getProviderConnectionById(connection.id)).apiKey, "rotated");
  assert.equal((await getProviderConnectionById(connection.id)).providerSpecificData.otherSetting, "keep");
  assert.equal((await getCustomModels()).some((m) => m.id === "disabled"), false);
  (await getAdapter()).close();
  global._dbAdapter.instance = null;
  global._dbAdapter.initPromise = null;
  assert.equal((await getCustomModels()).some((m) => m.id === "new"), true);
  assert.equal((await getCustomModels()).length, 2);
  await deleteProviderConnection(connection.id);
  assert.equal(await updateModelSyncState(connection.id, {}, { models: [{ providerAlias: "openai", id: "deleted", type: "llm" }], requireActive: true }), null);
  assert.equal((await getCustomModels()).some((m) => m.id === "deleted"), false);
  console.log("Model sync state, additive persistence, failure retention and restart checks passed");
} finally {
  (await getAdapter()).close();
  await rm(dir, { recursive: true, force: true });
}
