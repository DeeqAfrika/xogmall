export type ExchangeRate = {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
  is_active: boolean;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

export type AgentLocation = {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  postcode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  services: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "published" | "draft";
  display_order: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentDirectoryEntry = {
  id: string;
  name: string;
  fca_frn: string | null;
  city: string | null;
  postcode: string | null;
  status: "mapped" | "address_pending";
  display_order: number;
  source_note: string | null;
};

export type SiteContent = {
  key: string;
  label: string;
  body: string;
  is_published: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminUserSummary = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

export type AgentApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "more_info_required"
  | "approved"
  | "rejected";

export type AgentBusinessType = "limited_company" | "sole_trader";
export type AgentBusinessPremisesStatus = "owned" | "leased";

export type AgentApplication = {
  id: string;
  user_id: string;
  status: AgentApplicationStatus;
  full_name: string;
  mobile_phone: string;
  email: string;
  date_of_birth: string | null;
  residential_address: string | null;
  national_insurance_number: string | null;
  citizenship: string | null;
  uk_immigration_status: string | null;
  business_type: AgentBusinessType;
  business_name: string;
  company_registration_number: string | null;
  business_address_line_1: string | null;
  business_address_line_2: string | null;
  business_city: string | null;
  business_postcode: string | null;
  business_country: string;
  business_premises_status: AgentBusinessPremisesStatus;
  premises_occupancy_length: string | null;
  director_shareholder_details: string | null;
  proof_of_identity_type: string | null;
  right_to_work_required: boolean;
  notes: string | null;
  consent_information_accurate: boolean;
  consent_document_verification: boolean;
  consent_terms_conditions: boolean;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentApplicationDocumentType =
  | "proof_of_identity"
  | "proof_of_address"
  | "right_to_work"
  | "dbs_certificate"
  | "current_cv"
  | "national_insurance"
  | "company_directors_ids"
  | "company_directors_addresses"
  | "company_house_certificate"
  | "business_address_proof"
  | "additional";

export type AgentApplicationDocument = {
  id: string;
  application_id: string;
  user_id: string;
  document_type: AgentApplicationDocumentType;
  document_label: string;
  file_name: string;
  file_path: string;
  content_type: string;
  file_size: number;
  uploaded_at: string;
};
