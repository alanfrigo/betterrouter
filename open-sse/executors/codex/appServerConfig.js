import { readFileSync } from "node:fs";
function firstString(...values) {
    for (const value of values) {
        if (typeof value === "string" && value.trim().length > 0)
            return value.trim();
    }
    return null;
}
function firstStringWithSource(psdValue, envValue) {
    if (typeof psdValue === "string" && psdValue.trim().length > 0) {
        return { value: psdValue.trim(), source: "psd" };
    }
    if (typeof envValue === "string" && envValue.trim().length > 0) {
        return { value: envValue.trim(), source: "env" };
    }
    return null;
}
/**
 * Read the capability token, preferring an inline token, then a token FILE path.
 * The token file (produced by `codex app-server --ws-token-file <path>`) holds the
 * same hex string that is presented as the bearer token. The source of the value
 * (psd vs env) is tracked for the credential/URL binding rule.
 */
function resolveTokenWithSource(psd) {
    const inlinePsd = firstString(psd?.codexAppServerToken);
    if (inlinePsd)
        return { value: inlinePsd, source: "psd" };
    const inlineEnv = firstString(process.env.OMNIROUTE_CODEX_APPSERVER_WS_TOKEN);
    if (inlineEnv)
        return { value: inlineEnv, source: "env" };
    const fileEnv = firstString(process.env.OMNIROUTE_CODEX_APPSERVER_WS_TOKEN_FILE);
    if (fileEnv) {
        const contents = readTokenFile(fileEnv);
        if (contents)
            return { value: contents, source: "env" };
    }
    return null;
}
function readTokenFile(tokenFile) {
    try {
        const contents = readFileSync(tokenFile, "utf8").trim();
        return contents.length > 0 ? contents : null;
    }
    catch {
        return null;
    }
}
function isWebSocketUrl(url) {
    return url.startsWith("ws://") || url.startsWith("wss://");
}
/** Operator tokens, including host-read files, require operator-pinned endpoint. */
export function resolveAppServerConfig(psd) {
    const urlRes = firstStringWithSource(psd?.codexAppServerUrl, process.env.OMNIROUTE_CODEX_APPSERVER_WS);
    if (!urlRes || !isWebSocketUrl(urlRes.value))
        return null;
    const tokenRes = resolveTokenWithSource(psd);
    if (!tokenRes)
        return null;
    if (tokenRes.source === "env") {
        const trustedUrl = firstString(process.env.OMNIROUTE_CODEX_APPSERVER_WS);
        if (!trustedUrl || new URL(urlRes.value).href !== new URL(trustedUrl).href) return null;
    }
    const url = urlRes.value;
    const token = tokenRes.value;
    const cwd = firstString(psd?.codexAppServerCwd, process.env.OMNIROUTE_CODEX_APPSERVER_CWD) ?? "/tmp";
    const approvalPolicy = firstString(psd?.codexAppServerApprovalPolicy, process.env.OMNIROUTE_CODEX_APPSERVER_APPROVAL) ??
        undefined;
    const sandbox = firstString(psd?.codexAppServerSandbox, process.env.OMNIROUTE_CODEX_APPSERVER_SANDBOX) ??
        undefined;
    return { url, token, cwd, ...(approvalPolicy ? { approvalPolicy } : {}), ...(sandbox ? { sandbox } : {}) };
}
/**
 * The turn/start policy triple for a resolved config (hardening after the
 * #11205 security review):
 * - approvalPolicy defaults to "never": codex must not block a router turn on
 *   its own interactive approval (unchanged).
 * - sandbox defaults to "workspace-write" (WAS "danger-full-access"): codex's
 *   own command/file execution is confined to the turn's cwd tree unless the
 *   operator explicitly widens it (providerSpecificData.codexAppServerSandbox /
 *   OMNIROUTE_CODEX_APPSERVER_SANDBOX). With "never" + a permissive sandbox,
 *   codex would run model-decided commands on the host with no gate at all.
 * - autoApprove defaults to false: server→client approval prompts are answered
 *   "denied" unless the operator opts in via
 *   providerSpecificData.codexAppServerAutoApprove ("true"/"1"/"yes") or
 *   OMNIROUTE_CODEX_APPSERVER_AUTO_APPROVE. Harness tool calls are unaffected —
 *   they travel the separate item/tool/call passthrough.
 */
export function resolveThreadStartPolicy(config, psd) {
    const raw = firstString(psd?.codexAppServerAutoApprove, process.env.OMNIROUTE_CODEX_APPSERVER_AUTO_APPROVE);
    const autoApprove = raw === "true" || raw === "1" || raw === "yes";
    return {
        approvalPolicy: config.approvalPolicy ?? "never",
        sandbox: config.sandbox ?? "workspace-write",
        autoApprove,
    };
}
