#!/usr/bin/env node
import { runChatGptMcpServer } from "../open-sse/vendor/codex-chatgpt-web/adapters/chatgpt-web/mcp-server.js";
const index = process.argv.indexOf("--broker-socket");
const brokerSocketPath = index >= 0 ? process.argv[index + 1] : null;
if (!brokerSocketPath) throw new Error("--broker-socket is required");
await runChatGptMcpServer({ brokerSocketPath });
