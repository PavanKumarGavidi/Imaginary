-- ══════════ IMAGINE · fix-bookings.sql ══════════
-- One-shot repair for the bookings → deposit-payment chain.
-- Safe to run multiple times. Paste into SQL Editor → Run.
--
-- What it does:
--   1. Removes stray objects left by an earlier wrong query
--   2. Ensures bookings has the `deposit_paid` column (missing column =
--      every booking insert silently fails → "not found in the ledger")
--   3. Ensures the `payments` ledger table exists
--   4. Re-creates the public INSERT policy (visitors book) and the
--      staff ALL policy (the desk manages)
--   5. Restores the taken_slots() availability function
--   6. Prints a diagnostic report at the end

-- ─── 1) cleanup of stray objects from the wrong query ───
drop trigger if exists update_bookings_updated_at on public.bookings;
drop function if exists public.update_updated_at_column();
alter table public.bookings drop column if exists updated_at;

-- ─── 2) the deposit column every insert writes to ───
alter table public.bookings
  add column if not exists deposit_paid boolean not null default false;

-- ─── 3) payments ledger (written by the Stripe webhook) ───
create table if not exists public.payments (
  id                text primary key default gen_random_uuid()::text,
  booking_ref       text not null,
  amount_cents      integer not null,
  currency          text not null default 'usd',
  stripe_session_id text,
  created_at        timestamptz not null default now()
);
alter table public.payments enable row level security;

drop policy if exists "payments staff all" on public.payments;
create policy "payments staff all"
  on public.payments for all to authenticated using (true) with check (true);

-- ─── 4) bookings security policies ───
alter table public.bookings enable row level security;

drop policy if exists "bookings public insert" on public.bookings;
create policy "bookings public insert"
  on public.bookings for insert to anon with check (true);

drop policy if exists "bookings staff all" on public.bookings;
create policy "bookings staff all"
  on public.bookings for all to authenticated using (true) with check (true);

-- ─── 5) slot availability (used by the booking form) ───
create or replace function public.taken_slots(for_date text)
returns text[]
language sql security definer set search_path = public
as $$
  select coalesce(array_agg(time), '{}')::text[]
  from public.bookings
  where date = for_date and status <> 'cancelled';
$$;

grant execute on function public.taken_slots(text) to anon, authenticated;

-- ─── 6) diagnostic report (read the Results panel after Run) ───
select 'A · recent bookings' as report, ref, status, deposit_paid, created_at
from public.bookings order by created_at desc limit 5;

select 'B · deposit column exists' as report,
       (count(*) = 1) as ok
from information_schema.columns
where table_schema = 'public' and table_name = 'bookings'
  and column_name = 'deposit_paid';

select 'C · bookings policies' as report, policyname, cmd
from pg_policies where schemaname = 'public' and tablename = 'bookings';
