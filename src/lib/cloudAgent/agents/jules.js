import { randomUUID } from "node:crypto";
import { CloudAgentBase, } from "../baseAgent.js";
import { buildJulesApiUrl, JULES_API_BASE_URL } from "../julesApi.js";
import { CLOUD_AGENT_STATUS } from "../types.js";
function julesHeaders(apiKey, json = false) {
    const headers = {
        "X-Goog-Api-Key": apiKey,
    };
    if (json) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
}
function parseGithubOwnerRepo(repoUrl, repoName) {
    const normalized = repoUrl.includes("://") ? repoUrl : `https://${repoUrl}`;
    try {
        const url = new URL(normalized);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
            return {
                owner: parts[0],
                repo: parts[1].replace(/\.git$/i, ""),
            };
        }
    }
    catch {
        // fall through to string split for non-URL inputs
    }
    const parts = repoUrl.split("/").filter(Boolean);
    const owner = parts.length >= 2 ? parts[parts.length - 2] : "";
    const repo = parts.length >= 2 ? parts[parts.length - 1].replace(/\.git$/i, "") : repoName.trim();
    return { owner, repo: repo || repoName.trim() };
}
function buildJulesSourceResourceName(owner, repo) {
    return `sources/github/${owner}/${repo}`;
}
function normalizeJulesSessionId(externalId) {
    const trimmed = externalId.trim();
    return trimmed.startsWith("sessions/") ? trimmed.slice("sessions/".length) : trimmed;
}
function mapJulesActivity(act) {
    const progress = act.progressUpdated;
    const planGenerated = act.planGenerated;
    let type = "command";
    let content = "";
    if (act.planGenerated) {
        type = "plan";
        const plan = planGenerated?.plan;
        const steps = Array.isArray(plan?.steps) ? plan.steps : [];
        content = steps
            .map((step) => {
            const row = step;
            return typeof row.title === "string" ? row.title : "";
        })
            .filter(Boolean)
            .join("\n");
    }
    else if (act.sessionCompleted) {
        type = "completion";
        content = "Session completed";
    }
    else if (act.planApproved) {
        type = "message";
        content = "Plan approved";
    }
    else if (progress) {
        content = [progress.title, progress.description].filter(Boolean).join(": ");
    }
    return {
        id: act.id || randomUUID(),
        type,
        content,
        timestamp: act.createTime || new Date().toISOString(),
    };
}
function extractJulesResult(outputs) {
    if (!Array.isArray(outputs))
        return undefined;
    for (const item of outputs) {
        const output = item;
        const pullRequest = output.pullRequest;
        if (pullRequest?.url) {
            return {
                prUrl: String(pullRequest.url),
                commitMessage: typeof pullRequest.description === "string" ? pullRequest.description : undefined,
                summary: typeof pullRequest.title === "string" ? pullRequest.title : undefined,
            };
        }
    }
    return undefined;
}
function readJulesErrorMessage(data) {
    if (typeof data.error === "string" && data.error.trim()) {
        return data.error.trim();
    }
    if (data.error && typeof data.error === "object") {
        const record = data.error;
        const message = record.message;
        if (typeof message === "string" && message.trim()) {
            return message.trim();
        }
    }
    return "";
}
function inferJulesStatus(data, activities) {
    if (extractJulesResult(data.outputs)) {
        return CLOUD_AGENT_STATUS.COMPLETED;
    }
    if (activities.some((act) => act.sessionCompleted)) {
        return CLOUD_AGENT_STATUS.COMPLETED;
    }
    if (activities.some((act) => act.planGenerated) && !activities.some((act) => act.planApproved)) {
        return CLOUD_AGENT_STATUS.AWAITING_APPROVAL;
    }
    if (readJulesErrorMessage(data)) {
        return CLOUD_AGENT_STATUS.FAILED;
    }
    const state = typeof data.state === "string" ? data.state.toLowerCase() : "";
    if (state.includes("failed") || state.includes("error")) {
        return CLOUD_AGENT_STATUS.FAILED;
    }
    if (state.includes("cancelled") || state.includes("canceled")) {
        return CLOUD_AGENT_STATUS.CANCELLED;
    }
    if (state.includes("completed") || state.includes("done")) {
        return CLOUD_AGENT_STATUS.COMPLETED;
    }
    if (state.includes("pending") || state.includes("queued")) {
        return CLOUD_AGENT_STATUS.QUEUED;
    }
    if (state.includes("running") || state.includes("active")) {
        return CLOUD_AGENT_STATUS.RUNNING;
    }
    if (activities.some((act) => act.progressUpdated)) {
        return CLOUD_AGENT_STATUS.RUNNING;
    }
    return CLOUD_AGENT_STATUS.QUEUED;
}
function readJulesSourceBranch(source) {
    const githubRepo = source.githubRepo;
    const githubRepoContext = source.githubRepoContext;
    const candidates = [
        githubRepoContext?.startingBranch,
        githubRepoContext?.defaultBranch,
        githubRepo?.defaultBranch,
        source.defaultBranch,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
        }
    }
    return undefined;
}
export class JulesAgent extends CloudAgentBase {
    providerId = "jules";
    baseUrl = JULES_API_BASE_URL;
    async createTask(params, credentials) {
        const taskId = this.generateTaskId();
        const { owner, repo } = parseGithubOwnerRepo(params.source.repoUrl, params.source.repoName);
        const sourceResource = buildJulesSourceResourceName(owner, repo);
        const body = {
            prompt: params.prompt,
            title: params.source.repoName || repo,
            sourceContext: {
                source: sourceResource,
                githubRepoContext: {
                    startingBranch: params.source.branch || "main",
                },
            },
        };
        if (params.options.autoCreatePr) {
            body.automationMode = "AUTO_CREATE_PR";
        }
        if (params.options.planApprovalRequired) {
            body.requirePlanApproval = true;
        }
        const response = await fetch(buildJulesApiUrl("/sessions"), {
            method: "POST",
            headers: julesHeaders(credentials.apiKey, true),
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Jules create task failed: ${response.status} ${error}`);
        }
        const data = (await response.json());
        const sessionId = (typeof data.id === "string" && data.id) ||
            (typeof data.name === "string" ? normalizeJulesSessionId(data.name) : "") ||
            taskId;
        return {
            id: taskId,
            providerId: this.providerId,
            externalId: sessionId,
            status: CLOUD_AGENT_STATUS.QUEUED,
            prompt: params.prompt,
            source: params.source,
            options: params.options,
            activities: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
    async getStatus(externalId, credentials) {
        const sessionId = normalizeJulesSessionId(externalId);
        const [sessionRes, activitiesRes] = await Promise.all([
            fetch(buildJulesApiUrl(`/sessions/${sessionId}`), {
                headers: julesHeaders(credentials.apiKey),
            }),
            fetch(buildJulesApiUrl(`/sessions/${sessionId}/activities?pageSize=30`), {
                headers: julesHeaders(credentials.apiKey),
            }),
        ]);
        if (!sessionRes.ok) {
            const error = await sessionRes.text();
            throw new Error(`Jules get status failed: ${sessionRes.status} ${error}`);
        }
        const data = (await sessionRes.json());
        let rawActivities = [];
        if (activitiesRes.ok) {
            const activitiesPayload = (await activitiesRes.json());
            rawActivities = Array.isArray(activitiesPayload.activities)
                ? activitiesPayload.activities
                : [];
        }
        const activities = rawActivities.map(mapJulesActivity);
        const status = inferJulesStatus(data, rawActivities);
        const result = extractJulesResult(data.outputs);
        const errorMessage = readJulesErrorMessage(data);
        return {
            status,
            externalId: sessionId,
            result,
            activities,
            error: errorMessage || undefined,
        };
    }
    async approvePlan(externalId, credentials) {
        const sessionId = normalizeJulesSessionId(externalId);
        const response = await fetch(buildJulesApiUrl(`/sessions/${sessionId}:approvePlan`), {
            method: "POST",
            headers: julesHeaders(credentials.apiKey, true),
            body: "{}",
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Jules approve plan failed: ${response.status} ${error}`);
        }
    }
    async sendMessage(externalId, message, credentials) {
        const sessionId = normalizeJulesSessionId(externalId);
        const response = await fetch(buildJulesApiUrl(`/sessions/${sessionId}:sendMessage`), {
            method: "POST",
            headers: julesHeaders(credentials.apiKey, true),
            body: JSON.stringify({ prompt: message }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Jules send message failed: ${response.status} ${error}`);
        }
        return {
            id: this.generateActivityId(),
            type: "message",
            content: message,
            timestamp: new Date().toISOString(),
        };
    }
    async listSources(credentials) {
        const response = await fetch(buildJulesApiUrl("/sources"), {
            headers: julesHeaders(credentials.apiKey),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Jules list sources failed: ${response.status} ${error}`);
        }
        const data = (await response.json());
        return (Array.isArray(data.sources) ? data.sources : []).map((source) => {
            const githubRepo = source.githubRepo;
            const owner = typeof githubRepo?.owner === "string" ? githubRepo.owner : "";
            const repo = typeof githubRepo?.repo === "string" ? githubRepo.repo : "";
            const branch = readJulesSourceBranch(source);
            return {
                name: typeof source.name === "string" ? source.name : `${owner}/${repo}`,
                url: owner && repo ? `https://github.com/${owner}/${repo}` : "",
                ...(branch ? { branch } : {}),
            };
        });
    }
}
