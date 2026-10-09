import { randomBytes } from "node:crypto";
export class CloudAgentBase {
    mapStatus(status) {
        const statusLower = status.toLowerCase();
        if (statusLower.includes("completed") || statusLower.includes("done")) {
            return "completed";
        }
        if (statusLower.includes("failed") || statusLower.includes("error")) {
            return "failed";
        }
        if (statusLower.includes("cancelled") || statusLower.includes("canceled")) {
            return "cancelled";
        }
        if (statusLower.includes("running") ||
            statusLower.includes("active") ||
            statusLower.includes("executing")) {
            return "running";
        }
        if (statusLower.includes("pending") ||
            statusLower.includes("queued") ||
            statusLower.includes("waiting")) {
            return "queued";
        }
        if (statusLower.includes("approval") || statusLower.includes("plan")) {
            return "awaiting_approval";
        }
        return "queued";
    }
    generateTaskId() {
        // Cryptographically secure suffix (not Math.random) — task IDs flow into
        // session/external identifiers, so they must be unpredictable (CodeQL js/insecure-randomness).
        return `task_${Date.now()}_${randomBytes(8).toString("hex")}`;
    }
    generateActivityId() {
        return `act_${Date.now()}_${randomBytes(8).toString("hex")}`;
    }
}
