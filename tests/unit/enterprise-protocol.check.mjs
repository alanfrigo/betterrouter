import assert from "node:assert/strict";
import "../register-aliases.mjs";

// Run directly: node tests/unit/enterprise-protocol.check.mjs
const calls = [];
const replies = [];
globalThis.fetch = async (url, options) => {
  calls.push({ url: String(url), options });
  const reply = replies.shift();
  assert.ok(reply, "Unexpected upstream request");
  return reply;
};
const { EnterpriseExecutor, validateEnterpriseProvider } = await import("../../open-sse/executors/enterprise.js");
const { enterpriseChatUrl } = await import("../../open-sse/config/enterprise.js");

assert.equal(enterpriseChatUrl("azure-ai", "deploy/1", { baseUrl: "https://tenant.openai.azure.com" }), "https://tenant.openai.azure.com/openai/deployments/deploy%2F1/chat/completions?api-version=2024-12-01-preview");
assert.equal(enterpriseChatUrl("azure-ai", "deploy", { baseUrl: "https://tenant.services.ai.azure.com/" }), "https://tenant.services.ai.azure.com/openai/v1/chat/completions");
assert.equal(enterpriseChatUrl("snowflake", "model", { baseUrl: "https://tenant.snowflakecomputing.com/api/v2" }), "https://tenant.snowflakecomputing.com/api/v2/cortex/v1/chat/completions");
assert.equal(enterpriseChatUrl("datarobot", "model", { baseUrl: "https://app.datarobot.com/api/v2/genai/llmgw/chat/completions/" }), "https://app.datarobot.com/api/v2/genai/llmgw/chat/completions/");
assert.throws(() => enterpriseChatUrl("sap", "model", { baseUrl: "https://tenant.hana.ondemand.com" }), /deployment URL/);
assert.throws(() => enterpriseChatUrl("azure-ai", "model", {}), /base URL is required/);
assert.throws(() => enterpriseChatUrl("dify", "auto", { baseUrl: "https://user:secret@tenant.test" }), /embedded credentials/);
assert.equal(new EnterpriseExecutor("clarifai").buildHeaders({ apiKey: "pat" }).Authorization, "Key pat");
const patHeaders = new EnterpriseExecutor("snowflake").buildHeaders({ apiKey: "pat/token" });
assert.equal(patHeaders.Authorization, "Bearer token");
assert.equal(patHeaders["X-Snowflake-Authorization-Token-Type"], "PROGRAMMATIC_ACCESS_TOKEN");
assert.equal(new EnterpriseExecutor("oci").buildHeaders({ apiKey: "token", providerSpecificData: { projectId: "project" } })["OpenAI-Project"], "project");

function sse(frames) {
  const encoded = new TextEncoder().encode(frames);
  // Split mid-frame, CRLF and UTF-8 to exercise streaming decoder boundaries.
  let offset = 0;
  return new Response(new ReadableStream({ pull(controller) {
    if (offset >= encoded.length) return controller.close();
    controller.enqueue(encoded.slice(offset, offset + 7));
    offset += 7;
  } }), { headers: { "Content-Type": "text/event-stream" } });
}
const body = { messages: [{ role: "user", content: "Hello" }] };
replies.push(sse('data: {"event":"message","message_id":"msg","answer":"héllo"}\r\n\r\ndata: {"event":"message_end","metadata":{"usage":{"prompt_tokens":2,"completion_tokens":3}}}\r\n\r\n'));
const dify = await new EnterpriseExecutor("dify").execute({ model: "auto", body, stream: false, credentials: { apiKey: "app-key" } });
const difyOutput = await dify.response.json();
assert.equal(difyOutput.choices[0].message.content, "héllo");
assert.equal(difyOutput.usage.total_tokens, 5);
assert.equal(calls.at(-1).url, "https://api.dify.ai/v1/chat-messages");
assert.equal(JSON.parse(calls.at(-1).options.body).response_mode, "streaming");
assert.throws(() => new EnterpriseExecutor("dify").transformRequest("auto", { ...body, tools: [{}] }, false, { providerSpecificData: {} }), /tool declarations/);

replies.push(sse('event: conversation.message.delta\ndata: {"type":"answer","content":"Hi"}\n\nevent: conversation.chat.completed\ndata: {"usage":{"input_tokens":1,"output_tokens":2}}\n\n'));
const coze = await new EnterpriseExecutor("coze").execute({ model: "auto", body, stream: true, credentials: { apiKey: "token", providerSpecificData: { botId: "bot-123", userId: "user-1" } } });
const cozeOutput = await coze.response.text();
assert.match(cozeOutput, /"content":"Hi"/);
assert.match(cozeOutput, /data: \[DONE\]/);
assert.equal(calls.at(-1).url, "https://api.coze.com/v3/chat");
assert.equal(JSON.parse(calls.at(-1).options.body).bot_id, "bot-123");

replies.push(sse('event: conversation.chat.failed\ndata: {"last_error":{"msg":"quota denied"}}\n\n'));
await assert.rejects(new EnterpriseExecutor("coze").execute({ model: "bot", body, stream: false, credentials: { apiKey: "token" } }), /quota denied/);
assert.equal(await validateEnterpriseProvider("unrelated", "key"), null);
replies.push(Response.json({ code: 5426, msg: "Bot unavailable" }));
assert.deepEqual(await validateEnterpriseProvider("coze", "token", { botId: "bot" }), { valid: false, error: "Bot unavailable" });
replies.push(new Response("denied", { status: 401 }));
assert.equal((await validateEnterpriseProvider("watsonx", "token")).valid, false);

replies.push(Response.json({ access_token: "short-lived", expires_at: Date.now() + 1800000 }), Response.json({ choices: [] }), Response.json({ choices: [] }));
const gigachat = new EnterpriseExecutor("gigachat");
for (let i = 0; i < 2; i++) await gigachat.execute({ model: "GigaChat-2-Pro", body, stream: false, credentials: { apiKey: "encoded-key" } });
const oauth = calls.filter(c => c.url.includes("/oauth"));
assert.equal(oauth.length, 1);
assert.equal(oauth[0].options.headers.Authorization, "Basic encoded-key");
assert.equal(calls.at(-1).options.headers.Authorization, "Bearer short-lived");
replies.push(Response.json({ access_token: "replacement", expires_at: Date.now() + 1800000 }));
assert.equal((await gigachat.refreshCredentials({ apiKey: "encoded-key" })).accessToken, "replacement");
assert.equal(calls.filter(c => c.url.includes("/oauth")).length, 2);
assert.equal(replies.length, 0);
console.log("Enterprise protocol checks passed");
