import { readFile } from "fs/promises";
import path from "path";
import JSZip from "jszip";
import {
  getPreparedAgentForm,
  preparedAgentForms,
  type PreparedAgentForm,
  type PreparedAgentFormId,
} from "@/lib/agent-form-definitions";
import type { AgentApplication, AgentApplicationDocument } from "@/lib/types";
type ApplicationWithDocuments = AgentApplication & {
  agent_application_documents?: AgentApplicationDocument[];
};

export async function createPreparedAgentFormDocx(
  formId: PreparedAgentFormId,
  application: AgentApplication,
  documents: AgentApplicationDocument[] = [],
) {
  const form = getPreparedAgentForm(formId);

  if (!form) {
    throw new Error("Unknown prepared form.");
  }

  const templatePath = path.join(process.cwd(), "src", "templates", "agent-forms", form.templateFileName);
  const template = await readFile(templatePath);
  const zip = await JSZip.loadAsync(template);
  const documentFile = zip.file("word/document.xml");

  if (!documentFile) {
    throw new Error("DOCX template is missing word/document.xml.");
  }

  const documentXml = await documentFile.async("string");
  const values = getPreparedFormValues(application);
  const nextXml = applyTemplateValues(documentXml, values, application, documents);

  zip.file("word/document.xml", nextXml);

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export async function createPreparedAgentFormsZip(
  application: AgentApplication,
  documents: AgentApplicationDocument[] = [],
) {
  const zip = new JSZip();
  const baseName = safePreparedFormFilePart(application.business_name || application.full_name || "application");

  for (const form of preparedAgentForms) {
    const bytes = await createPreparedAgentFormDocx(form.id, application, documents);
    zip.file(`${baseName}-${form.fileName}`, bytes);
  }

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export function preparedFormsDownloadName(application: Pick<AgentApplication, "business_name" | "full_name" | "id">) {
  return `xogmall-prepared-agent-forms-${safePreparedFormFilePart(application.business_name || application.full_name || application.id)}.zip`;
}

export function preparedFormDownloadName(form: PreparedAgentForm, application: Pick<AgentApplication, "business_name" | "full_name" | "id">) {
  return `xogmall-${safePreparedFormFilePart(application.business_name || application.full_name || application.id)}-${form.fileName}`;
}

export function applicationDocuments(application: ApplicationWithDocuments) {
  return application.agent_application_documents || [];
}

function getPreparedFormValues(application: AgentApplication) {
  const fullName = toFormLine(application.full_name);
  const fullNameUpper = fullName.toUpperCase();
  const businessName = toFormLine(application.business_name || fullName);
  const businessAddress = formatBusinessAddress(application);

  return {
    fullName,
    fullNameUpper,
    businessName,
    businessNameUpper: businessName.toUpperCase(),
    dateOfBirth: formatDateForForm(application.date_of_birth),
    residentialAddress: toFormLine(application.residential_address),
    businessAddress,
    phone: toFormLine(application.mobile_phone),
    emailUpper: toFormLine(application.email).toUpperCase(),
    nationalInsuranceUpper: toFormLine(application.national_insurance_number).toUpperCase(),
    citizenshipUpper: toFormLine(application.citizenship).toUpperCase(),
    premisesOccupancyLength: formatOccupancyLength(application.premises_occupancy_length),
    businessType: application.business_type === "limited_company" ? "Limited company" : "Individual / sole trader",
    premisesStatus: application.business_premises_status === "owned" ? "Owned" : "Leased",
  };
}

function applyTemplateValues(
  xml: string,
  values: ReturnType<typeof getPreparedFormValues>,
  application: AgentApplication,
  documents: AgentApplicationDocument[],
) {
  const replacements: Record<string, string> = {
    "{{FULL_NAME}}": values.fullName,
    "{{BUSINESS_NAME}}": values.businessName,
    "{{DATE_OF_BIRTH}}": values.dateOfBirth,
    "{{RESIDENTIAL_ADDRESS}}": values.residentialAddress,
    "{{BUSINESS_ADDRESS}}": values.businessAddress,
    "{{PHONE}}": values.phone,
    "{{EMAIL}}": values.emailUpper,
    "{{NATIONAL_INSURANCE}}": values.nationalInsuranceUpper,
    "{{CITIZENSHIP}}": values.citizenshipUpper,
    "{{OCCUPANCY_LENGTH}}": values.premisesOccupancyLength,
    "{{BUSINESS_TYPE}}": values.businessType,
    "{{PREMISES_STATUS}}": values.premisesStatus,
    "{{DOCUMENT_CHECKLIST}}": documents.length
      ? documents.map((document) => document.document_label).join(", ")
      : "No documents recorded.",
  };

  return Object.entries(replacements).reduce(
    (nextXml, [token, value]) => replaceXmlText(nextXml, token, value),
    xml,
  );
}

function replaceXmlText(xml: string, from: string, to: string) {
  const escapedFrom = escapeRegExp(escapeXml(from));
  const escapedTo = escapeXml(to);

  return xml.replace(new RegExp(escapedFrom, "g"), escapedTo);
}

function formatBusinessAddress(application: AgentApplication) {
  return [
    application.business_address_line_1,
    application.business_address_line_2,
    application.business_city,
    application.business_postcode,
    application.business_country,
  ].map(toFormLine).filter(Boolean).join(", ");
}

function formatDateForForm(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return toFormLine(value);
  }

  return `${day}.${month}.${year}`;
}

function formatOccupancyLength(value: string | null | undefined) {
  const clean = toFormLine(value);

  if (/^\d+(\.\d+)?$/.test(clean)) {
    return `${clean} Years`;
  }

  return clean;
}

function safePreparedFormFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "application";
}

function toFormLine(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
