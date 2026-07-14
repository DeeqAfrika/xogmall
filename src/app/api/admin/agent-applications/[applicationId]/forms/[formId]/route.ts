import { NextResponse } from "next/server";
import {
  applicationDocuments,
  createPreparedAgentFormDocx,
  preparedFormDownloadName,
} from "@/lib/agent-forms";
import { getPreparedAgentForm } from "@/lib/agent-form-definitions";
import { getAdminRouteContext } from "@/lib/admin-route";
import type { AgentApplication, AgentApplicationDocument } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ApplicationWithDocuments = AgentApplication & {
  agent_application_documents?: AgentApplicationDocument[];
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ applicationId: string; formId: string }> },
) {
  const admin = await getAdminRouteContext();

  if (admin.status === "unauthenticated") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (admin.status === "forbidden") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { applicationId, formId } = await params;
  const form = getPreparedAgentForm(formId);

  if (!form) {
    return NextResponse.json({ error: "Prepared form not found." }, { status: 404 });
  }

  const { data, error } = await admin.supabase
    .from("agent_applications")
    .select("*, agent_application_documents(*)")
    .eq("id", applicationId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const application = data as ApplicationWithDocuments;
  const bytes = await createPreparedAgentFormDocx(form.id, application, applicationDocuments(application));

  return new Response(new Uint8Array(bytes), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "content-disposition": `attachment; filename="${preparedFormDownloadName(form, application)}"`,
      "cache-control": "private, no-store",
    },
  });
}
