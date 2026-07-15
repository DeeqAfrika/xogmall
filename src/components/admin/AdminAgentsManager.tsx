"use client";

import {
  ArrowSquareOut,
  CheckCircle,
  ClipboardText,
  DownloadSimple,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  FilePdf,
  FloppyDisk,
  MagnifyingGlass,
  MapPin,
  Plus,
  Storefront,
  Trash,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useMemo, useState } from "react";
import {
  applicationStatusLabels,
  businessPremisesStatusLabels,
  businessTypeLabels,
  formatFileSize,
  getDocumentRequirement,
  getMissingRequiredDocuments,
} from "@/lib/agent-onboarding";
import { preparedAgentForms } from "@/lib/agent-form-definitions";
import { formatAgentAddress, mapsSearchUrl } from "@/lib/agent-format";
import { createClient } from "@/lib/supabase/client";
import type {
  AgentApplication,
  AgentApplicationDocument,
  AgentApplicationStatus,
  AgentLocation,
} from "@/lib/types";

type AgentFormState = {
  id: string | null;
  name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  opening_hours: string;
  services: string;
  latitude: string;
  longitude: string;
  status: "published" | "draft";
  display_order: string;
};

export type AdminAgentApplication = AgentApplication & {
  documents: AgentApplicationDocument[];
};

type WorkspaceView = "locator" | "applications";
type StatusFilter = "all" | "published" | "draft";
type ApplicationFilter = "all" | AgentApplicationStatus;

const blankForm: AgentFormState = {
  id: null,
  name: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  phone: "",
  email: "",
  opening_hours: "",
  services: "",
  latitude: "",
  longitude: "",
  status: "published",
  display_order: "0",
};

