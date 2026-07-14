import { NextResponse } from "next/server";
import { createAgentRegisterPdf } from "@/lib/agent-pdf";
import { getAdminRouteContext } from "@/lib/admin-route";
import type { AgentLocation } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const agentSelect =
  "id, name, address_line_1, address_line_2, city, postcode, country, phone, email, opening_hours, services, latitude, longitude, status, display_order, updated_by, created_at, updated_at";

export async function GET() {
  const admin = await getAdminRouteContext();

  if (admin.status === "unauthenticated") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (admin.status === "forbidden") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { data, error } = await admin.supabase
    .from("agents")
    .select(agentSelect)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load agents." }, { status: 500 });
  }

  const agents = (data || []).map(normalizeAgent);
  const pdfBytes = await createAgentRegisterPdf(agents);

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="xogmall-agent-locator-register.pdf"',
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
