create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  postcode text,
  country text not null default 'United Kingdom',
  phone text,
  email text,
  opening_hours text,
  services text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  status text not null default 'published',
  display_order integer not null default 0,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agents_status_check check (status in ('published', 'draft'))
);

create index if not exists agents_public_order_idx
  on public.agents (status, display_order, name);

alter table public.agents enable row level security;

revoke all on table public.agents from anon, authenticated;
grant select on table public.agents to anon, authenticated;
grant insert, update, delete on table public.agents to authenticated;

create policy "Public can read published agents"
  on public.agents
  for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can read all agents"
  on public.agents
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert agents"
  on public.agents
  for insert
  to authenticated
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update agents"
  on public.agents
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete agents"
  on public.agents
  for delete
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create table if not exists public.site_content (
  key text primary key,
  label text not null,
  body text not null,
  is_published boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

revoke all on table public.site_content from anon, authenticated;
grant select on table public.site_content to anon, authenticated;
grant insert, update, delete on table public.site_content to authenticated;

create policy "Public can read published site content"
  on public.site_content
  for select
  to anon, authenticated
  using (is_published = true);

create policy "Admins can read all site content"
  on public.site_content
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert site content"
  on public.site_content
  for insert
  to authenticated
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update site content"
  on public.site_content
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete site content"
  on public.site_content
  for delete
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_agents_updated_at on public.agents;
create trigger set_agents_updated_at
  before update on public.agents
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
  before update on public.site_content
  for each row
  execute function public.set_updated_at();
