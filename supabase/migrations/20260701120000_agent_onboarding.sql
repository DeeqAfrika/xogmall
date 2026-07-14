create table if not exists public.agent_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft',
  full_name text not null default '',
  mobile_phone text not null default '',
  email text not null default '',
  business_type text not null default 'limited_company',
  business_name text not null default '',
  company_registration_number text,
  business_address_line_1 text,
  business_address_line_2 text,
  business_city text,
  business_postcode text,
  business_country text not null default 'United Kingdom',
  director_shareholder_details text,
  proof_of_identity_type text,
  right_to_work_required boolean not null default false,
  notes text,
  consent_information_accurate boolean not null default false,
  consent_document_verification boolean not null default false,
  submitted_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_applications_user_id_key unique (user_id),
  constraint agent_applications_status_check check (status in ('draft', 'submitted', 'under_review', 'more_info_required', 'approved', 'rejected')),
  constraint agent_applications_business_type_check check (business_type in ('limited_company', 'sole_trader'))
);

create index if not exists agent_applications_status_updated_idx
  on public.agent_applications (status, updated_at desc);

create table if not exists public.agent_application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.agent_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null,
  document_label text not null,
  file_name text not null,
  file_path text not null unique,
  content_type text not null,
  file_size bigint not null default 0,
  uploaded_at timestamptz not null default now(),
  constraint agent_application_documents_type_check check (
    document_type in (
      'proof_of_identity',
      'proof_of_address',
      'right_to_work',
      'dbs_certificate',
      'current_cv',
      'national_insurance',
      'company_directors_ids',
      'company_directors_addresses',
      'business_address_proof',
      'additional'
    )
  )
);

create index if not exists agent_application_documents_application_idx
  on public.agent_application_documents (application_id, document_type, uploaded_at desc);

alter table public.agent_applications enable row level security;
alter table public.agent_application_documents enable row level security;

revoke all on table public.agent_applications from anon, authenticated;
revoke all on table public.agent_application_documents from anon, authenticated;
grant select, insert, update on table public.agent_applications to authenticated;
grant select, insert, update, delete on table public.agent_application_documents to authenticated;

drop policy if exists "Applicants can read own applications" on public.agent_applications;
drop policy if exists "Admins can read all applications" on public.agent_applications;
drop policy if exists "Applicants can create own applications" on public.agent_applications;
drop policy if exists "Applicants can update own applications" on public.agent_applications;
drop policy if exists "Admins can update all applications" on public.agent_applications;
drop policy if exists "Applicants can read own application documents" on public.agent_application_documents;
drop policy if exists "Admins can read all application documents" on public.agent_application_documents;
drop policy if exists "Applicants can create own application documents" on public.agent_application_documents;
drop policy if exists "Applicants can update own application documents" on public.agent_application_documents;
drop policy if exists "Applicants can delete own application documents" on public.agent_application_documents;
drop policy if exists "Admins can delete all application documents" on public.agent_application_documents;

create policy "Applicants can read own applications"
  on public.agent_applications
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Admins can read all applications"
  on public.agent_applications
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Applicants can create own applications"
  on public.agent_applications
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Applicants can update own applications"
  on public.agent_applications
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Admins can update all applications"
  on public.agent_applications
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Applicants can read own application documents"
  on public.agent_application_documents
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Admins can read all application documents"
  on public.agent_application_documents
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Applicants can create own application documents"
  on public.agent_application_documents
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id and
    exists (
      select 1
      from public.agent_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
    )
  );

create policy "Applicants can update own application documents"
  on public.agent_application_documents
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Applicants can delete own application documents"
  on public.agent_application_documents
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Admins can delete all application documents"
  on public.agent_application_documents
  for delete
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop trigger if exists set_agent_applications_updated_at on public.agent_applications;
create trigger set_agent_applications_updated_at
  before update on public.agent_applications
  for each row
  execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agent-application-documents',
  'agent-application-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Applicants can upload own onboarding documents" on storage.objects;
drop policy if exists "Applicants and admins can read onboarding documents" on storage.objects;
drop policy if exists "Applicants can update own onboarding documents" on storage.objects;
drop policy if exists "Applicants and admins can delete onboarding documents" on storage.objects;

create policy "Applicants can upload own onboarding documents"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'agent-application-documents' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Applicants and admins can read onboarding documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'agent-application-documents' and
    (
      (storage.foldername(name))[1] = (select auth.uid())::text or
      (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

create policy "Applicants can update own onboarding documents"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'agent-application-documents' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'agent-application-documents' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Applicants and admins can delete onboarding documents"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'agent-application-documents' and
    (
      (storage.foldername(name))[1] = (select auth.uid())::text or
      (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
