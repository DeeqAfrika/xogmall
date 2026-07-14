export type PreparedAgentFormId = "agent-consent-form" | "agency-agreement" | "agent-application-form";

export type PreparedAgentForm = {
  id: PreparedAgentFormId;
  label: string;
  fileName: string;
  templateFileName: string;
};

export const preparedAgentForms: PreparedAgentForm[] = [
  {
    id: "agent-consent-form",
    label: "Agent Consent Form",
    fileName: "agent-consent-form.docx",
    templateFileName: "agent-consent-form.docx",
  },
  {
    id: "agency-agreement",
    label: "Agency Agreement",
    fileName: "agency-agreement.docx",
    templateFileName: "agency-agreement.docx",
  },
  {
    id: "agent-application-form",
    label: "Agent Application Form",
    fileName: "agent-application-form.docx",
    templateFileName: "agent-application-form.docx",
  },
];

export function getPreparedAgentForm(formId: string) {
  return preparedAgentForms.find((form) => form.id === formId);
}
