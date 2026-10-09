import assert from "node:assert/strict";
import "./register-aliases.mjs";
const { CodexAppServerClient } = await import("../open-sse/executors/codex/appServerClient.js");
const { translateNotification, translateToolCall } = await import("../open-sse/executors/codex/appServerEvents.js");
const { buildResponseJSON } = await import("../open-sse/executors/codex/appServerBridge.js");
const { buildPrompt } = await import("../open-sse/executors/gitlab.js");
const { resolveAppServerConfig } = await import("../open-sse/executors/codex/appServerConfig.js");
const { extractPromptText, CodexAppServerExecutor } = await import("../open-sse/executors/codex-app-server.js");
const { gitlabDuo } = await import("../src/lib/oauth/providers/gitlab-duo.js");
const { mkdtempSync, writeFileSync, rmSync } = await import("node:fs");
const { tmpdir } = await import("node:os");
const { join } = await import("node:path");
const { buildDevinCliEnv } = await import("../open-sse/executors/devin-cli.js");
const { UpstreamProxyExecutor } = await import("../open-sse/executors/upstream-proxy.js");
const { createServer } = await import("node:http");

const envKeys = ["OMNIROUTE_CODEX_APPSERVER_WS", "OMNIROUTE_CODEX_APPSERVER_WS_TOKEN", "OMNIROUTE_CODEX_APPSERVER_WS_TOKEN_FILE"];
const priorEnv = envKeys.map(key => process.env[key]);
const fixtureDir = mkdtempSync(join(tmpdir(), "app-server-secret-"));
const fixtureFile = join(fixtureDir, "token");
writeFileSync(fixtureFile, "operator-file-secret");
try {
  envKeys.forEach(key => delete process.env[key]);
  assert.equal(resolveAppServerConfig({ codexAppServerUrl: "wss://attacker.example/", codexAppServerTokenFile: fixtureFile }), null);
  process.env.OMNIROUTE_CODEX_APPSERVER_WS = "ws://127.0.0.1:4500/trusted";
  process.env.OMNIROUTE_CODEX_APPSERVER_WS_TOKEN_FILE = fixtureFile;
  assert.equal(resolveAppServerConfig({ codexAppServerUrl: "ws://127.0.0.1:4501/attacker" }), null);
  assert.equal(resolveAppServerConfig({ codexAppServerUrl: "wss://attacker.example/" }), null);
  assert.equal(resolveAppServerConfig({}).token, "operator-file-secret");
} finally {
  envKeys.forEach((key, index) => { if (priorEnv[index] === undefined) delete process.env[key]; else process.env[key] = priorEnv[index]; });
  rmSync(fixtureDir, { recursive: true });
}
const operatorConfig = { ...gitlabDuo.config, baseUrl: "https://trusted.gitlab.example", clientSecret: "operator-client-secret" };
assert.equal(gitlabDuo.prepareConfig(operatorConfig, { baseUrl: "https://attacker.example" }).clientSecret, "");
assert.equal(gitlabDuo.prepareConfig(operatorConfig, { baseUrl: "https://trusted.gitlab.example" }).clientSecret, "operator-client-secret");
assert.equal(gitlabDuo.prepareConfig(operatorConfig, { baseUrl: "https://attacker.example", clientSecret: "explicit-custom-secret" }).clientSecret, "explicit-custom-secret");
const history = extractPromptText({ instructions: "Keep system policy", input: [{ role: "developer", content: "Developer rules" }, { type: "function_call", call_id: "read1", name: "read", arguments: '{"path":"file"}' }, { type: "function_call_output", call_id: "read1", output: "Important tool result" }] }).split("\n").map(JSON.parse);
assert.deepEqual(history[0], { role: "system", content: "Keep system policy" });
assert.equal(history[1].role, "developer");
assert.equal(history[2].arguments, '{"path":"file"}');
assert.equal(history[3].output, "Important tool result");
assert.equal(history[3].call_id, history[2].call_id);

