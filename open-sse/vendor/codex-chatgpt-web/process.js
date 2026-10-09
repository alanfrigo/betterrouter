/* Adapted from miuuyy/codex-chatgpt-web commit 09877fa21ffdbf20979623ef501046fc02a750d7 (MIT). */
import { spawnSync } from "node:child_process";
export function processRunning(pid, probe = process.kill) {
    if (!Number.isInteger(pid) || pid < 1)
        return false;
    try {
        probe(pid, 0);
        return true;
    }
    catch (error) {
        // Windows and hardened Unix environments can deny signalling an existing process. EPERM is
        // existence evidence, not proof that the launcher/browser/tunnel owner disappeared.
        return error?.code === "EPERM";
    }
}
export function runCommand(command, args, options = {}) {
    const result = spawnSync(command, args, {
        encoding: "utf8",
        stdio: "pipe",
        ...options,
    });
    if (result.error)
        throw result.error;
    return {
        status: result.status ?? 1,
        stdout: typeof result.stdout === "string" ? result.stdout : (result.stdout?.toString("utf8") ?? ""),
        stderr: typeof result.stderr === "string" ? result.stderr : (result.stderr?.toString("utf8") ?? ""),
    };
}
export function runChecked(command, args, options = {}) {
    const result = runCommand(command, args, options);
    if (result.status !== 0) {
        const detail = result.stderr.trim() || result.stdout.trim() || `exit ${result.status}`;
        throw new Error(`${command} ${args.join(" ")} failed: ${detail}`);
    }
    return result;
}
