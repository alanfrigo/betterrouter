import { bridgeToResponsesSSE, buildResponseJSON } from "./codex/appServerBridge.js";
import { AsyncEventQueue } from "../vendor/codex-chatgpt-web/event-queue.js";
import { sanitizeErrorMessage } from "./protocolSupport.js";
import { PROVIDERS } from "../config/providers.js";
import { BaseExecutor } from "./base.js";
import { CodexAppServerClient } from "./codex/appServerClient.js";
import { resolveAppServerConfig, resolveThreadStartPolicy, } from "./codex/appServerConfig.js";
import { translateNotification, translateToolCall, } from "./codex/appServerEvents.js";
import { splitCodexReasoningSuffix } from "./codex/reasoningSuffix.js";
import { appServerWebsocket } from "./codex/appServerTransport.js";
const JSON_HEADERS = { "Content-Type": "application/json" };
const SSE_HEADERS = {
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Content-Type": "text/event-stream; charset=utf-8",
};
/** Fresh app-server threads receive complete role and tool history, not text-only deltas. */
export function extractPromptText(body) {
    if (!body || typeof body !== "object") return "";
    const chunks = [];
    if (body.instructions != null) chunks.push(JSON.stringify({ role: "system", content: body.instructions }));
    const input = body.input ?? body.messages;
    const items = input == null ? [] : Array.isArray(input) ? input : [input];
    for (const item of items) {
        if (typeof item === "string") chunks.push(JSON.stringify({ role: "user", content: item }));
        else if (item && typeof item === "object") chunks.push(JSON.stringify(item));
    }
    return chunks.join("\n");
}
/** Optional reasoning effort carried on the Responses body (`reasoning.effort` or `reasoning_effort`). */
function extractEffort(body) {
    if (!body || typeof body !== "object")
        return undefined;
    const b = body;
    const reasoning = b.reasoning;
    if (reasoning && typeof reasoning === "object") {
        const effort = reasoning.effort;
        if (typeof effort === "string" && effort.length > 0)
            return effort;
    }
    if (typeof b.reasoning_effort === "string" && b.reasoning_effort.length > 0) {
        return b.reasoning_effort;
    }
    return undefined;
}
const EMPTY_OBJECT_SCHEMA = { type: "object", properties: {} };
const FREEFORM_INPUT_SCHEMA = {
    type: "object",
    properties: { input: { type: "string", description: "Raw tool input." } },
    required: ["input"],
};
function asRecord(v) {
    return v && typeof v === "object" && !Array.isArray(v) ? v : null;
}
/**
 * Build the bridge tool maps + the codex dynamicTools specs from the harness's
 * Responses `tools` array. This mirrors chatgpt-web-codex.ts:toolMaps() /
 * parser.ts:buildTools(): every harness tool is exposed to codex FLAT under its
 * wire name ("<namespace>__<name>" for MCP tools) so the round-trip is
 * namespace-preserving (codex echoes the call via item/tool/call; the bridge
 * restores {namespace, name} from `toolNsMap`). Custom (freeform) and tool_search
 * tools are tracked so the bridge relays them as custom_tool_call / tool_search_call.
 */