export function AdminAgentsManager({
  agents,
  applications,
  adminUserId,
  initialView = "locator",
  agentError,
  onboardingError,
}: {
  agents: AgentLocation[];
  applications: AdminAgentApplication[];
  adminUserId: string;
  initialView?: WorkspaceView;
  agentError?: string | null;
  onboardingError?: string | null;
}) {
  const router = useRouter();
  const [view, setView] = useState<WorkspaceView>(initialView);
  const [query, setQuery] = useState("");
  const [agentStatusFilter, setAgentStatusFilter] = useState<StatusFilter>("all");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<ApplicationFilter>("all");
  const [form, setForm] = useState<AgentFormState>(() => agentToForm(agents[0] ?? null));
  const [selectedApplicationId, setSelectedApplicationId] = useState(applications[0]?.id ?? "");
  const [statusById, setStatusById] = useState<Record<string, AgentApplicationStatus>>(
    Object.fromEntries(applications.map((application) => [application.id, application.status])),
  );
  const [notesById, setNotesById] = useState<Record<string, string>>(
    Object.fromEntries(applications.map((application) => [application.id, application.admin_notes ?? ""])),
  );
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const sortedAgents = useMemo(
    () => [...agents].sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)),
    [agents],
  );

  const sortedApplications = useMemo(
    () => [...applications].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)),
    [applications],
  );

  const filteredAgents = useMemo(() => {
    return sortedAgents.filter((agent) => {
      if (agentStatusFilter !== "all" && agent.status !== agentStatusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        agent.name,
        formatAgentAddress(agent),
        agent.phone,
        agent.email,
        agent.services,
        agent.status,
      ].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);
    });
  }, [agentStatusFilter, normalizedQuery, sortedAgents]);

  const filteredApplications = useMemo(() => {
    return sortedApplications.filter((application) => {
      if (applicationStatusFilter !== "all" && application.status !== applicationStatusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const missing = getApplicationMissingItems(application);

      return [
        application.full_name,
        application.business_name,
        application.email,
        application.mobile_phone,
        application.company_registration_number,
        application.status,
        ...missing,
      ].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);
    });
  }, [applicationStatusFilter, normalizedQuery, sortedApplications]);

  const selectedAgent = form.id
    ? sortedAgents.find((agent) => agent.id === form.id) ?? null
    : null;
  const selectedApplication =
    sortedApplications.find((application) => application.id === selectedApplicationId) ??
    sortedApplications[0] ??
    null;

  const incompleteApplications = applications.filter((application) => getApplicationMissingItems(application).length > 0).length;
  const publishedAgents = agents.filter((agent) => agent.status === "published").length;
  const draftAgents = agents.length - publishedAgents;
  const privateLink = `${typeof window === "undefined" ? "" : window.location.origin}/agent-onboarding`;

  function updateField<K extends keyof AgentFormState>(key: K, value: AgentFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectAgent(agent: AgentLocation) {
    setView("locator");
    setMessage(null);
    setError(null);
    setForm(agentToForm(agent));
  }

  function selectApplication(application: AdminAgentApplication) {
    setView("applications");
    setMessage(null);
    setError(null);
    setSelectedApplicationId(application.id);
  }

  function resetForm() {
    setForm(blankForm);
    setMessage(null);
    setError(null);
    setView("locator");
  }

  async function copyPrivateLink() {
    try {
      await navigator.clipboard.writeText(privateLink || "/agent-onboarding");
      setMessage("Private onboarding link copied.");
      setError(null);
    } catch {
      setError("Could not copy the link. Use /agent-onboarding.");
    }
  }

  async function saveAgent(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoadingAction("agent-save");
    setMessage(null);
    setError(null);

    const payload = agentFormToPayload(form);

    if (!payload.name || !payload.address_line_1 || !payload.city) {
      setError("Agent name, first address line, and city are required.");
      setLoadingAction(null);
      return;
    }

    const supabase = createClient();
    const result = form.id
      ? await supabase.from("agents").update(payload).eq("id", form.id)
      : await supabase.from("agents").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setLoadingAction(null);
      return;
    }

    setMessage(form.id ? "Agent details updated." : "Agent added to the locator.");
    setLoadingAction(null);
    if (!form.id) {
      setForm(blankForm);
    }
    router.refresh();
  }

  async function setAgentStatus(agent: AgentLocation, status: AgentLocation["status"]) {
    setLoadingAction(`agent-status-${agent.id}`);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("agents")
      .update({ status })
      .eq("id", agent.id);

    if (updateError) {
      setError(updateError.message);
      setLoadingAction(null);
      return;
    }

    setForm((current) => current.id === agent.id ? { ...current, status } : current);
    setMessage(status === "published" ? `${agent.name} is published on the locator.` : `${agent.name} is hidden from the public locator.`);
    setLoadingAction(null);
    router.refresh();
  }

  async function deleteAgent(agent: AgentLocation) {
    if (!window.confirm(`Delete ${agent.name}? This removes the agent from the public locator.`)) {
      return;
    }

    setLoadingAction(`agent-delete-${agent.id}`);
    setMessage(null);
    setError(null);

    const supabase = createClient();
    const { error: deleteError } = await supabase.from("agents").delete().eq("id", agent.id);

    if (deleteError) {
      setError(deleteError.message);
      setLoadingAction(null);
      return;
    }

    setMessage("Agent deleted.");
    setForm(blankForm);
    setLoadingAction(null);
    router.refresh();
  }

  async function saveApplicationReview(application: AdminAgentApplication) {
    setLoadingAction(`application-save-${application.id}`);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("agent_applications")
      .update({
        status: statusById[application.id],
        admin_notes: notesById[application.id]?.trim() || null,
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", application.id);

    if (updateError) {
      setError(updateError.message);
      setLoadingAction(null);
      return;
    }

    setMessage(`Updated ${application.business_name || application.full_name || "application"}.`);
    setLoadingAction(null);
    router.refresh();
  }

  async function createLocatorDraftFromApplication(application: AdminAgentApplication) {
    const addressLine1 = application.business_address_line_1?.trim();
    const city = application.business_city?.trim();

    if (!addressLine1 || !city) {
      setError("This application needs a business address line 1 and city before it can become a locator draft.");
      return;
    }

    setLoadingAction(`application-promote-${application.id}`);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("agents").insert({
      name: application.business_name || application.full_name || "New Hogmall agent",
      address_line_1: addressLine1,
      address_line_2: emptyToNull(application.business_address_line_2 ?? ""),
      city,
      postcode: emptyToNull(application.business_postcode ?? ""),
      country: application.business_country || "United Kingdom",
      phone: emptyToNull(application.mobile_phone ?? ""),
      email: emptyToNull(application.email ?? ""),
      opening_hours: null,
      services: "Customer support, transfer guidance, onboarding",
      latitude: null,
      longitude: null,
      status: "draft",
      display_order: 0,
    });

    if (insertError) {
      setError(insertError.message);
      setLoadingAction(null);
      return;
    }

    setMessage("Draft locator agent created from the application. Add map details and publish when ready.");
    setLoadingAction(null);
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Published locator agents" value={String(publishedAgents)} tone="live" />
          <MetricCard label="Draft locator agents" value={String(draftAgents)} tone="draft" />
          <MetricCard label="Applications" value={String(applications.length)} tone="review" />
          <MetricCard label="Incomplete applications" value={String(incompleteApplications)} tone="attention" />
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Private signup link</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="rounded-lg bg-sky-soft px-3 py-2 font-mono text-sm text-ink">/agent-onboarding</code>
            <button type="button" onClick={copyPrivateLink} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">
              <ClipboardText size={17} weight="bold" />
              Copy link
            </button>
          </div>
        </div>
      </div>

      {(agentError || onboardingError || error || message) && (
        <div className="grid gap-3">
          {agentError && <Notice tone="error">Could not load locator agents: {agentError}</Notice>}
          {onboardingError && (
            <Notice tone="warning">
              Agent applications are not available yet: {onboardingError}. Apply the onboarding Supabase migration to enable private signup submissions and document uploads.
            </Notice>
          )}
          {error && <Notice tone="error">{error}</Notice>}
          {message && <Notice tone="success">{message}</Notice>}
        </div>
      )}

      <div className="rounded-3xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-2xl border border-line bg-[#f8fbff] p-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setView("locator")}
                className={`focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${view === "locator" ? "bg-brand text-white" : "border border-line bg-white text-muted hover:text-brand"}`}
              >
                <Storefront size={17} weight="bold" />
                Locator agents
              </button>
              <button
                type="button"
                onClick={() => setView("applications")}
                className={`focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${view === "applications" ? "bg-brand text-white" : "border border-line bg-white text-muted hover:text-brand"}`}
              >
                <UserCircle size={17} weight="bold" />
                Applications
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${view === "applications" ? "bg-white/20 text-white" : "bg-sky-soft text-brand"}`}>
                  {applications.length}
                </span>
              </button>
              {view === "locator" && (
                <button type="button" onClick={resetForm} className="focus-ring ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-muted hover:text-brand">
                  <Plus size={17} weight="bold" />
                  New
                </button>
              )}
            </div>

            <label className="mt-4 flex h-12 items-center gap-3 rounded-xl border border-line bg-white px-4">
              <MagnifyingGlass size={18} className="text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, postcode, email, register reference, missing item..."
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </label>

            {view === "locator" ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <select value={agentStatusFilter} onChange={(event) => setAgentStatusFilter(event.target.value as StatusFilter)} className="h-11 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100">
                  <option value="all">All locator agents</option>
                  <option value="published">Published only</option>
                  <option value="draft">Draft only</option>
                </select>
                <a href="/api/admin/agents/export" className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-brand hover:bg-red-50">
                  <FilePdf size={17} weight="bold" />
                  Export register
                </a>
              </div>
            ) : (
              <select value={applicationStatusFilter} onChange={(event) => setApplicationStatusFilter(event.target.value as ApplicationFilter)} className="mt-3 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100">
                <option value="all">All applications</option>
                {Object.entries(applicationStatusLabels).map(([status, label]) => (
                  <option key={status} value={status}>{label}</option>
                ))}
              </select>
            )}

            <div className="mt-4 max-h-[760px] overflow-y-auto pr-1">
              {view === "locator" ? (
                <AgentList
                  agents={filteredAgents}
                  selectedId={form.id}
                  onSelect={selectAgent}
                  onStatusChange={setAgentStatus}
                  loadingAction={loadingAction}
                />
              ) : (
                <ApplicationList
                  applications={filteredApplications}
                  selectedId={selectedApplication?.id ?? ""}
                  onSelect={selectApplication}
                />
              )}
            </div>
          </aside>

          <section className="min-w-0 rounded-2xl border border-line bg-white">
            {view === "locator" ? (
              <LocatorAgentDetail
                form={form}
                selectedAgent={selectedAgent}
                loadingAction={loadingAction}
                onFieldChange={updateField}
                onSubmit={saveAgent}
                onReset={resetForm}
                onDelete={deleteAgent}
                onStatusChange={setAgentStatus}
              />
            ) : (
              <ApplicationDetail
                application={selectedApplication}
                status={selectedApplication ? statusById[selectedApplication.id] : "draft"}
                notes={selectedApplication ? notesById[selectedApplication.id] ?? "" : ""}
                loadingAction={loadingAction}
                onStatusChange={(application, status) => setStatusById((current) => ({ ...current, [application.id]: status }))}
                onNotesChange={(application, notes) => setNotesById((current) => ({ ...current, [application.id]: notes }))}
                onSaveReview={saveApplicationReview}
                onCreateLocatorDraft={createLocatorDraftFromApplication}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function AgentList({
  agents,
  selectedId,
  onSelect,
  onStatusChange,
  loadingAction,
}: {
  agents: AgentLocation[];
  selectedId: string | null;
  onSelect: (agent: AgentLocation) => void;
  onStatusChange: (agent: AgentLocation, status: AgentLocation["status"]) => void;
  loadingAction: string | null;
}) {
  if (agents.length === 0) {
    return <EmptyState title="No locator agents found" body="Add a new locator agent or clear the filters." />;
  }

  return (
    <div className="grid gap-3">
      {agents.map((agent) => {
        const selected = agent.id === selectedId;
        const address = formatAgentAddress(agent);
        return (
          <article key={agent.id} className={`rounded-2xl border bg-white p-4 transition ${selected ? "border-brand shadow-sm" : "border-line hover:border-red-200"}`}>
            <button type="button" onClick={() => onSelect(agent)} className="block w-full text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-ink">{agent.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{address || "No address"}</p>
                </div>
                <StatusPill status={agent.status} />
              </div>
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onStatusChange(agent, agent.status === "published" ? "draft" : "published")}
                disabled={loadingAction === `agent-status-${agent.id}`}
                className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-bold text-muted hover:text-brand disabled:cursor-wait disabled:opacity-60"
              >
                {agent.status === "published" ? <EyeSlash size={15} weight="bold" /> : <Eye size={15} weight="bold" />}
                {agent.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <a href={`/api/admin/agents/${agent.id}/pdf`} className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-bold text-brand hover:bg-red-50">
                <FilePdf size={15} weight="bold" />
                PDF
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ApplicationList({
  applications,
  selectedId,
  onSelect,
}: {
  applications: AdminAgentApplication[];
  selectedId: string;
  onSelect: (application: AdminAgentApplication) => void;
}) {
  if (applications.length === 0) {
    return <EmptyState title="No applications found" body="Share /agent-onboarding with prospective agents or clear the filters." />;
  }

  return (
    <div className="grid gap-3">
      {applications.map((application) => {
        const missingItems = getApplicationMissingItems(application);
        const selected = application.id === selectedId;
        return (
          <button
            key={application.id}
            type="button"
            onClick={() => onSelect(application)}
            className={`focus-ring rounded-2xl border bg-white p-4 text-left transition ${selected ? "border-brand shadow-sm" : "border-line hover:border-red-200"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-ink">{application.business_name || application.full_name || "Unnamed application"}</h3>
                <p className="mt-1 truncate text-xs text-muted">{application.email || "No email"} · {application.mobile_phone || "No phone"}</p>
              </div>
              <ApplicationStatusPill status={application.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-sky-soft px-2.5 py-1 text-muted">{application.documents.length} file{application.documents.length === 1 ? "" : "s"}</span>
              {missingItems.length > 0 ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">{missingItems.length} missing</span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">Complete</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function LocatorAgentDetail({
  form,
  selectedAgent,
  loadingAction,
  onFieldChange,
  onSubmit,
  onReset,
  onDelete,
  onStatusChange,
}: {
  form: AgentFormState;
  selectedAgent: AgentLocation | null;
  loadingAction: string | null;
  onFieldChange: <K extends keyof AgentFormState>(key: K, value: AgentFormState[K]) => void;
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onDelete: (agent: AgentLocation) => void;
  onStatusChange: (agent: AgentLocation, status: AgentLocation["status"]) => void;
}) {
  const address = selectedAgent ? formatAgentAddress(selectedAgent) : "";

  return (
    <form onSubmit={onSubmit} className="p-5 sm:p-7">
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">{form.id ? "Locator agent" : "New locator agent"}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{form.name || "Add agent details"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Published agents appear on the public locator. Draft agents stay hidden until their address and map details are ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedAgent && (
            <>
              <a href={`/api/admin/agents/${selectedAgent.id}/pdf`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-brand hover:bg-red-50">
                <FilePdf size={17} weight="bold" />
                Download PDF
              </a>
              <button
                type="button"
                onClick={() => onStatusChange(selectedAgent, selectedAgent.status === "published" ? "draft" : "published")}
                disabled={loadingAction === `agent-status-${selectedAgent.id}`}
                className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-muted hover:text-brand disabled:cursor-wait disabled:opacity-60"
              >
                {selectedAgent.status === "published" ? <EyeSlash size={17} weight="bold" /> : <Eye size={17} weight="bold" />}
                {selectedAgent.status === "published" ? "Unpublish" : "Publish"}
              </button>
            </>
          )}
          <button type="button" onClick={onReset} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-muted hover:text-brand">
            <Plus size={17} weight="bold" />
            New
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <TextField label="Agent name" value={form.name} onChange={(value) => onFieldChange("name", value)} required />
        <label>
          <span className="text-sm font-semibold text-ink">Public status</span>
          <select value={form.status} onChange={(event) => onFieldChange("status", event.target.value as AgentFormState["status"])} className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100">
            <option value="published">Published</option>
            <option value="draft">Draft / hidden</option>
          </select>
        </label>
        <TextField label="Address line 1" value={form.address_line_1} onChange={(value) => onFieldChange("address_line_1", value)} required />
        <TextField label="Address line 2" value={form.address_line_2} onChange={(value) => onFieldChange("address_line_2", value)} />
        <TextField label="City" value={form.city} onChange={(value) => onFieldChange("city", value)} required />
        <TextField label="Postcode" value={form.postcode} onChange={(value) => onFieldChange("postcode", value)} />
        <TextField label="Country" value={form.country} onChange={(value) => onFieldChange("country", value)} required />
        <TextField label="Display order" value={form.display_order} onChange={(value) => onFieldChange("display_order", value)} type="number" />
        <TextField label="Phone" value={form.phone} onChange={(value) => onFieldChange("phone", value)} type="tel" />
        <TextField label="Email" value={form.email} onChange={(value) => onFieldChange("email", value)} type="email" />
        <TextField label="Latitude" value={form.latitude} onChange={(value) => onFieldChange("latitude", value)} type="number" step="0.000001" />
        <TextField label="Longitude" value={form.longitude} onChange={(value) => onFieldChange("longitude", value)} type="number" step="0.000001" />
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-semibold text-ink">Opening hours</span>
        <textarea value={form.opening_hours} onChange={(event) => onFieldChange("opening_hours", event.target.value)} rows={3} className="mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100" placeholder="Mon-Fri 09:00-18:00, Sat 10:00-15:00" />
      </label>

      <label className="mt-5 block">
        <span className="text-sm font-semibold text-ink">Services</span>
        <textarea value={form.services} onChange={(event) => onFieldChange("services", event.target.value)} rows={3} className="mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100" placeholder="Customer support, transfer guidance, onboarding" />
      </label>

      {selectedAgent && (
        <div className="mt-5 flex flex-wrap gap-3 rounded-2xl bg-sky-soft p-4">
          <a href={mapsSearchUrl(address)} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand hover:bg-red-50">
            <MapPin size={17} weight="bold" />
            Open map
          </a>
          <a href={`/agents`} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand hover:bg-red-50">
            <ArrowSquareOut size={17} weight="bold" />
            View public locator
          </a>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={loadingAction === "agent-save"} className="focus-ring inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">
          <FloppyDisk size={18} weight="bold" />
          {loadingAction === "agent-save" ? "Saving..." : form.id ? "Save agent" : "Add agent"}
        </button>
        {selectedAgent && (
          <button type="button" onClick={() => onDelete(selectedAgent)} disabled={loadingAction === `agent-delete-${selectedAgent.id}`} className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60">
            <Trash size={18} weight="bold" />
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

function ApplicationDetail({
  application,
  status,
  notes,
  loadingAction,
  onStatusChange,
  onNotesChange,
  onSaveReview,
  onCreateLocatorDraft,
}: {
  application: AdminAgentApplication | null;
  status: AgentApplicationStatus;
  notes: string;
  loadingAction: string | null;
  onStatusChange: (application: AdminAgentApplication, status: AgentApplicationStatus) => void;
  onNotesChange: (application: AdminAgentApplication, notes: string) => void;
  onSaveReview: (application: AdminAgentApplication) => void;
  onCreateLocatorDraft: (application: AdminAgentApplication) => void;
}) {
  if (!application) {
    return (
      <div className="p-8">
        <EmptyState title="No agent application selected" body="Share the private onboarding link. Submitted applications will appear here after the Supabase migration is applied." />
      </div>
    );
  }

  const missingItems = getApplicationMissingItems(application);
  const missingBody = missingItems.length > 0
    ? `Hi ${application.full_name || "there"},\n\nThank you for starting your Hogmall agent registration. Please complete or upload the following so we can continue reviewing your application:\n\n- ${missingItems.join("\n- ")}\n\nYou can return to your private onboarding link to update the application.\n\nKind regards,\nHogmall`
    : "";

  return (
    <div className="p-5 sm:p-7">
      <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="eyebrow">Agent application</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{application.business_name || application.full_name || "Unnamed application"}</h2>
            <ApplicationStatusPill status={application.status} />
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {application.full_name || "No applicant name"} · {application.email || "No email"} · {application.mobile_phone || "No phone"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/admin/agent-applications/${application.id}/documents/combined`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">
            <FilePdf size={17} weight="bold" />
            Download pack PDF
          </a>
          <a href={`/api/admin/agent-applications/${application.id}/forms`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-brand hover:bg-red-50">
            <DownloadSimple size={17} weight="bold" />
            Forms ZIP
          </a>
          <button
            type="button"
            onClick={() => onCreateLocatorDraft(application)}
            disabled={loadingAction === `application-promote-${application.id}`}
            className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-brand hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
          >
            <Storefront size={17} weight="bold" />
            Create locator draft
          </button>
        </div>
      </div>

      <AdminApplicationNextStep application={application} missingItems={missingItems} />

      {missingItems.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-amber-900">
                <WarningCircle size={19} weight="fill" />
                Missing information
              </h3>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">Use this checklist to follow up with the applicant.</p>
            </div>
            {application.email && (
              <a href={`mailto:${application.email}?subject=${encodeURIComponent("Hogmall agent registration - missing information")}&body=${encodeURIComponent(missingBody)}`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-amber-900 hover:bg-amber-100">
                <EnvelopeSimple size={17} weight="bold" />
                Email follow-up
              </a>
            )}
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {missingItems.map((item) => (
              <li key={item} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-amber-950">{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          <CheckCircle size={18} weight="fill" className="mr-2 inline-block" />
          Required details and documents are present.
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-line bg-sky-soft p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Prepared customer forms</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Download the three filled DOCX forms for staff to email back for signature.
            </p>
            {missingItems.length > 0 && (
              <p className="mt-2 text-xs font-semibold leading-5 text-amber-800">
                Some generated forms may contain blank fields until the missing items above are completed.
              </p>
            )}
          </div>
          <a href={`/api/admin/agent-applications/${application.id}/forms`} className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">
            <DownloadSimple size={17} weight="bold" />
            Download all
          </a>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {preparedAgentForms.map((form) => (
            <a key={form.id} href={`/api/admin/agent-applications/${application.id}/forms/${form.id}`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand hover:bg-red-50">
              <DownloadSimple size={16} weight="bold" />
              {form.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Detail label="Business type" value={businessTypeLabels[application.business_type]} />
            <Detail label="Company number" value={application.company_registration_number} />
            <Detail label="Date of birth" value={formatDateOnly(application.date_of_birth)} />
            <Detail label="National Insurance" value={application.national_insurance_number} />
            <Detail label="Citizenship" value={application.citizenship} />
            <Detail label="UK status" value={application.uk_immigration_status} />
            <Detail label="Submitted" value={application.submitted_at ? new Date(application.submitted_at).toLocaleString("en-GB") : "Not submitted"} />
            <Detail label="Updated" value={new Date(application.updated_at).toLocaleString("en-GB")} />
            <Detail label="Residential address" value={application.residential_address} wide />
            <Detail label="Business address" value={formatBusinessAddress(application)} wide />
            <Detail label="Premises" value={`${businessPremisesStatusLabels[application.business_premises_status] ?? application.business_premises_status}${application.premises_occupancy_length ? ` · ${application.premises_occupancy_length}` : ""}`} wide />
            <Detail label="Directors/shareholders" value={application.director_shareholder_details} wide />
            <Detail label="Identity type" value={application.proof_of_identity_type} />
            <Detail label="Right to work required" value={application.right_to_work_required ? "Yes" : "No"} />
            <Detail label="Information accurate consent" value={application.consent_information_accurate ? "Yes" : "No"} />
            <Detail label="Document verification consent" value={application.consent_document_verification ? "Yes" : "No"} />
            <Detail label="Terms accepted" value={application.consent_terms_conditions ? "Yes" : "No"} />
            <Detail label="Applicant notes" value={application.notes} wide />
          </dl>

          <div className="mt-6 rounded-2xl border border-line bg-sky-soft p-4">
            <div className="grid gap-4 lg:grid-cols-[0.65fr_1fr_auto] lg:items-end">
              <label>
                <span className="text-sm font-semibold text-ink">Review status</span>
                <select value={status} onChange={(event) => onStatusChange(application, event.target.value as AgentApplicationStatus)} className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100">
                  {Object.entries(applicationStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-semibold text-ink">Admin notes</span>
                <input value={notes} onChange={(event) => onNotesChange(application, event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100" placeholder="Internal review note" />
              </label>
              <button type="button" onClick={() => onSaveReview(application)} disabled={loadingAction === `application-save-${application.id}`} className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-white hover:bg-[#061b3b] disabled:cursor-wait disabled:opacity-60">
                <FloppyDisk size={18} weight="bold" />
                {loadingAction === `application-save-${application.id}` ? "Saving..." : "Save review"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line">
          <div className="border-b border-line p-4">
            <h3 className="font-semibold text-ink">Uploaded documents</h3>
            <p className="mt-1 text-xs leading-5 text-muted">{application.documents.length} file{application.documents.length === 1 ? "" : "s"} uploaded. Download one file or the full PDF pack.</p>
          </div>
          {application.documents.length === 0 ? (
            <p className="p-4 text-sm leading-6 text-muted">No documents uploaded yet.</p>
          ) : (
            <div className="divide-y divide-line">
              {application.documents.map((document) => (
                <div key={document.id} className="p-4">
                  <p className="text-sm font-semibold text-ink">{document.document_label}</p>
                  <p className="mt-1 break-all text-xs leading-5 text-muted">
                    {document.file_name} · {formatFileSize(document.file_size)}
                  </p>
                  <a href={`/api/admin/agent-applications/${application.id}/documents/${document.id}`} className="focus-ring mt-3 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-brand hover:text-brand-dark">
                    <DownloadSimple size={16} weight="bold" />
                    Download file
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminApplicationNextStep({
  application,
  missingItems,
}: {
  application: AdminAgentApplication;
  missingItems: string[];
}) {
  const hasMissingItems = missingItems.length > 0;
  const submitted = application.status !== "draft";
  const toneClass = hasMissingItems
    ? "border-amber-200 bg-amber-50 text-amber-900"
    : submitted
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-red-200 bg-red-50 text-red-900";
  const title = hasMissingItems
    ? "Staff next step: request missing information"
    : submitted
      ? "Staff next step: send prepared forms for signature"
      : "Staff next step: wait for submission or follow up";
  const body = hasMissingItems
    ? "Use the follow-up email, ask the applicant to return to the private onboarding link, and review again once the required details and uploads are complete."
    : submitted
      ? "Download the Forms ZIP or individual DOCX forms below, then email the Agent Consent Form, Agency Agreement, and Agent Application Form to the applicant for signature."
      : "The applicant has a draft application. Staff can review any saved details and uploads, but the formal next step starts after the applicant submits.";

  return (
    <div className={`mt-5 rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6 opacity-90">{body}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/70 px-3 py-1.5">{application.documents.length} uploaded file{application.documents.length === 1 ? "" : "s"}</span>
          <span className="rounded-full bg-white/70 px-3 py-1.5">{missingItems.length} missing item{missingItems.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: "live" | "draft" | "review" | "attention" }) {
  const toneClass = {
    live: "bg-emerald-50 text-emerald-800",
    draft: "bg-slate-100 text-slate-700",
    review: "bg-red-50 text-brand",
    attention: "bg-amber-50 text-amber-800",
  }[tone];

  return (
    <article className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <p className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${toneClass}`}>{value}</p>
      <p className="mt-3 text-sm font-semibold text-ink">{label}</p>
    </article>
  );
}

function StatusPill({ status }: { status: AgentLocation["status"] }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function ApplicationStatusPill({ status }: { status: AgentApplicationStatus }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] ${applicationStatusClass(status)}`}>
      {applicationStatusLabels[status]}
    </span>
  );
}

function Notice({ tone, children }: { tone: "success" | "warning" | "error"; children: React.ReactNode }) {
  const className = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-700",
  }[tone];

  return <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${className}`}>{children}</p>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-6 text-center">
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}

function Detail({ label, value, wide = false }: { label: string; value: string | null | undefined; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-ink">{value || "Not provided"}</dd>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-ink">{label}{required ? " *" : ""}</span>
      <input
        type={type}
        required={required}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100"
      />
    </label>
  );
}

function agentToForm(agent: AgentLocation | null): AgentFormState {
  if (!agent) {
    return blankForm;
  }

  return {
    id: agent.id,
    name: agent.name,
    address_line_1: agent.address_line_1,
    address_line_2: agent.address_line_2 || "",
    city: agent.city,
    postcode: agent.postcode || "",
    country: agent.country,
    phone: agent.phone || "",
    email: agent.email || "",
    opening_hours: agent.opening_hours || "",
    services: agent.services || "",
    latitude: agent.latitude === null ? "" : String(agent.latitude),
    longitude: agent.longitude === null ? "" : String(agent.longitude),
    status: agent.status,
    display_order: String(agent.display_order),
  };
}

function agentFormToPayload(form: AgentFormState) {
  return {
    name: form.name.trim(),
    address_line_1: form.address_line_1.trim(),
    address_line_2: emptyToNull(form.address_line_2),
    city: form.city.trim(),
    postcode: emptyToNull(form.postcode),
    country: form.country.trim() || "United Kingdom",
    phone: emptyToNull(form.phone),
    email: emptyToNull(form.email),
    opening_hours: emptyToNull(form.opening_hours),
    services: emptyToNull(form.services),
    latitude: numberOrNull(form.latitude),
    longitude: numberOrNull(form.longitude),
    status: form.status,
    display_order: Number.parseInt(form.display_order, 10) || 0,
  };
}

function getApplicationMissingItems(application: AdminAgentApplication) {
  const requiredFields: Array<[string, unknown]> = [
    ["Full name", application.full_name],
    ["Mobile phone", application.mobile_phone],
    ["Email address", application.email],
    ["Date of birth", application.date_of_birth],
    ["Residential address", application.residential_address],
    ["National Insurance number", application.national_insurance_number],
    ["Citizenship", application.citizenship],
    ["Business name", application.business_name],
    ["Business address line 1", application.business_address_line_1],
    ["Business city", application.business_city],
    ["Premises occupancy length", application.premises_occupancy_length],
  ];

  const missing = requiredFields
    .filter(([, value]) => !String(value || "").trim())
    .map(([label]) => label);

  if (application.business_type === "limited_company" && !application.company_registration_number?.trim()) {
    missing.push("Company registration number");
  }

  if (!application.consent_information_accurate) {
    missing.push("Information accuracy consent");
  }

  if (!application.consent_document_verification) {
    missing.push("Document verification consent");
  }

  if (!application.consent_terms_conditions) {
    missing.push("Terms and conditions consent");
  }

  const missingDocuments = getMissingRequiredDocuments(application, application.documents)
    .map((type) => getDocumentRequirement(type)?.label ?? type);

  return [...missing, ...missingDocuments];
}

function formatBusinessAddress(application: AgentApplication) {
  return [
    application.business_address_line_1,
    application.business_address_line_2,
    application.business_city,
    application.business_postcode,
    application.business_country,
  ].filter(Boolean).join(", ");
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function applicationStatusClass(status: AgentApplicationStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "submitted":
    case "under_review":
      return "bg-red-100 text-red-800";
    case "more_info_required":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function numberOrNull(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
