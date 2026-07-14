"use client";

import { CheckCircle, FileArrowUp, SignOut, Trash, WarningCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AGENT_APPLICATION_BUCKET,
  applicationStatusLabels,
  businessPremisesStatusLabels,
  businessTypeLabels,
  formatFileSize,
  getDocumentRequirement,
  getMissingRequiredDocuments,
  getRequiredDocumentTypes,
  onboardingDocumentRequirements,
  safeStorageFileName,
} from "@/lib/agent-onboarding";
import { createClient } from "@/lib/supabase/client";
import type {
  AgentApplication,
  AgentApplicationDocument,
  AgentApplicationDocumentType,
  AgentApplicationStatus,
  AgentBusinessPremisesStatus,
  AgentBusinessType,
} from "@/lib/types";

type FormState = {
  full_name: string;
  mobile_phone: string;
  email: string;
  date_of_birth: string;
  residential_address: string;
  national_insurance_number: string;
  citizenship: string;
  uk_immigration_status: string;
  business_type: AgentBusinessType;
  business_name: string;
  company_registration_number: string;
  business_address_line_1: string;
  business_address_line_2: string;
  business_city: string;
  business_postcode: string;
  business_country: string;
  business_premises_status: AgentBusinessPremisesStatus;
  premises_occupancy_length: string;
  director_shareholder_details: string;
  proof_of_identity_type: string;
  right_to_work_required: boolean;
  notes: string;
  consent_information_accurate: boolean;
  consent_document_verification: boolean;
  consent_terms_conditions: boolean;
};

const allowedUploadTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxUploadSize = 10 * 1024 * 1024;