function buildAppServerToolMaps(body) {
    const namespace = new Map();
    const freeform = new Set();
    const toolSearch = new Set();
    const specs = [];
    const rec = asRecord(body);
    const tools = rec && Array.isArray(rec.tools) ? rec.tools : [];
    const pushFn = (name, description, inputSchema) => {
        specs.push({ type: "function", name, description, inputSchema });
    };
    for (const raw of tools) {
        const t = asRecord(raw);
        if (!t)
            continue;
        const type = t.type;
        const desc = typeof t.description === "string" ? t.description : "";
        if (type === "function" && typeof t.name === "string") {
            const wireName = t.name;
            pushFn(wireName, desc, asRecord(t.parameters) ?? EMPTY_OBJECT_SCHEMA);
        }
        else if (type === "namespace" && Array.isArray(t.tools) && typeof t.name === "string") {
            const ns = t.name;
            for (const innerRaw of t.tools) {
                const inner = asRecord(innerRaw);
                if (inner && inner.type === "function" && typeof inner.name === "string") {
                    const wireName = `${ns}__${inner.name}`;
                    namespace.set(wireName, { namespace: ns, name: inner.name });
                    const innerDesc = typeof inner.description === "string" ? inner.description : "";
                    pushFn(wireName, innerDesc, asRecord(inner.parameters) ?? EMPTY_OBJECT_SCHEMA);
                }
            }
        }
        else if (type === "custom" && typeof t.name === "string") {
            const wireName = t.name;
            freeform.add(wireName);
            pushFn(wireName, desc, FREEFORM_INPUT_SCHEMA);
        }
        else if (type === "tool_search") {
            const wireName = "tool_search";
            toolSearch.add(wireName);
            pushFn(wireName, desc || "Search for additional tools to load for the next turn.", asRecord(t.parameters) ?? {
                type: "object",
                properties: { query: { type: "string" }, limit: { type: "number" } },
                required: ["query"],
            });
        }
        else if (typeof t.name === "string" &&
            type !== "web_search" &&
            type !== "image_generation" &&
            type !== "web_search_preview") {
            // Any other named, client-executed tool → pass through as a function so the
            // routed model can call it; the bridge relays its call as a function_call.
            pushFn(t.name, desc, asRecord(t.parameters) ?? EMPTY_OBJECT_SCHEMA);
        }
        // web_search / image_generation are OpenAI-hosted server-side tools — not relayable.
    }
    return { namespace, freeform, toolSearch, specs };
}
/**
 * Executor for the Codex app-server WS transport. Drives one turn against a local
 * `codex app-server` over JSON-RPC and re-emits its notifications as OpenAI
 * Responses SSE via the shared bridge.
 *
 * Errors are delivered IN-BAND (an `error` AdapterEvent → `response.failed` SSE
 * frame for streaming, or an error field in the JSON body for non-streaming),
 * never thrown out of execute().
 */
