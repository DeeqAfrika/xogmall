create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  from_currency text not null default 'GBP',
  to_currency text not null default 'USD',
  rate numeric(12, 6) not null check (rate > 0),
  effective_date date not null default current_date,
  is_active boolean not null default true,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint exchange_rates_currency_pair_check check (
    from_currency = 'GBP' and to_currency = 'USD'
  )
);

alter table public.exchange_rates enable row level security;

revoke all on table public.exchange_rates from anon, authenticated;
grant select on table public.exchange_rates to anon, authenticated;
grant insert, update on table public.exchange_rates to authenticated;

create unique index if not exists exchange_rates_one_active_idx
  on public.exchange_rates (is_active)
  where is_active = true;

create index if not exists exchange_rates_active_created_at_idx
  on public.exchange_rates (is_active, created_at desc);

create policy "Public can read the active exchange rate"
  on public.exchange_rates
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Admins can read exchange rate history"
  on public.exchange_rates
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert exchange rates"
  on public.exchange_rates
  for insert
  to authenticated
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and created_by = (select auth.uid())
  );

create policy "Admins can update exchange rates"
  on public.exchange_rates
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.publish_exchange_rate(
  p_rate numeric,
  p_effective_date date,
  p_note text default null
)
returns public.exchange_rates
language plpgsql
security invoker
set search_path = ''
as $$
declare
  published_rate public.exchange_rates;
begin
  if p_rate is null or p_rate <= 0 then
    raise exception 'Rate must be greater than zero';
  end if;

  update public.exchange_rates
  set is_active = false
  where is_active = true;

  insert into public.exchange_rates (
    from_currency,
    to_currency,
    rate,
    effective_date,
    is_active,
    note,
    created_by
  ) values (
    'GBP',
    'USD',
    p_rate,
    coalesce(p_effective_date, current_date),
    true,
    nullif(trim(p_note), ''),
    (select auth.uid())
  )
  returning * into published_rate;

  return published_rate;
end;
$$;

revoke all on function public.publish_exchange_rate(numeric, date, text) from public, anon;
grant execute on function public.publish_exchange_rate(numeric, date, text) to authenticated;
