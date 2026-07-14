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
grant execute on function public.list_admin_auth_users() to authenticated;

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
