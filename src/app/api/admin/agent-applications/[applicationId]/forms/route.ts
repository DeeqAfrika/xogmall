import { NextResponse } from "next/server";
import {
  applicationDocuments,
  createPreparedAgentFormsZip,
  preparedFormsDownloadName,
} from "@/lib/agent-forms";
import { getAdminRouteContext } from "@/lib/admin-route";
import type { AgentApplication, AgentApplicationDocument } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ApplicationWithDocuments = AgentApplication & {
  agent_application_documents?: AgentApplicationDocument[];
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const admin = await getAdminRouteContext();

  if (admin.status === "unauthenticated") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (admin.status === "forbidden") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { applicationId } = await params;
  const { data, error } = await admin.supabase
    .from("agent_applications")
    .select("*, agent_application_documents(*)")
    .eq("id", applicationId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const application = data as ApplicationWithDocuments;
  const bytes = await createPreparedAgentFormsZip(application, applicationDocuments(application));

  return new Response(new Uint8Array(bytes), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${preparedFormsDownloadName(application)}"`,
      "cache-control": "private, no-store",
    },
  });
}