export class CodexAppServerExecutor extends BaseExecutor {
    clientOptions;
    /**
     * @param clientOptions transport options (websocketFn, timeouts).
     * @param providerId which provider identity this executor reports as. Defaults
     *   to "codex" so the existing per-connection `codexTransport==="app-server"`
     *   flag path (routed through CodexExecutor for the `codex` provider) keeps its
     *   original identity. The first-class `codex-app-server` sibling passes
     *   "codex-app-server" so logs/quota scoping and the golden executor map reflect
     *   the real provider. Falls back to PROVIDERS.codex when the sibling registry
     *   entry is not present (defensive; both share the codex backend).
     */
    constructor(clientOptions = {}, providerId = "codex-app-server") {
        super(providerId, PROVIDERS[providerId] ?? PROVIDERS.codex);
        this.clientOptions = { websocketFn: appServerWebsocket, ...clientOptions };
    }
    async execute(input) {
        const psd = input.credentials?.providerSpecificData;
        const config = resolveAppServerConfig(psd);
        if (!config) {
            return { response: errorResponse(503, "Codex app-server transport is not configured (missing url or token)", "codex_app_server_unconfigured"), url: "codex-app-server://cli/websocket", headers: {}, transformedBody: input.body };
        }
        // Turn policy (hardened after the #11205 security review): approvalPolicy
        // "never", sandbox "workspace-write", autoApprove off unless the operator
        // opted in — see resolveThreadStartPolicy.
        const policy = resolveThreadStartPolicy(config, psd);
        const promptText = extractPromptText(input.body);
        const { baseModel, effort: suffixEffort } = splitCodexReasoningSuffix(input.model);
        const bodyEffort = extractEffort(input.body);
        // Explicit model suffix selection (e.g. gpt-5.5-high) represents an explicit
        // user/combo choice and overrides client-injected defaults in the request body (#2331, #14277).
        const effort = suffixEffort || bodyEffort;
        const toolMaps = buildAppServerToolMaps(input.body);
        const hasTools = toolMaps.specs.length > 0;
        const events = new AsyncEventQueue();
        const client = new CodexAppServerClient({
            ...this.clientOptions,
            autoApproveApprovals: policy.autoApprove,
        });
        const run = async () => {
            let terminated = false;
            // Resolves when the turn reaches a terminal state (turn/completed, error,
            // or an item/tool/call passthrough). `turn/start` resolving only means the
            // turn was ACCEPTED (status: inProgress) — the model's output arrives later
            // as notifications. run() MUST await this before the finally-block closes
            // the client, otherwise the socket is torn down mid-turn and the event
            // queue never receives its terminal event (the request then hangs until the
            // caller's timeout). See translateNotification: it returns true on the
            // terminal notification, which is where we settle this.
            let settleTurn;
            const turnDone = new Promise((resolve) => {
                settleTurn = resolve;
            });
            const turnTimer = setTimeout(() => {
                if (terminated) return;
                events.push({ type: "error", status: 504, message: "Codex app-server turn timed out", code: "codex_app_server_timeout" });
                events.close();
                markTerminated();
                client.close();
            }, 120000);
            const markTerminated = () => {
                if (terminated)
                    return;
                terminated = true;
                settleTurn();
            };
            const finishTurn = () => {
                if (terminated)
                    return;
                events.push({ type: "done", endTurn: true });
                events.close();
                markTerminated();
            };
            try {
                await client.connect(config.url, config.token);
                await client.request("initialize", {
                    clientInfo: {
                        name: "omniroute-codex-app-server",
                        title: null,
                        version: "1.0",
                    },
                    // Harness function tools are advertised via thread/start's `dynamicTools`,
                    // which is an EXPERIMENTAL app-server field: opt into experimental API so
                    // codex accepts it (and can emit the item/tool/call ServerRequest).
                    capabilities: hasTools ? { experimentalApi: true, requestAttestation: false } : null,
                });
                const threadResult = (await client.request("thread/start", {
                    cwd: config.cwd,
                    // OmniRoute is a router: the HARNESS that consumes OmniRoute owns tool
                    // execution and policy. codex must therefore NEVER block a turn waiting
                    // on its own interactive approval (approvalPolicy "never"). Its own
                    // sandbox defaults to "workspace-write" (hardened after the #11205
                    // security review; WAS "danger-full-access") so codex-decided host
                    // commands are confined to the turn's cwd tree — widen only via an
                    // explicit operator override. Server→client approval prompts (codex's
                    // own command/file/permission requests, NOT the harness tool
                    // passthrough) are auto-DENIED by the client unless the operator opted
                    // into auto-approval (see CodexAppServerClient).
                    approvalPolicy: policy.approvalPolicy,
                    sandbox: policy.sandbox,
                    // INBOUND harness tools → codex. The client tells the app-server which
                    // function tools are available for the thread via the `dynamicTools`
                    // field on thread/start (a DynamicToolSpec[] under the experimental API,
                    // verified from the real codex binary; see appServerEvents.ts). codex
                    // then invokes them by sending the `item/tool/call` ServerRequest back
                    // to the client (DynamicToolCallParams), which we PASS THROUGH.
                    ...(hasTools ? { dynamicTools: toolMaps.specs } : {}),
                }));
                // The live app-server (codex 0.149.0) returns the thread under
                // result.thread.id — NOT a top-level threadId (verified against the real
                // binary 2026-08-22). Keep the top-level fallback for forward/back compat.
                const threadId = threadResult && typeof threadResult.thread?.id === "string"
                    ? threadResult.thread.id
                    : threadResult && typeof threadResult.threadId === "string"
                        ? threadResult.threadId
                        : "";
                client.onNotification((method, params) => {
                    if (terminated)
                        return;
                    const isTerminal = translateNotification(method, params, (event) => events.push(event));
                    if (isTerminal) {
                        events.close();
                        markTerminated();
                    }
                });
                // OUTBOUND codex tool call → harness. codex asks us to execute a harness
                // tool via the `item/tool/call` ServerRequest. OmniRoute is a STATELESS
                // ROUTER and CANNOT execute the harness's tool (the tool body lives in the
                // harness downstream). So we PASS IT THROUGH: emit tool_call_* AdapterEvents
                // (the bridge renders a Responses function_call / custom_tool_call /
                // tool_search_call), settle the app-server request with a benign
                // DynamicToolCallResponse so codex does not hang, and COMPLETE the turn.
                // The harness runs the tool and replays the result in a fresh /v1/responses
                // request (the stateless-full-history contract every OmniRoute provider uses).
                client.onToolCall((_id, params, api) => {
                    if (terminated)
                        return;
                    const toolParams = (params && typeof params === "object" ? params : {});
                    translateToolCall(toolParams, (event) => events.push(event));
                    // Settle the app-server request so the socket does not stall. The router
                    // does not have the tool output (the harness will produce it next turn),
                    // so we report the passthrough as an unsuccessful in-line result and end
                    // the turn — the function_call has already been surfaced to the harness.
                    api.respond({
                        contentItems: [
                            {
                                type: "inputText",
                                text: "router: tool executed by harness; call surfaced as function_call",
                            },
                        ],
                        success: false,
                    });
                    finishTurn();
                });
                const onAbort = () => {
                    try {
                        client.notify("turn/interrupt", { threadId, turnId: "" });
                    }
                    catch {
                        /* interrupt best-effort */
                    }
                    // Unblock run() so the finally-block can tear down the client. Without
                    // this, an aborted request would wait on turnDone until the terminal
                    // notification that will never come.
                    if (!terminated) {
                        events.close();
                        markTerminated();
                    }
                };
                input.signal?.addEventListener("abort", onAbort, { once: true });
                const turnInput = [
                    { type: "text", text: promptText, text_elements: [] },
                ];
                await client.request("turn/start", {
                    threadId,
                    input: turnInput,
                    model: baseModel,
                    ...(effort ? { effort } : {}),
                });
                // `turn/start` resolving only ACCEPTS the turn (status: inProgress). The
                // model's output (agentMessage deltas) and the terminal turn/completed
                // arrive AFTER, as notifications. Wait for the terminal signal before
                // falling through to the finally-block — otherwise client.close() tears
                // down the socket mid-turn and the queue never closes (request hangs).
                await turnDone;
            }
            catch (err) {
                if (!terminated) {
                    events.push({
                        type: "error",
                        message: sanitizeErrorMessage(err instanceof Error ? err.message : err),
                        status: 502,
                        errorType: "provider_error",
                        code: "codex_app_server_turn_failed",
                    });
                    events.close();
                    markTerminated();
                }
            }
            finally {
                client.close();
                clearTimeout(turnTimer);
            }
        };
        if (!input.stream) {
            const running = run();
            const collected = await events.collect();
            await running;
            const response = buildResponseJSON(collected, input.model, {
                toolNsMap: toolMaps.namespace,
                freeformToolNames: toolMaps.freeform,
                toolSearchToolNames: toolMaps.toolSearch,
            });
            return {
                response: new Response(JSON.stringify(response), { status: 200, headers: JSON_HEADERS }),
                url: config.url,
                headers: {},
                transformedBody: input.body,
            };
        }
        void run();
        const stream = bridgeToResponsesSSE(events, input.model, toolMaps.namespace, toolMaps.freeform, toolMaps.toolSearch, () => client.close(), 2_000);
        return {
            response: new Response(stream, { status: 200, headers: SSE_HEADERS }),
            url: config.url,
            headers: {},
            transformedBody: input.body,
        };
    }
}
function errorResponse(status, message, code) {
    return new Response(JSON.stringify({
        error: {
            code,
            message: sanitizeErrorMessage(message),
            type: status >= 500 ? "provider_error" : "invalid_request_error",
        },
    }), { status, headers: JSON_HEADERS });
}
