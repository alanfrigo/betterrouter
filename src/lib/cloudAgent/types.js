import { z } from "zod";
export const CLOUD_AGENT_STATUS = {
    QUEUED: "queued",
    RUNNING: "running",
    AWAITING_APPROVAL: "awaiting_approval",
    COMPLETED: "completed",
    FAILED: "failed",
    CANCELLED: "cancelled",
};
export const CloudAgentStatusSchema = z.enum([
    "queued",
    "running",
    "awaiting_approval",
    "completed",
    "failed",
    "cancelled",
]);
export const CloudAgentSourceSchema = z.object({
    repoName: z.string().min(1),
    repoUrl: z.string().url(),
    branch: z.string().optional(),
});
export const CloudAgentTaskOptionsSchema = z.object({
    autoCreatePr: z.boolean().optional(),
    planApprovalRequired: z.boolean().optional(),
    environment: z.record(z.string(), z.string()).optional(),
});
export const CreateCloudAgentTaskSchema = z.object({
    providerId: z.enum(["jules", "devin", "codex-cloud", "cursor-cloud"]),
    prompt: z.string().min(1).max(10000),
    source: CloudAgentSourceSchema,
    options: CloudAgentTaskOptionsSchema.optional(),
});
export const UpdateCloudAgentTaskSchema = z.object({
    id: z.string().min(1),
    action: z.enum(["approve", "reject", "cancel", "message"]),
    message: z.string().optional(),
});
