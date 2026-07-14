import type { Metadata } from "next";
import {
  AdminAgentsManager,
  type AdminAgentApplication,
} from "@/components/admin/AdminAgentsManager";
import { AdminAccessDeniedNotice, AdminSetupNotice } from "@/components/admin/AdminNotice";
import { AdminShell } from "@/components/admin/AdminShell";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getAdminContext } from "@/lib/admin";
import type { AgentApplicationDocument, AgentLocation } from "@/lib/types";

export const metadata: Metadata = { title: "Manage Agents", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const agentSelect =
  "id, name, address_line_1, address_line_2, city, postcode, country, phone, email, opening_hours, services, latitude, longitude, status, display_order, updated_by, created_at, updated_at";

type AgentApplicationRow = Omit<AdminAgentApplication, "documents"> & {
  agent_application_documents?: AgentApplicationDocument[];
};

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const admin = await getAdminContext();

  if (admin.status === "setup") {
    return <AdminShell><AdminSetupNotice /></AdminShell>;
  }

  if (admin.status === "denied") {
    return <AdminShell actions={<LogoutButton />}><AdminAccessDeniedNotice /></AdminShell>;
  }

  const [agentResult, applicationResult] = await Promise.all([
    admin.supabase
      .from("agents")
      .select(agentSelect)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    admin.supabase
      .from("agent_applications")
      .select("*, agent_application_documents(*)")
      .order("updated_at", { ascending: false }),
  ]);

  const agents = agentResult.error
    ? []
    : (agentResult.data || []).map((agent) => ({
      ...agent,
      latitude: agent.latitude === null ? null : Number(agent.latitude),
      longitude: agent.longitude === null ? null : Number(agent.longitude),
      display_order: Number(agent.display_order || 0),
    })) as AgentLocation[];

  const applications = applicationResult.error
    ? []
    : ((applicationResult.data || []) as AgentApplicationRow[]).map((application) => ({
      ...application,
      documents: (application.agent_application_documents || [])
        .sort((a, b) => Date.parse(b.uploaded_at) - Date.parse(a.uploaded_at)),
    }));

  const params = await searchParams;
  const requestedView = Array.isArray(params.view) ? params.view[0] : params.view;
  const initialView = requestedView === "applications" || (!requestedView && applications.length > 0 && agents.length === 0)
    ? "applications"
    : "locator";

  return (
    <AdminShell active="agents" actions={<LogoutButton />}>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Agents</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Manage agent network</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
            Manage public locator agents, private registration applications, missing onboarding requirements, and filed PDF/document packs from one place.
          </p>
        </div>
      </div>

      <AdminAgentsManager
        agents={agents}
        applications={applications}
        adminUserId={admin.userId}
        initialView={initialView}
        agentError={agentResult.error?.message ?? null}
        onboardingError={applicationResult.error?.message ?? null}
      />
    </AdminShell>
  );
}
