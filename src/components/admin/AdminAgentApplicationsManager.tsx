"use client";

import { DownloadSimple, FilePdf, FloppyDisk } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  applicationStatusLabels,
  businessPremisesStatusLabels,
  businessTypeLabels,
  formatFileSize,
} from "@/lib/agent-onboarding";
import { preparedAgentForms } from "@/lib/agent-form-definitions";
import { createClient } from "@/lib/supabase/client";
import type {
  AgentApplication,
  AgentApplicationDocument,
  AgentApplicationStatus,
} from "@/lib/types";

export type AdminAgentApplication = AgentApplication & {
  documents: AgentApplicationDocument[];
};

export function AdminAgentApplicationsManager({
  applications,
  adminUserId,
}: {
  applications: AdminAgentApplication[];
  adminUserId: string;
}) {
  const router = useRouter();
  const [statusById, setStatusById] = useState<Record<string, AgentApplicationStatus>>(
    Object.fromEntries(applications.map((application) => [application.id, application.status])),
  );
  const [notesById, setNotesById] = useState<Record<string, string>>(
    Object.fromEntries(applications.map((application) => [application.id, application.admin_notes ?? ""])),
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedApplications = useMemo(
    () => [...applications].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)),
    [applications],
  );

  async function saveReview(application: AdminAgentApplication) {
    setSavingId(application.id);
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
      setSavingId(null);
      return;
    }

    setMessage(`Updated ${application.full_name || application.business_name}.`);
    setSavingId(null);
    router.refresh();
  }

  if (sortedApplications.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">No agent applications yet.</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Share the private <code className="rounded bg-sky-soft px-2 py-1 font-mono text-xs text-ink">/agent-onboarding</code> link with potential agents. Submitted applications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

      {sortedApplications.map((application) => (
        <article key={application.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="border-b border-line p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-ink">
                    {application.business_name || application.full_name || "Unnamed application"}
                  </h2>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] ${statusClass(application.status)}`}>
                    {applicationStatusLabels[application.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {application.full_name || "No name"} · {application.email || "No email"} · {application.mobile_phone || "No phone"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`/api/admin/agent-applications/${application.id}/documents/combined`}
                  className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  <FilePdf size={18} weight="bold" />
                  Download pack PDF
                </a>
                <a
                  href={`/api/admin/agent-applications/${application.id}/forms`}
                  className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-brand hover:bg-blue-50"
                >
                  <DownloadSimple size={18} weight="bold" />
                  Forms ZIP
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[1fr_0.8fr]">
            <div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Business type" value={businessTypeLabels[application.business_type]} />
                <Detail label="Company number" value={application.company_registration_number} />
                <Detail label="Date of birth" value={formatDateOnly(application.date_of_birth)} />
                <Detail label="National Insurance" value={application.national_insurance_number} />
                <Detail label="Citizenship" value={application.citizenship} />
                <Detail label="Submitted" value={application.submitted_at ? new Date(application.submitted_at).toLocaleString("en-GB") : "Not submitted"} />
                <Detail label="Updated" value={new Date(application.updated_at).toLocaleString("en-GB")} />
                <Detail label="Residential address" value={application.residential_address} wide />
                <Detail label="Business address" value={formatBusinessAddress(application)} wide />
                <Detail label="Premises" value={`${businessPremisesStatusLabels[application.business_premises_status] ?? application.business_premises_status}${application.premises_occupancy_length ? ` · ${application.premises_occupancy_length}` : ""}`} wide />
                <Detail label="Directors/shareholders" value={application.director_shareholder_details} wide />
                <Detail label="Identity type" value={application.proof_of_identity_type} />
                <Detail label="Right to work required" value={application.right_to_work_required ? "Yes" : "No"} />
                <Detail label="Applicant notes" value={application.notes} wide />
              </dl>

              <div className="mt-6 rounded-2xl border border-line bg-sky-soft p-4">
                <div className="flex flex-wrap gap-2">
                  {preparedAgentForms.map((form) => (
                    <a key={form.id} href={`/api/admin/agent-applications/${application.id}/forms/${form.id}`} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand hover:bg-blue-50">
                      <DownloadSimple size={16} weight="bold" />
                      {form.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-line bg-sky-soft p-4">
                <div className="grid gap-4 sm:grid-cols-[0.7fr_1fr_auto] sm:items-end">
                  <label>
                    <span className="text-sm font-semibold text-ink">Review status</span>
                    <select
                      value={statusById[application.id]}
                      onChange={(event) => setStatusById((current) => ({ ...current, [application.id]: event.target.value as AgentApplicationStatus }))}
                      className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100"
                    >
                      {Object.entries(applicationStatusLabels).map(([status, label]) => (
                        <option key={status} value={status}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="text-sm font-semibold text-ink">Admin notes</span>
                    <input
                      value={notesById[application.id] ?? ""}
                      onChange={(event) => setNotesById((current) => ({ ...current, [application.id]: event.target.value }))}
                      className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100"
                      placeholder="Internal review note"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => saveReview(application)}
                    disabled={savingId === application.id}
                    className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-white hover:bg-[#061b3b] disabled:cursor-wait disabled:opacity-60"
                  >
                    <FloppyDisk size={18} weight="bold" />
                    {savingId === application.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line">
              <div className="border-b border-line p-4">
                <h3 className="font-semibold text-ink">Uploaded documents</h3>
                <p className="mt-1 text-xs leading-5 text-muted">{application.documents.length} file{application.documents.length === 1 ? "" : "s"} uploaded</p>
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
                      <a
                        href={`/api/admin/agent-applications/${application.id}/documents/${document.id}`}
                        className="focus-ring mt-3 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-brand hover:text-brand-dark"
                      >
                        <DownloadSimple size={16} weight="bold" />
                        Download file
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
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

function statusClass(status: AgentApplicationStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "submitted":
    case "under_review":
      return "bg-blue-100 text-blue-800";
    case "more_info_required":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