assert.deepEqual(buildDevinCliEnv({ apiKey: "noauth" }, { PATH: "/operator/bin" }), { PATH: "/operator/bin" });
assert.equal(buildDevinCliEnv({ apiKey: "noauth" }, { WINDSURF_API_KEY: "operator-token" }).WINDSURF_API_KEY, "operator-token");
assert.equal(buildDevinCliEnv({ accessToken: "explicit-token" }, {}).WINDSURF_API_KEY, "explicit-token");
const requests = [];
const server = createServer((request, response) => {
  let body = "";
  request.on("data", chunk => { body += chunk; });
  request.on("end", () => { requests.push({ path: request.url, body: JSON.parse(body) }); response.setHeader("Content-Type", "application/json"); response.end('{"ok":true}'); });
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
try {
  const executor = new UpstreamProxyExecutor();
  const credentials = { apiKey: "test-token", providerSpecificData: { baseUrl: `http://127.0.0.1:${server.address().port}` } };
  const chatBody = { messages: [{ role: "user", content: "hi" }], thinking: { type: "enabled" }, metadata: { user_id: "user" } };
  const chat = await executor.execute({ model: "model", body: chatBody, stream: false, credentials, wireFormat: "openai" });
  await chat.response.text();
  const responses = await executor.execute({ model: "model", body: { input: "hi" }, stream: false, credentials, wireFormat: "openai-responses" });
  await responses.response.text();
  const claude = await executor.execute({ model: "model", body: { messages: [{ role: "user", content: "hi" }] }, stream: false, credentials, wireFormat: "claude" });
  await claude.response.text();
  assert.deepEqual(requests.map(request => request.path), ["/v1/chat/completions", "/v1/responses", "/v1/messages"]);
  assert.equal(requests[0].body.thinking.type, "enabled");
  assert.equal(responses.responseFormat, "openai-responses");
} finally { await new Promise(resolve => server.close(resolve)); }
const closedSocket = { close() {}, onmessage: null, onerror: null, onclose: null, send(text) {
  const request = JSON.parse(text);
  queueMicrotask(() => {
    closedSocket.onmessage({ data: JSON.stringify({ jsonrpc: "2.0", id: request.id, result: request.method === "thread/start" ? { thread: { id: "thread1" } } : {} }) });
    if (request.method === "turn/start") closedSocket.onclose();
  });
} };
const closedExecutor = new CodexAppServerExecutor({ websocketFn: async () => closedSocket });
const closedResult = await closedExecutor.execute({ model: "model", body: { input: "hi" }, stream: false, credentials: { providerSpecificData: { codexAppServerUrl: "ws://127.0.0.1:4500", codexAppServerToken: "capability" } } });
assert.equal((await closedResult.response.json()).error.code, "codex_app_server_connection_closed");

const frames = [];
const socket = { send: text => frames.push(JSON.parse(text)), close() {}, onmessage: null, onerror: null, onclose: null };
const client = new CodexAppServerClient({ websocketFn: async (url, options) => { assert.equal(options.headers.Authorization, "Bearer capability"); return socket; } });
await client.connect("ws://127.0.0.1:4500", "capability");
const request = client.request("initialize", {});
const id = frames[0].id;
socket.onmessage({ data: JSON.stringify({ jsonrpc: "2.0", id, result: { ok: true } }) });
assert.deepEqual(await request, { ok: true });
socket.onmessage({ data: JSON.stringify({ jsonrpc: "2.0", id: 99, method: "item/commandExecution/requestApproval", params: { command: "touch /tmp/unsafe" } }) });
assert.equal(frames.at(-1).id, 99);
assert.equal(frames.at(-1).result.decision, "denied");
const events = [];
translateToolCall({ callId: "call1", namespace: "tools", tool: "read", arguments: { path: "x" } }, event => events.push(event));
translateNotification("item/agentMessage/delta", { delta: "answer" }, event => events.push(event));
assert.equal(translateNotification("turn/completed", { usage: { input_tokens: 7, output_tokens: 2 } }, event => events.push(event)), true);
const response = buildResponseJSON(events, "model");
assert.equal(response.output[0].name, "tools__read");
assert.equal(response.output[0].arguments, '{"path":"x"}');
assert.equal(response.usage.input_tokens, 7);
assert.equal(response.output[1].content[0].text, "answer");
const prompt = buildPrompt([{ role: "user", content: "read file" }, { role: "assistant", tool_calls: [{ id: "call1", function: { name: "read", arguments: '{"path":"x"}' } }] }, { role: "tool", tool_call_id: "call1", content: "file contents" }]);
assert.match(prompt, /call1/);
assert.match(prompt, /file contents/);
client.close();
assert.equal(client.pending.size, 0);
