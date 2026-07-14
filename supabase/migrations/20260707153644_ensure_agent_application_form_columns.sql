-- Keep the live onboarding schema aligned with the prepared-form fields used by
-- the applicant form and generated DOCX packs.

alter table public.agent_applications
  add column if not exists date_of_birth date,
  add column if not exists residential_address text,
  add column if not exists national_insurance_number text,
  add column if not exists citizenship text,
  add column if not exists uk_immigration_status text,
  add column if not exists business_premises_status text not null default 'leased',
  add column if not exists premises_occupancy_length text,
  add column if not exists consent_terms_conditions boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'agent_applications_business_premises_status_check'
      and conrelid = 'public.agent_applications'::regclass
  ) then
    alter table public.agent_applications
      add constraint agent_applications_business_premises_status_check
      check (business_premises_status in ('owned', 'leased'));
  end if;
end $$;

alter table public.agent_application_documents
  drop constraint if exists agent_application_documents_type_check;

alter table public.agent_application_documents
  add constraint agent_application_documents_type_check check (
    document_type in (
      'proof_of_identity',
      'proof_of_address',
      'right_to_work',
      'dbs_certificate',
      'current_cv',
      'national_insurance',
      'company_directors_ids',
      'company_directors_addresses',
      'company_house_certificate',
      'business_address_proof',
      'additional'
    )
  );

grant select, insert, update on table public.agent_applications to authenticated, service_role;
grant select, insert, update, delete on table public.agent_application_documents to authenticated, service_role;

notify pgrst, 'reload schema';
