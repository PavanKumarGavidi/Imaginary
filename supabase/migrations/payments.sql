-- ══════════ IMAGINE · payments ledger (Stripe deposits) ══════════
-- Run ONCE in SQL Editor. Written to automatically by the stripe-webhook
-- Edge Function whenever a deposit checkout completes.

create table if not exists public.payments (
  id                text primary key default gen_random_uuid()::text,
  booking_ref       text not null,
  amount_cents      integer not null,
  currency          text not null default 'usd',
  stripe_session_id text,
  created_at        timestamptz not null default now()
);

alter table public.payments enable row level security;

-- money matters are staff-only — no public read
drop policy if exists "payments staff all" on public.payments;
create policy "payments staff all"
  on public.payments for all to authenticated using (true) with check (true);