export function AgentOnboardingForm({
  userId,
  userEmail,
  initialApplication,
  initialDocuments,
}: {
  userId: string;
  userEmail: string;
  initialApplication: AgentApplication | null;
  initialDocuments: AgentApplicationDocument[];
}) {
  const router = useRouter();
  const [application, setApplication] = useState<AgentApplication | null>(initialApplication);
  const [documents, setDocuments] = useState(initialDocuments);
  const [form, setForm] = useState<FormState>(() => applicationToForm(initialApplication, userEmail));
  const [saving, setSaving] = useState(false);
  const [uploadingType, setUploadingType] = useState<AgentApplicationDocumentType | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentStatus = application?.status ?? "draft";

  const missingDocumentTypes = useMemo(
    () => getMissingRequiredDocuments({
      business_type: form.business_type,
      right_to_work_required: form.right_to_work_required,
    }, documents),
    [documents, form.business_type, form.right_to_work_required],
  );
  const requiredDocumentTypes = useMemo(
    () => getRequiredDocumentTypes({
      business_type: form.business_type,
      right_to_work_required: form.right_to_work_required,
    }),
    [form.business_type, form.right_to_work_required],
  );
  const uploadedRequiredDocumentCount = useMemo(() => {
    const uploadedTypes = new Set(documents.map((document) => document.document_type));
    return requiredDocumentTypes.filter((type) => uploadedTypes.has(type)).length;
  }, [documents, requiredDocumentTypes]);
  const saveStatus = currentStatus === "draft" ? "draft" : currentStatus;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveApplication(nextStatus: AgentApplicationStatus = "draft", options?: { silent?: boolean }) {
    setSaving(true);
    setError(null);
    if (!options?.silent) {
      setMessage(null);
    }

    const payload = {
      user_id: userId,
      status: nextStatus,
      full_name: form.full_name.trim(),
      mobile_phone: form.mobile_phone.trim(),
      email: form.email.trim().toLowerCase(),
      date_of_birth: emptyToNull(form.date_of_birth),
      residential_address: emptyToNull(form.residential_address),
      national_insurance_number: emptyToNull(form.national_insurance_number),
      citizenship: emptyToNull(form.citizenship),
      uk_immigration_status: emptyToNull(form.uk_immigration_status),
      business_type: form.business_type,
      business_name: form.business_name.trim(),
      company_registration_number: emptyToNull(form.company_registration_number),
      business_address_line_1: emptyToNull(form.business_address_line_1),
      business_address_line_2: emptyToNull(form.business_address_line_2),
      business_city: emptyToNull(form.business_city),
      business_postcode: emptyToNull(form.business_postcode),
      business_country: form.business_country.trim() || "United Kingdom",
      business_premises_status: form.business_premises_status,
      premises_occupancy_length: emptyToNull(form.premises_occupancy_length),
      director_shareholder_details: emptyToNull(form.director_shareholder_details),
      proof_of_identity_type: emptyToNull(form.proof_of_identity_type),
      right_to_work_required: form.right_to_work_required,
      notes: emptyToNull(form.notes),
      consent_information_accurate: form.consent_information_accurate,
      consent_document_verification: form.consent_document_verification,
      consent_terms_conditions: form.consent_terms_conditions,
      submitted_at: nextStatus === "submitted" ? new Date().toISOString() : application?.submitted_at ?? null,
    };

    const validationError = validateDetails(payload, nextStatus);

    if (validationError) {
      setError(validationError);
      setSaving(false);
      return null;
    }

    const supabase = createClient();
    const result = application
      ? await supabase
        .from("agent_applications")
        .update(payload)
        .eq("id", application.id)
        .eq("user_id", userId)
        .select("*")
        .single()
      : await supabase
        .from("agent_applications")
        .insert(payload)
        .select("*")
        .single();

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return null;
    }

    const savedApplication = result.data as AgentApplication;
    setApplication(savedApplication);
    setSaving(false);

    if (!options?.silent) {
      setMessage(nextStatus === "submitted"
        ? "Application submitted. Xogmall will review the details and may email the prepared forms for signature."
        : "Application saved.");
    }

    router.refresh();
    return savedApplication;
  }

  async function submitApplication() {
    setError(null);
    setMessage(null);

    const detailError = validateDetails({
      full_name: form.full_name.trim(),
      mobile_phone: form.mobile_phone.trim(),
      email: form.email.trim(),
      date_of_birth: emptyToNull(form.date_of_birth),
      residential_address: emptyToNull(form.residential_address),
      national_insurance_number: emptyToNull(form.national_insurance_number),
      citizenship: emptyToNull(form.citizenship),
      business_name: form.business_name.trim(),
      business_type: form.business_type,
      company_registration_number: emptyToNull(form.company_registration_number),
      business_address_line_1: emptyToNull(form.business_address_line_1),
      business_city: emptyToNull(form.business_city),
      premises_occupancy_length: emptyToNull(form.premises_occupancy_length),
      consent_information_accurate: form.consent_information_accurate,
      consent_document_verification: form.consent_document_verification,
      consent_terms_conditions: form.consent_terms_conditions,
    }, "submitted");

    if (detailError) {
      setError(detailError);
      return;
    }

    if (missingDocumentTypes.length > 0) {
      const labels = missingDocumentTypes
        .map((type) => getDocumentRequirement(type)?.label ?? type)
        .join(", ");
      setError(`Upload the missing required documents before submitting: ${labels}.`);
      return;
    }

    await saveApplication("submitted");
  }

  async function uploadDocument(type: AgentApplicationDocumentType, files: FileList | null) {
    const file = files?.[0];

    if (!file) {
      return;
    }

    setUploadingType(type);
    setError(null);
    setMessage(null);

    if (!allowedUploadTypes.includes(file.type)) {
      setError("Please upload documents as PDF, JPG, or PNG files.");
      setUploadingType(null);
      return;
    }

    if (file.size > maxUploadSize) {
      setError("Each document must be 10MB or smaller.");
      setUploadingType(null);
      return;
    }

    const savedApplication = application ?? await saveApplication("draft", { silent: true });

    if (!savedApplication) {
      setUploadingType(null);
      return;
    }

    const requirement = getDocumentRequirement(type);
    const safeName = safeStorageFileName(file.name);
    const filePath = createUploadPath(userId, savedApplication.id, type, safeName);
    const supabase = createClient();

    const uploadResult = await supabase.storage
      .from(AGENT_APPLICATION_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
      });

    if (uploadResult.error) {
      setError(uploadResult.error.message);
      setUploadingType(null);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("agent_application_documents")
      .insert({
        application_id: savedApplication.id,
        user_id: userId,
        document_type: type,
        document_label: requirement?.label ?? "Supporting document",
        file_name: file.name,
        file_path: filePath,
        content_type: file.type,
        file_size: file.size,
      })
      .select("*")
      .single();

    if (insertError) {
      await supabase.storage.from(AGENT_APPLICATION_BUCKET).remove([filePath]);
      setError(insertError.message);
      setUploadingType(null);
      return;
    }

    setDocuments((current) => [data as AgentApplicationDocument, ...current]);
    setMessage(`${requirement?.label ?? "Document"} uploaded.`);
    setUploadingType(null);
    router.refresh();
  }

  async function deleteDocument(document: AgentApplicationDocument) {
    if (!window.confirm(`Remove ${document.file_name}?`)) {
      return;
    }

    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { error: removeError } = await supabase.storage
      .from(AGENT_APPLICATION_BUCKET)
      .remove([document.file_path]);

    if (removeError) {
      setError(removeError.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from("agent_application_documents")
      .delete()
      .eq("id", document.id)
      .eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setDocuments((current) => current.filter((item) => item.id !== document.id));
    setMessage("Document removed.");
    router.refresh();
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Private agent onboarding</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">
            Complete your agent registration.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
            Save your details, upload the required verification documents, then submit your application for Xogmall review.
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="focus-ring inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-muted hover:text-brand"
        >
          <SignOut size={18} weight="bold" />
          Sign out
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] ${statusClass(application?.status ?? "draft")}`}>
            {applicationStatusLabels[currentStatus]}
          </span>
          {application?.submitted_at && (
            <span className="text-xs font-semibold text-muted">
              Submitted {new Date(application.submitted_at).toLocaleString("en-GB")}
            </span>
          )}
        </div>
      </div>

      <ApplicantProgressPanel
        status={currentStatus}
        submittedAt={application?.submitted_at ?? null}
        missingDocumentCount={missingDocumentTypes.length}
        uploadedRequiredDocumentCount={uploadedRequiredDocumentCount}
        requiredDocumentCount={requiredDocumentTypes.length}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <form className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <SectionTitle title="Personal information" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <TextField label="Full name" value={form.full_name} onChange={(value) => updateField("full_name", value)} required />
            <TextField label="Date of birth" value={form.date_of_birth} onChange={(value) => updateField("date_of_birth", value)} required type="date" />
            <TextField label="Mobile phone number" value={form.mobile_phone} onChange={(value) => updateField("mobile_phone", value)} required type="tel" />
            <TextField label="Email address" value={form.email} onChange={(value) => updateField("email", value)} required type="email" />
            <label>
              <span className="text-sm font-semibold text-ink">Proof of identity type</span>
              <select value={form.proof_of_identity_type} onChange={(event) => updateField("proof_of_identity_type", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100">
                <option value="">Select ID type</option>
                <option value="Passport">Passport</option>
                <option value="EU/EEA national identity card">EU/EEA national identity card</option>
                <option value="UK BRP/BRC">UK BRP/BRC</option>
                <option value="UK photo driving licence">UK photo driving licence</option>
              </select>
            </label>
            <TextField label="National Insurance number" value={form.national_insurance_number} onChange={(value) => updateField("national_insurance_number", value)} required />
            <TextField label="Citizenship" value={form.citizenship} onChange={(value) => updateField("citizenship", value)} required placeholder="British" />
            <TextField label="UK status if non-UK citizen" value={form.uk_immigration_status} onChange={(value) => updateField("uk_immigration_status", value)} />
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-ink">Residential address *</span>
            <textarea
              value={form.residential_address}
              onChange={(event) => updateField("residential_address", event.target.value)}
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100"
            />
          </label>

          <label className="mt-5 flex gap-3 rounded-2xl border border-line bg-sky-soft p-4 text-sm leading-6 text-muted">
            <input
              type="checkbox"
              checked={form.right_to_work_required}
              onChange={(event) => updateField("right_to_work_required", event.target.checked)}
              className="mt-1 size-4 accent-brand"
            />
            I do not hold a UK passport and need to upload right-to-work evidence.
          </label>

          <SectionTitle title="Business information" className="mt-8" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-sm font-semibold text-ink">Business type</span>
              <select value={form.business_type} onChange={(event) => updateField("business_type", event.target.value as AgentBusinessType)} className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100">
                <option value="limited_company">{businessTypeLabels.limited_company}</option>
                <option value="sole_trader">{businessTypeLabels.sole_trader}</option>
              </select>
            </label>
            <TextField label="Business name" value={form.business_name} onChange={(value) => updateField("business_name", value)} required />
            {form.business_type === "limited_company" && (
              <TextField label="Company registration number" value={form.company_registration_number} onChange={(value) => updateField("company_registration_number", value)} required />
            )}
            <label>
              <span className="text-sm font-semibold text-ink">Business premises</span>
              <select value={form.business_premises_status} onChange={(event) => updateField("business_premises_status", event.target.value as AgentBusinessPremisesStatus)} className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100">
                {Object.entries(businessPremisesStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <TextField label="Length of occupancy at premises" value={form.premises_occupancy_length} onChange={(value) => updateField("premises_occupancy_length", value)} required placeholder="4 Years" />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <TextField label="Business address line 1" value={form.business_address_line_1} onChange={(value) => updateField("business_address_line_1", value)} required />
            <TextField label="Business address line 2" value={form.business_address_line_2} onChange={(value) => updateField("business_address_line_2", value)} />
            <TextField label="Business city" value={form.business_city} onChange={(value) => updateField("business_city", value)} required />
            <TextField label="Business postcode" value={form.business_postcode} onChange={(value) => updateField("business_postcode", value)} />
            <TextField label="Business country" value={form.business_country} onChange={(value) => updateField("business_country", value)} required />
          </div>

          {form.business_type === "limited_company" && (
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-ink">Directors and shareholders</span>
              <textarea
                value={form.director_shareholder_details}
                onChange={(event) => updateField("director_shareholder_details", event.target.value)}
                rows={4}
                className="mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100"
                placeholder="List directors/shareholders and their roles."
              />
            </label>
          )}

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-ink">Additional notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={4}
              className="mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100"
              placeholder="Anything Xogmall should know about your application."
            />
          </label>

          <div className="mt-6 grid gap-3">
            <label className="flex gap-3 text-sm leading-6 text-muted">
              <input type="checkbox" checked={form.consent_information_accurate} onChange={(event) => updateField("consent_information_accurate", event.target.checked)} className="mt-1 size-4 accent-brand" />
              I confirm the information I have provided is accurate and complete.
            </label>
            <label className="flex gap-3 text-sm leading-6 text-muted">
              <input type="checkbox" checked={form.consent_document_verification} onChange={(event) => updateField("consent_document_verification", event.target.checked)} className="mt-1 size-4 accent-brand" />
              I consent to Xogmall reviewing these documents for agent onboarding and verification.
            </label>
            <label className="flex gap-3 text-sm leading-6 text-muted">
              <input type="checkbox" checked={form.consent_terms_conditions} onChange={(event) => updateField("consent_terms_conditions", event.target.checked)} className="mt-1 size-4 accent-brand" />
              I agree to the Xogmall agent terms and conditions.
            </label>
          </div>

          {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => saveApplication(saveStatus)} disabled={saving} className="focus-ring inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-line bg-white px-5 text-sm font-semibold text-ink hover:text-brand disabled:cursor-wait disabled:opacity-60">
              {saving ? "Saving..." : currentStatus === "draft" ? "Save draft" : "Save changes"}
            </button>
            <button type="button" onClick={submitApplication} disabled={saving} className="focus-ring inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">
              {currentStatus === "more_info_required" ? "Resubmit for review" : "Submit for review"}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <SectionTitle title="Document uploads" />
          <p className="mt-3 text-sm leading-6 text-muted">
            Upload the required documents as PDF, JPG, or PNG. Optional documents can be added now or requested by Xogmall later.
          </p>

          <div className="mt-6 grid gap-4">
            {onboardingDocumentRequirements.map((requirement) => {
              const requirementDocuments = documents.filter((document) => document.document_type === requirement.type);
              const isRequired = requiredDocumentTypes.includes(requirement.type);
              const isOptional = requirement.requiredFor === "optional";
              const isConditionalRightToWork = requirement.type === "right_to_work" && !form.right_to_work_required;
              const isLimitedCompanyOnly = requirement.requiredFor === "limited_company" && form.business_type !== "limited_company";

              if (requirement.requiredFor === "conditional" && requirement.type !== "right_to_work" && requirementDocuments.length === 0) {
                return null;
              }

              if (isLimitedCompanyOnly) {
                return null;
              }

              return (
                <article key={requirement.type} className="rounded-2xl border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-ink">{requirement.label}</h3>
                        {requirementDocuments.length > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle size={14} weight="fill" /> Uploaded
                          </span>
                        ) : isRequired && !isConditionalRightToWork ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                            <WarningCircle size={14} weight="fill" /> Required
                          </span>
                        ) : isOptional ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Optional</span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Conditional</span>
                        )}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted">{requirement.description}</p>
                    </div>
                  </div>

                  <label className="focus-within:ring-3 mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-brand focus-within:ring-blue-100 hover:bg-blue-100">
                    <FileArrowUp size={18} weight="bold" />
                    {uploadingType === requirement.type ? "Uploading..." : "Upload document"}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className="sr-only"
                      disabled={uploadingType === requirement.type}
                      onChange={(event) => uploadDocument(requirement.type, event.target.files)}
                    />
                  </label>

                  {requirementDocuments.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {requirementDocuments.map((document) => (
                        <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sky-soft px-3 py-2">
                          <span className="min-w-0 truncate text-xs font-semibold text-ink">
                            {document.file_name} <span className="font-normal text-muted">({formatFileSize(document.file_size)})</span>
                          </span>
                          <button type="button" onClick={() => deleteDocument(document)} className="focus-ring inline-flex items-center gap-1 rounded-lg text-xs font-bold text-red-700 hover:text-red-800">
                            <Trash size={14} weight="bold" /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicantProgressPanel({
  status,
  submittedAt,
  missingDocumentCount,
  uploadedRequiredDocumentCount,
  requiredDocumentCount,
}: {
  status: AgentApplicationStatus;
  submittedAt: string | null;
  missingDocumentCount: number;
  uploadedRequiredDocumentCount: number;
  requiredDocumentCount: number;
}) {
  const submitted = status !== "draft";
  const completeUploads = missingDocumentCount === 0;
  const formsReady = submitted && completeUploads && status !== "more_info_required" && status !== "rejected";
  const copy = getApplicantStatusCopy(status, missingDocumentCount, submittedAt);

  return (
    <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="eyebrow">Application progress</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{copy.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{copy.body}</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${completeUploads ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
          {uploadedRequiredDocumentCount} of {requiredDocumentCount} required upload{requiredDocumentCount === 1 ? "" : "s"} received
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ApplicantStep done title="Account created" body="You are signed in with the private Xogmall onboarding link." />
        <ApplicantStep
          done={completeUploads && Boolean(submittedAt)}
          active={status === "draft" || !completeUploads || status === "more_info_required"}
          title="Details and uploads"
          body={completeUploads ? "Required uploads are present." : `${missingDocumentCount} required upload${missingDocumentCount === 1 ? "" : "s"} still needed.`}
        />
        <ApplicantStep
          done={submitted && status !== "more_info_required"}
          active={status === "draft" || status === "more_info_required"}
          title="Submit for review"
          body={submitted ? "Xogmall has received your application." : "Submit when all required fields and documents are ready."}
        />
        <ApplicantStep
          done={status === "approved"}
          active={formsReady}
          title="Prepared forms"
          body="Xogmall staff will email the consent form, agency agreement, and application form for signature."
        />
      </div>
    </section>
  );
}

function ApplicantStep({
  title,
  body,
  done = false,
  active = false,
}: {
  title: string;
  body: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${done ? "border-emerald-200 bg-emerald-50" : active ? "border-blue-200 bg-blue-50" : "border-line bg-sky-soft"}`}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex size-7 items-center justify-center rounded-full ${done ? "bg-emerald-600 text-white" : active ? "bg-brand text-white" : "bg-white text-muted"}`}>
          {done ? <CheckCircle size={17} weight="fill" /> : active ? <WarningCircle size={17} weight="fill" /> : <span className="size-2 rounded-full bg-current" />}
        </span>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">{body}</p>
    </div>
  );
}

function getApplicantStatusCopy(status: AgentApplicationStatus, missingDocumentCount: number, submittedAt: string | null) {
  if (status === "more_info_required") {
    return {
      title: "Xogmall needs more information.",
      body: "Update the missing details or uploads, then resubmit the application for review.",
    };
  }

  if (status === "submitted" || status === "under_review") {
    return {
      title: "Your application is with Xogmall.",
      body: missingDocumentCount > 0
        ? "Staff can see the application, but some required uploads are still missing. Add them here so the prepared forms can be completed properly."
        : "Staff can review the details and prepare the Agent Consent Form, Agency Agreement, and Agent Application Form for signature.",
    };
  }

  if (status === "approved") {
    return {
      title: "Your agent application has been approved.",
      body: "Xogmall will confirm the next operating steps directly with you.",
    };
  }

  if (status === "rejected") {
    return {
      title: "This application could not be approved.",
      body: "Contact Xogmall if you need clarification about the decision.",
    };
  }

  return {
    title: "Complete your details and required uploads.",
    body: submittedAt
      ? "Your previous submission is saved. Update any requested details and submit again when everything is ready."
      : "You can save progress and return to this private link before submitting the application to Xogmall.",
  };
}

function SectionTitle({ title, className = "" }: { title: string; className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow">{title}</p>
      <div className="mt-3 h-px bg-line" />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-ink">{label}{required ? " *" : ""}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100"
      />
    </label>
  );
}

function applicationToForm(application: AgentApplication | null, userEmail: string): FormState {
  return {
    full_name: application?.full_name ?? "",
    mobile_phone: application?.mobile_phone ?? "",
    email: application?.email ?? userEmail,
    date_of_birth: application?.date_of_birth ?? "",
    residential_address: application?.residential_address ?? "",
    national_insurance_number: application?.national_insurance_number ?? "",
    citizenship: application?.citizenship ?? "",
    uk_immigration_status: application?.uk_immigration_status ?? "",
    business_type: application?.business_type ?? "limited_company",
    business_name: application?.business_name ?? "",
    company_registration_number: application?.company_registration_number ?? "",
    business_address_line_1: application?.business_address_line_1 ?? "",
    business_address_line_2: application?.business_address_line_2 ?? "",
    business_city: application?.business_city ?? "",
    business_postcode: application?.business_postcode ?? "",
    business_country: application?.business_country ?? "United Kingdom",
    business_premises_status: application?.business_premises_status ?? "leased",
    premises_occupancy_length: application?.premises_occupancy_length ?? "",
    director_shareholder_details: application?.director_shareholder_details ?? "",
    proof_of_identity_type: application?.proof_of_identity_type ?? "",
    right_to_work_required: application?.right_to_work_required ?? false,
    notes: application?.notes ?? "",
    consent_information_accurate: application?.consent_information_accurate ?? false,
    consent_document_verification: application?.consent_document_verification ?? false,
    consent_terms_conditions: application?.consent_terms_conditions ?? false,
  };
}

function validateDetails(payload: Record<string, unknown>, status: AgentApplicationStatus) {
  if (!payload.full_name || !payload.mobile_phone || !payload.email) {
    return "Full name, mobile number, and email address are required.";
  }

  if (!payload.business_name || !payload.business_address_line_1 || !payload.business_city) {
    return "Business name, business address line 1, and business city are required.";
  }

  if (payload.business_type === "limited_company" && !payload.company_registration_number) {
    return "Company registration number is required for limited company applications.";
  }

  if (status === "submitted" && (!payload.date_of_birth || !payload.residential_address || !payload.national_insurance_number || !payload.citizenship || !payload.premises_occupancy_length)) {
    return "Date of birth, residential address, National Insurance number, citizenship, and premises occupancy length are required.";
  }

  if (status === "submitted" && (!payload.consent_information_accurate || !payload.consent_document_verification || !payload.consent_terms_conditions)) {
    return "Please tick all consent and terms confirmations before submitting.";
  }

  return null;
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function createUploadPath(userId: string, applicationId: string, type: AgentApplicationDocumentType, fileName: string) {
  return `${userId}/${applicationId}/${type}-${Date.now()}-${fileName}`;
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
