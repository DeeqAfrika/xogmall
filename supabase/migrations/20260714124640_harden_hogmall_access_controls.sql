-- Final fresh-project hardening for Hogmall. This migration contains no seed
-- users, customer records, agent records, applications, or storage objects.

alter table public.exchange_rates force row level security;
alter table public.agents force row level security;
alter table public.site_content force row level security;
alter table public.agent_applications force row level security;
alter table public.agent_application_documents force row level security;

alter table public.agents drop constraint if exists agents_status_check;
alter table public.agents
  add constraint agents_status_check check (status in ('published', 'draft', 'suspended'));

-- Applicants may edit their own application content, but must never be able
-- to assign reviewers, add admin notes, or self-approve an application.
create or replace function public.enforce_agent_application_write_boundary()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  is_admin boolean := coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin';
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') or is_admin then
    return new;
  end if;

  if (select auth.uid()) is null or new.user_id <> (select auth.uid()) then
    raise exception 'Application ownership is invalid' using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'submitted')
      or new.reviewed_by is not null
      or new.reviewed_at is not null
      or new.admin_notes is not null
    then
      raise exception 'Applicant cannot set review fields' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.user_id <> old.user_id
    or new.reviewed_by is distinct from old.reviewed_by
    or new.reviewed_at is distinct from old.reviewed_at
    or new.admin_notes is distinct from old.admin_notes
  then
    raise exception 'Applicant cannot change review fields' using errcode = '42501';
  end if;

  if old.status = 'draft' and new.status not in ('draft', 'submitted') then
    raise exception 'Invalid applicant status transition' using errcode = '42501';
  elsif old.status = 'more_info_required' and new.status not in ('more_info_required', 'submitted') then
    raise exception 'Invalid applicant status transition' using errcode = '42501';
  elsif old.status not in ('draft', 'more_info_required') and new.status <> old.status then
    raise exception 'Applicant cannot change this application status' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_agent_application_write_boundary() from public, anon, authenticated;

drop trigger if exists enforce_agent_application_write_boundary on public.agent_applications;
create trigger enforce_agent_application_write_boundary
  before insert or update on public.agent_applications
  for each row execute function public.enforce_agent_application_write_boundary();

drop policy if exists "Applicants can update own application documents" on public.agent_application_documents;
create policy "Applicants can update own application documents"
  on public.agent_application_documents
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id and
    exists (
      select 1 from public.agent_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id and
    exists (
      select 1 from public.agent_applications application
      where application.id = application_id
        and application.user_id = (select auth.uid())
    )
  );

-- Reassert a private, type-limited, size-limited onboarding bucket.
update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png']
where id = 'agent-application-documents';

-- Explicit function grants: no privileged function is executable by anon or PUBLIC.
revoke all on function public.publish_exchange_rate(numeric, date, text) from public, anon;
revoke all on function public.list_admin_auth_users() from public, anon;
revoke all on function public.create_admin_auth_user(text, text, text) from public, anon;
grant execute on function public.publish_exchange_rate(numeric, date, text) to authenticated;
grant execute on function public.list_admin_auth_users() to authenticated;
grant execute on function public.create_admin_auth_user(text, text, text) to authenticated;

notify pgrst, 'reload schema';
