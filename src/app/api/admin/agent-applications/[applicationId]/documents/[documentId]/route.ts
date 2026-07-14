import { NextResponse } from "next/server";
import { AGENT_APPLICATION_BUCKET } from "@/lib/agent-onboarding";
import { getAdminRouteContext } from "@/lib/admin-route";
import type { AgentApplicationDocument } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ applicationId: string; documentId: string }> },
) {
  const admin = await getAdminRouteContext();

  if (admin.status === "unauthenticated") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (admin.status === "forbidden") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { applicationId, documentId } = await params;
  const { data, error } = await admin.supabase
    .from("agent_application_documents")
    .select("*")
    .eq("id", documentId)
    .eq("application_id", applicationId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const document = data as AgentApplicationDocument;
  const downloadResult = await admin.downloadClient.storage
    .from(AGENT_APPLICATION_BUCKET)
    .download(document.file_path);

  if (downloadResult.error || !downloadResult.data) {
    return NextResponse.json({ error: "Could not download document." }, { status: 500 });
  }

  const bytes = await downloadResult.data.arrayBuffer();

  return new Response(bytes, {
    headers: {
      "content-type": document.content_type || "application/octet-stream",
      "content-disposition": `attachment; filename="${encodeHeaderFileName(document.file_name)}"`,
      "cache-control": "private, no-store",
    },
  });
}

function encodeHeaderFileName(fileName: string) {
  return fileName.replace(/["\\\r\n]/g, "_");
}
