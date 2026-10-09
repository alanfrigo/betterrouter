import { TurnBroker } from "../../vendor/codex-chatgpt-web/adapters/chatgpt-web/turn-broker.js";
import { chatGptTurnSessions } from "../../vendor/codex-chatgpt-web/adapters/chatgpt-web/turn-execution.js";
import { connectionRuntimePaths } from "./storageState.js";
import { stopChatGptWebCodexTunnelRuntime } from "./tunnelClient.js";
const activeWorkers = new Set();
const activeBrokers = new Set();
export function trackChatGptWebCodexRuntime(worker, brokerSocketPath) {
    activeWorkers.add(worker);
    activeBrokers.add(TurnBroker.forSocket(brokerSocketPath));
}
export function getChatGptWebCodexRuntimeCounts() {
    return {
        activeTurns: chatGptTurnSessions.activeCount(),
        waitingTurns: chatGptTurnSessions.waitingCount(),
        browserWorkers: activeWorkers.size,
        brokers: activeBrokers.size,
    };
}
export async function stopChatGptWebCodexRuntime() {
    chatGptTurnSessions.clear();
    const workers = [...activeWorkers];
    const brokers = [...activeBrokers];
    activeWorkers.clear();
    activeBrokers.clear();
    await Promise.allSettled(workers.map((worker) => worker.close()));
    await Promise.allSettled(brokers.map((broker) => broker.close()));
    await stopChatGptWebCodexTunnelRuntime();
}
export function brokerSocketPathForConnection(connectionId) {
    return connectionRuntimePaths(connectionId).brokerSocketPath;
}
