import { PROVIDERS } from "../../../open-sse/providers/index.js";
import { getExecutor } from "../../../open-sse/executors/index.js";
import { sanitizeErrorMessage } from "../../../open-sse/utils/errorSanitization.js";

// Use each provider's actual authenticated protocol, never a marketing-page HTTP 200.
// Providers lacking an auth-only probe perform one minimal chat turn (may consume quota).
export async function validateWebCookie({ provider, apiKey, providerSpecificData = {}, proxyOptions = null }) {
  const config = PROVIDERS[provider];
  if (config?.category !== "webCookie") return null;
  if (!(typeof apiKey === "string" && apiKey.trim()) && !(config.apiKeyOptionalWith && providerSpecificData[config.apiKeyOptionalWith])) return { valid: false, error: "Web session credential required" };
  const credentials = { apiKey, providerSpecificData };
  const executor = getExecutor(provider);
  const signal = AbortSignal.timeout(120000);
  try {
    if (provider === "chatgpt-web-codex") {
      const { decodeChatGptWebCodexSecrets } = await import("../../../open-sse/executors/chatgpt-web-codex/credentials.js");
      const { ensureConnectionStorageStateFromCredential } = await import("../../../open-sse/executors/chatgpt-web-codex/storageState.js");
      const { inspectBrowserLoginCapabilities } = await import("../../../open-sse/vendor/codex-chatgpt-web/browser-login.js");
      const { resolveChatGptWebChromeExecutable } = await import("../../../open-sse/utils/chatgptWebExecutorAdapter.js");
      const { assertLoopbackBrowserEndpoint } = await import("../../../open-sse/utils/browserEndpoint.js");
      const storageStatePath = ensureConnectionStorageStateFromCredential(`validation-${provider}`, decodeChatGptWebCodexSecrets(apiKey));
      const cdpEndpoint = providerSpecificData.browserCdpEndpoint || process.env.CHATGPT_WEB_CODEX_CDP_URL;
      assertLoopbackBrowserEndpoint(cdpEndpoint);
      const capabilities = await inspectBrowserLoginCapabilities({ storageStatePath, cdpEndpoint, chromeExecutablePath: resolveChatGptWebChromeExecutable(providerSpecificData.chromeExecutablePath) });
      return { valid: true, error: null, providerSpecificData: capabilities };
    }
    if (typeof executor.testConnection === "function") {
      const result = await executor.testConnection(credentials, signal);
      if (typeof result === "boolean") return { valid: result, error: result ? null : "Session credential invalid or expired" };
      return { ...result, valid: result.valid === true || result.success === true };
    }
    const model = config.models?.[0]?.id;
    if (!model) return { valid: false, unsupported: true, error: "Import provider models before validating this session" };
    const body = { model, messages: [{ role: "user", content: "Reply OK." }], stream: false, max_tokens: 8 };
    const result = await executor.execute({ model, body, stream: false, credentials, signal, proxyOptions, connectionId: `validation-${provider}` });
    const response = result.response;
    if (!response?.ok) {
      const data = await response?.json().catch(() => null);
      return { valid: false, error: sanitizeErrorMessage(data?.error?.message || `Session validation failed (${response?.status || 502})`) };
    }
    const data = await response.json();
    if (data?.error || !Array.isArray(data?.choices) || !data.choices.length) return { valid: false, error: "Provider returned no valid chat completion" };
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: sanitizeErrorMessage(error) };
  }
}
