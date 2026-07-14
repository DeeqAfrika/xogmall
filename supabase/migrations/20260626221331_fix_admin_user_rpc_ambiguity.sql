create or replace function public.create_admin_auth_user(
  p_email text,
  p_password text,
  p_full_name text default null
)
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
declare
  normalized_email text := lower(trim(coalesce(p_email, '')));
  target_user_id uuid;
  admin_metadata jsonb := jsonb_build_object(
    'provider',
    'email',
    'providers',
    jsonb_build_array('email'),
    'role',
    'admin',
    'permissions',
    jsonb_build_array('rates', 'agents', 'content', 'admin_users')
  );
  name_metadata jsonb := case
    when nullif(trim(coalesce(p_full_name, '')), '') is null then '{}'::jsonb
    else jsonb_build_object('full_name', nullif(trim(coalesce(p_full_name, '')), ''))
  end;
begin
  if (select auth.uid()) is null
    or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') <> 'admin'
  then
    raise exception 'Only full admins can create admin users' using errcode = '42501';
  end if;

  if normalized_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Enter a valid email address' using errcode = '22023';
  end if;

  if length(coalesce(p_password, '')) < 8 then
    raise exception 'Enter a password with at least 8 characters' using errcode = '22023';
  end if;

  select users.id
  into target_user_id
  from auth.users as users
  where lower(users.email) = normalized_email
  order by users.created_at asc
  limit 1;

  if target_user_id is null then
    target_user_id := extensions.gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at,
      is_anonymous
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      target_user_id,
      'authenticated',
      'authenticated',
      normalized_email,
      extensions.crypt(p_password, extensions.gen_salt('bf')),
      now(),
      null,
      '',
      null,
      '',
      null,
      '',
      '',
      null,
      null,
      admin_metadata,
      name_metadata,
      false,
      now(),
      now(),
      null,
      null,
      '',
      '',
      null,
      '',
      0,
      null,
      '',
      null,
      false,
      null,
      false
    );
  else
    update auth.users as target
    set
      encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
      email_confirmed_at = coalesce(target.email_confirmed_at, now()),
      raw_app_meta_data = coalesce(target.raw_app_meta_data, '{}'::jsonb) || admin_metadata,
      raw_user_meta_data = coalesce(target.raw_user_meta_data, '{}'::jsonb) || name_metadata,
      updated_at = now(),
      deleted_at = null
    where target.id = target_user_id;
  end if;

  if exists (
    select 1
    from auth.identities as identities
    where identities.user_id = target_user_id
      and identities.provider = 'email'
  ) then
    update auth.identities as target
    set
      provider_id = target_user_id::text,
      identity_data = coalesce(target.identity_data, '{}'::jsonb) || jsonb_build_object(
        'sub',
        target_user_id::text,
        'email',
        normalized_email,
        'email_verified',
        true,
        'phone_verified',
        false
      ),
      updated_at = now()
    where target.user_id = target_user_id
      and target.provider = 'email';
  else
    insert into auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at,
      id
    )
    values (
      target_user_id::text,
      target_user_id,
      jsonb_build_object(
        'sub',
        target_user_id::text,
        'email',
        normalized_email,
        'email_verified',
        true,
        'phone_verified',
        false
      ),
      'email',
      now(),
      now(),
      now(),
      extensions.gen_random_uuid()
    );
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
    where users.id = target_user_id;
end;
$$;

revoke all on function public.create_admin_auth_user(text, text, text) from public, anon, authenticated;
grant execute on function public.create_admin_auth_user(text, text, text) to authenticated;
