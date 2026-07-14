import { NextResponse } from "next/server";
import { createAgentRecordPdf, safePdfFileName } from "@/lib/agent-pdf";
import { getAdminRouteContext } from "@/lib/admin-route";
import type { AgentLocation } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const agentSelect =
  "id, name, address_line_1, address_line_2, city, postcode, country, phone, email, opening_hours, services, latitude, longitude, status, display_order, updated_by, created_at, updated_at";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const admin = await getAdminRouteContext();

  if (admin.status === "unauthenticated") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (admin.status === "forbidden") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { agentId } = await params;
  const { data, error } = await admin.supabase
    .from("agents")
    .select(agentSelect)
    .eq("id", agentId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const agent = normalizeAgent(data);
  const pdfBytes = await createAgentRecordPdf(agent);
  const fileName = `xogmall-agent-${safePdfFileName(agent.name)}.pdf`;

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${fileName}"`,
      "cache-control": "private, no-store",
    },
  });
}

function normalizeAgent(agent: Record<string, unknown>) {
  return {
    ...agent,
    latitude: agent.latitude === null || agent.latitude === undefined ? null : Number(agent.latitude),
    longitude: agent.longitude === null || agent.longitude === undefined ? null : Number(agent.longitude),
    display_order: Number(agent.display_order || 0),
  } as AgentLocation;
}
