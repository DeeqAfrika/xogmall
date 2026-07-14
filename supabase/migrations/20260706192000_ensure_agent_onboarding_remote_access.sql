-- Final remote repair for the agent onboarding workflow.
-- This migration is intentionally idempotent: it reasserts Data API grants,
-- storage bucket settings, admin-only user listing, and draft application
-- backfill for existing applicant auth users.

grant usage on schema public to anon, authenticated, service_role;

alter table public.exchange_rates enable row level security;
alter table public.agents enable row level security;
alter table public.site_content enable row level security;
alter table public.agent_applications enable row level security;
alter table public.agent_application_documents enable row level security;

grant select on table public.exchange_rates to anon, authenticated, service_role;
grant insert, update on table public.exchange_rates to authenticated, service_role;

grant select on table public.agents to anon, authenticated, service_role;
grant insert, update, delete on table public.agents to authenticated, service_role;

grant select on table public.site_content to anon, authenticated, service_role;
grant insert, update, delete on table public.site_content to authenticated, service_role;

grant select, insert, update on table public.agent_applications to authenticated, service_role;
grant select, insert, update, delete on table public.agent_application_documents to authenticated, service_role;

grant execute on function public.publish_exchange_rate(numeric, date, text) to authenticated, service_role;
grant execute on function public.list_admin_auth_users() to authenticated, service_role;
grant execute on function public.create_admin_auth_user(text, text, text) to authenticated, service_role;

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

create or replace function public.list_admin_auth_users()
returns table (
  id uuid,
  email text,
  role text,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
    or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') <> 'admin'
  then
    raise exception 'Only full admins can list admin users' using errcode = '42501';
  end if;

  return query
    select
      users.id,
      coalesce(users.email, '')::text as email,
      coalesce(users.raw_app_meta_data ->> 'role', 'user')::text as role,
      nullif(users.raw_user_meta_data ->> 'full_name', '')::text as full_name,
      users.created_at,
      users.last_sign_in_at,
      users.email_confirmed_at
    from auth.users as users
    where users.deleted_at is null
      and coalesce(users.raw_app_meta_data ->> 'role', '') = 'admin'
    order by users.created_at desc;
end;
$$;

revoke all on function public.list_admin_auth_users() from public, anon, authenticated;
grant execute on function public.list_admin_auth_users() to authenticated, service_role;

insert into public.agent_applications (
  user_id,
  status,
  full_name,
  email
)
select
  users.id,
  'draft',
  coalesce(nullif(users.raw_user_meta_data ->> 'full_name', ''), ''),
  coalesce(users.email, '')
from auth.users as users
where users.deleted_at is null
  and coalesce(users.raw_app_meta_data ->> 'role', 'user') <> 'admin'
  and not exists (
    select 1
    from public.agent_applications as application
    where application.user_id = users.id
  );
