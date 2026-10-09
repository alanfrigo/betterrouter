import { NextResponse } from "next/server";
import { getProviderConnectionById } from "@/lib/db/index.js";
import { discoverProviderModels } from "@/lib/providerModels/discovery.js";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const connection = await getProviderConnectionById(id);
    if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    const result = await discoverProviderModels(connection);
    return NextResponse.json({ provider: connection.provider, connectionId: id, ...result }, {
      status: result.error ? result.status || 502 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 502 });
  }
}
