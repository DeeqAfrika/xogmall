import type {
  AgentApplication,
  AgentApplicationDocument,
  AgentApplicationDocumentType,
  AgentBusinessPremisesStatus,
  AgentApplicationStatus,
  AgentBusinessType,
} from "@/lib/types";

export const AGENT_APPLICATION_BUCKET = "agent-application-documents";

export const applicationStatusLabels: Record<AgentApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  more_info_required: "More information required",
  approved: "Approved",
  rejected: "Rejected",
};

export const businessTypeLabels: Record<AgentBusinessType, string> = {
  limited_company: "Limited company",
  sole_trader: "Sole trader",
};

export const businessPremisesStatusLabels: Record<AgentBusinessPremisesStatus, string> = {
  owned: "Owned",
  leased: "Leased",
};

export type OnboardingDocumentRequirement = {
  type: AgentApplicationDocumentType;
  label: string;
  description: string;
  requiredFor: "all" | "limited_company" | "conditional" | "optional";
};

export const onboardingDocumentRequirements: OnboardingDocumentRequirement[] = [
  {
    type: "proof_of_identity",
    label: "Proof of identity",
    description:
      "Valid passport, EU/EEA national identity card, UK BRP/BRC, or full/provisional UK photo driving licence.",
    requiredFor: "all",
  },
  {
    type: "proof_of_address",
    label: "Proof of address",
    description:
      "Utility bill, bank statement, payslip, council tax bill, UK government correspondence, or driving licence if not used as ID. Must be dated within the last three months.",
    requiredFor: "all",
  },
  {
    type: "right_to_work",
    label: "Right to work",
    description:
      "Required if you do not hold a UK passport. Upload a valid work permit, share code evidence, or other right-to-work document.",
    requiredFor: "conditional",
  },
  {
    type: "dbs_certificate",
    label: "DBS certificate",
    description: "Optional for now. Hogmall may request a basic or enhanced DBS certificate later.",
    requiredFor: "optional",
  },
  {
    type: "current_cv",
    label: "Current CV",
    description: "Optional for now. Hogmall may request a current CV later.",
    requiredFor: "optional",
  },
  {
    type: "national_insurance",
    label: "Proof of National Insurance number",
    description: "NI card, HMRC letter, payslip, or another clear proof of National Insurance number.",
    requiredFor: "all",
  },
  {
    type: "business_address_proof",
    label: "Proof of business address",
    description:
      "Utility bill, business rates bill, bank statement, or payslip showing the trading/business address.",
    requiredFor: "all",
  },
  {
    type: "company_directors_ids",
    label: "Director/shareholder IDs",
    description: "For limited companies: IDs for directors and shareholders.",
    requiredFor: "limited_company",
  },
  {
    type: "company_directors_addresses",
    label: "Director/shareholder address proofs",
    description: "For limited companies: proof of address for directors and shareholders.",
    requiredFor: "limited_company",
  },
  {
    type: "company_house_certificate",
    label: "Companies House certificate",
    description: "For limited companies: certificate of incorporation or current Companies House record.",
    requiredFor: "limited_company",
  },
  {
    type: "additional",
    label: "Additional supporting document",
    description: "Optional supporting document requested by Hogmall.",
    requiredFor: "conditional",
  },
];

export function getRequiredDocumentTypes(application: Pick<AgentApplication, "business_type" | "right_to_work_required">) {
  return onboardingDocumentRequirements
    .filter((requirement) => {
      if (requirement.requiredFor === "all") {
        return true;
      }

      if (requirement.requiredFor === "limited_company") {
        return application.business_type === "limited_company";
      }

      if (requirement.requiredFor === "conditional") {
        return requirement.type === "right_to_work" && application.right_to_work_required;
      }

      return false;
    })
    .map((requirement) => requirement.type);
}

export function getMissingRequiredDocuments(
  application: Pick<AgentApplication, "business_type" | "right_to_work_required">,
  documents: Pick<AgentApplicationDocument, "document_type">[],
) {
  const uploadedTypes = new Set(documents.map((document) => document.document_type));

  return getRequiredDocumentTypes(application).filter((type) => !uploadedTypes.has(type));
}

export function getDocumentRequirement(type: AgentApplicationDocumentType) {
  return onboardingDocumentRequirements.find((requirement) => requirement.type === type);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes < 100 ? 1 : 0)} KB`;
  }

  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(megabytes < 100 ? 1 : 0)} MB`;
}

export function safeStorageFileName(fileName: string) {
  const cleaned = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "document";
}
