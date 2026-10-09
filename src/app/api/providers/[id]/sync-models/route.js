import { NextResponse } from "next/server";
import { getProviderConnectionById } from "@/lib/db/index.js";
import { updateModelSyncState } from "@/lib/db/repos/modelSyncRepo.js";
import { syncProviderModels } from "@/shared/services/modelSyncScheduler.js";
import { isAuthenticated } from "@/dashboardGuard";

export const runtime = "nodejs";

async function authorize(request) {
  // Same dashboard session policy as other /api/providers management endpoints.
  return await isAuthenticated(request);
}

export async function POST(request, { params }) {
  if (!await authorize(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await syncProviderModels(id);
  return NextResponse.json(result, { status: result.status || 200 });
}

export async function PATCH(request, { params }) {
  if (!await authorize(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be boolean" }, { status: 400 });
  }
  const { id } = await params;
  const connection = await getProviderConnectionById(id);
  if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  const newlyEnabled = body.enabled && connection.providerSpecificData?.autoSync !== true;
  const saved = await updateModelSyncState(id, {
    autoSync: body.enabled,
    ...(newlyEnabled ? { modelSyncLastAttemptAt: null } : {}),
  });
  if (!saved) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  const sync = newlyEnabled ? await syncProviderModels(id, { automatic: true }) : null;
  // Enabling survives a failed initial fetch; surface failure without undoing opt-in.
  return NextResponse.json({ enabled: body.enabled, ...(sync ? { sync } : {}) });
}
