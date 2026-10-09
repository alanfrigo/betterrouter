import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyDashboardAuthToken } from "@/lib/auth/dashboardSession";
import { getProviderConnections } from "@/lib/db/index.js";
import { JulesAgent } from "@/lib/cloudAgent/agents/jules.js";
import { DevinAgent } from "@/lib/cloudAgent/agents/devin.js";
import { CodexCloudAgent } from "@/lib/cloudAgent/agents/codex.js";
import { CreateCloudAgentTaskSchema } from "@/lib/cloudAgent/types.js";
import { sanitizeErrorMessage } from "open-sse/executors/protocolSupport.js";

const agents = { jules: new JulesAgent(), devin: new DevinAgent(), "codex-cloud": new CodexCloudAgent() };
async function context(params) {
  const jar = await cookies();
  if (!await verifyDashboardAuthToken(jar.get("auth_token")?.value)) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { provider } = await params;
  const agent = agents[provider];
  if (!agent) return { error: NextResponse.json({ error: "Unknown cloud agent" }, { status: 404 }) };
  const connections = await getProviderConnections({ provider, isActive: true });
  const connection = connections.find(value => value.apiKey);
  if (!connection) return { error: NextResponse.json({ error: "Active cloud agent API-key connection required" }, { status: 400 }) };
  return { agent, provider, credentials: { apiKey: connection.apiKey } };
}
export async function GET(request, { params }) {
  try {
    const ctx = await context(params);
    if (ctx.error) return ctx.error;
    const query = new URL(request.url).searchParams;
    const externalId = query.get("externalId");
    if (externalId && !/^[\w./-]{1,256}$/.test(externalId)) return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    return NextResponse.json(externalId ? await ctx.agent.getStatus(externalId, ctx.credentials) : { sources: await ctx.agent.listSources(ctx.credentials) });
  } catch (error) { return NextResponse.json({ error: sanitizeErrorMessage(error.message) }, { status: 502 }); }
}
export async function POST(request, { params }) {
  try {
    const ctx = await context(params);
    if (ctx.error) return ctx.error;
    const body = await request.json();
    const action = body.action || "create";
    if (action === "create") {
      const parsed = CreateCloudAgentTaskSchema.safeParse({ ...body, providerId: ctx.provider });
      if (!parsed.success) return NextResponse.json({ error: "Invalid task request", details: parsed.error.issues }, { status: 400 });
      return NextResponse.json(await ctx.agent.createTask({ ...parsed.data, options: parsed.data.options || {} }, ctx.credentials), { status: 201 });
    }
    if (typeof body.externalId !== "string" || !/^[\w./-]{1,256}$/.test(body.externalId)) return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    if (action === "approve") {
      await ctx.agent.approvePlan(body.externalId, ctx.credentials);
      return NextResponse.json({ success: true });
    }
    if (action === "message" && typeof body.message === "string" && body.message.length > 0 && body.message.length <= 10000) return NextResponse.json(await ctx.agent.sendMessage(body.externalId, body.message, ctx.credentials));
    return NextResponse.json({ error: "Unsupported task action" }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: sanitizeErrorMessage(error.message) }, { status: 502 }); }
}
