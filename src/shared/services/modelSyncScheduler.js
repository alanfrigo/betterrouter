import { getProviderConnectionById, getProviderConnections } from "@/lib/db/index.js";
import { updateModelSyncState } from "@/lib/db/repos/modelSyncRepo.js";
import { getProviderAlias, isOpenAICompatibleProvider, isAnthropicCompatibleProvider } from "@/shared/constants/providers";
import { getModelsByProviderId } from "open-sse/config/providerModels.js";
import { discoverProviderModels } from "@/lib/providerModels/discovery.js";
import { MODEL_SYNC_INTERVAL_MS, shouldSyncConnection, normalizeDiscoveredModels } from "@/lib/providerModels/syncState.js";

const state = globalThis.__betterRouterModelSync ||= { inflight: new Map(), timer: null, running: false };

export function syncProviderModels(id, { automatic = false } = {}) {
  if (state.inflight.has(id)) return state.inflight.get(id);
  const pending = (async () => {
    const connection = await getProviderConnectionById(id);
    if (!connection) return { error: "Connection not found", status: 404 };
    if (!shouldSyncConnection(connection, { automatic })) return { skipped: true, reason: "disabled-or-not-due" };
    const attempt = await updateModelSyncState(id, { modelSyncLastAttemptAt: new Date().toISOString() }, { automatic, requireActive: true });
    if (!attempt) return { skipped: true, reason: "disabled-before-discovery" };
    try {
      const result = await discoverProviderModels(connection);
      const compatible = isOpenAICompatibleProvider(connection.provider) || isAnthropicCompatibleProvider(connection.provider);
      const providerAlias = compatible ? connection.provider : getProviderAlias(connection.provider) || connection.provider;
      const models = normalizeDiscoveredModels(result, {
        providerId: connection.provider, providerAlias,
        curatedIds: getModelsByProviderId(connection.provider).map((model) => model.id),
      });
      const saved = await updateModelSyncState(id, {
        modelSyncLastSuccessAt: new Date().toISOString(), modelSyncError: null,
        modelSyncModelCount: result.models.length,
      }, { models, automatic, requireActive: true });
      if (!saved) return { skipped: true, reason: "disabled-during-discovery" };
      return { added: saved.added, modelCount: saved.modelSyncModelCount, lastSuccessAt: saved.modelSyncLastSuccessAt };
    } catch {
      // Never persist upstream error bodies, URLs, API keys or token-bearing messages.
      const error = "Model sync failed; previous catalog retained";
      await updateModelSyncState(id, { modelSyncError: error });
      return { error, status: 502 };
    }
  })().finally(() => state.inflight.delete(id));
  state.inflight.set(id, pending);
  return pending;
}

export async function runModelSyncCycle() {
  if (state.running) return;
  state.running = true;
  try {
    for (const connection of await getProviderConnections({ isActive: true })) {
      if (shouldSyncConnection(connection, { automatic: true })) {
        await syncProviderModels(connection.id, { automatic: true });
      }
    }
  } catch {
    console.warn("[ModelSync] Could not load provider connections");
  } finally {
    state.running = false;
  }
}

export function startProviderModelSync() {
  if (state.timer) return;
  // Poll inexpensive persisted due times so enabling/reactivating joins promptly.
  state.timer = setInterval(() => { void runModelSyncCycle(); }, 60000);
  state.timer.unref?.();
  void runModelSyncCycle();
}

export { MODEL_SYNC_INTERVAL_MS };
