-- ============================================================
-- IMAGINE · Photo Studio — Supabase schema
-- Run this whole file in: Supabase → SQL Editor → New query
-- ============================================================
-- SETUP CHECKLIST
-- 1. Run this file in the SQL editor.
-- 2. Authentication → Providers → Email: enable it.
--    (For a private studio desk you can leave "Confirm email" ON and
--     confirm your own user, or turn it off for instant login.)
-- 3. Authentication → Users → "Add user": enter the admin email + password.
-- 4. Copy the project URL and the anon public key into `.env.local`:
--        VITE_SUPABASE_URL=https://xxxx.supabase.co
--        VITE_SUPABASE_ANON_KEY=eyJ...
-- 5. Rebuild/deploy. The login screen switches from demo mode to cloud mode.
-- ============================================================

-- ————— bookings (public form writes; only staff read/manage) —————
create table if not exists public.bookings (
  id         text primary key,
  ref        text not null,
  name       text not null,
  email      text not null,
  phone      text default '',
  session    text not null,
  package_id text not null,
  date       text not null,
  time       text not null,
  guests     int  not null default 1,
  notes      text default '',
  status     text not null default 'pending'
             check (status in ('pending','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);

-- ————— reviews / testimonials —————
create table if not exists public.reviews (
  id        text primary key,
  quote     text not null,
  name      text not null,
  meta      text default '',
  published boolean not null default true
);

-- ————— team roster —————
create table if not exists public.team_members (
  id        text primary key,
  name      text not null,
  role      text not null,
  bio       text default '',
  gear      text default '',
  hue       text not null default 'sky'
            check (hue in ('sky','deep','ice','steel')),
  photo     text default '',
  published boolean not null default true
);

-- ————— gallery archive —————
create table if not exists public.gallery_frames (
  id        text primary key,
  title     text not null,
  cat       text not null,
  img       text not null,
  exif      text default '',
  published boolean not null default true
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.bookings       enable row level security;
alter table public.reviews        enable row level security;
alter table public.team_members   enable row level security;
alter table public.gallery_frames enable row level security;

-- Bookings: the public site may INSERT new bookings (the booking form).
-- Only signed-in staff may read / update / delete them.
drop policy if exists "bookings public insert" on public.bookings;
create policy "bookings public insert"
  on public.bookings for insert to anon with check (true);

drop policy if exists "bookings staff all" on public.bookings;
create policy "bookings staff all"
  on public.bookings for all to authenticated
  using (true) with check (true);

-- Published content is readable by anyone; only staff manage it.
drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read"
  on public.reviews for select to anon using (published = true);

drop policy if exists "team public read" on public.team_members;
create policy "team public read"
  on public.team_members for select to anon using (published = true);

drop policy if exists "frames public read" on public.gallery_frames;
create policy "frames public read"
  on public.gallery_frames for select to anon using (published = true);

-- Staff (authenticated) get full management rights.
drop policy if exists "reviews staff all" on public.reviews;
create policy "reviews staff all"
  on public.reviews for all to authenticated using (true) with check (true);

drop policy if exists "team staff all" on public.team_members;
create policy "team staff all"
  on public.team_members for all to authenticated using (true) with check (true);

drop policy if exists "frames staff all" on public.gallery_frames;
create policy "frames staff all"
  on public.gallery_frames for all to authenticated using (true) with check (true);

-- ============================================================
-- (Optional) Seed a couple of starter rows — safe to delete.
-- ============================================================
insert into public.reviews (id, quote, name, meta, published) values
  ('seed-r1', 'They shot our wedding like a film crew that forgot to tell us. Every frame feels stolen in the best way.', 'Maya Lindqvist', 'Wedding · The Archive', true)
on conflict (id) do nothing;

insert into public.team_members (id, name, role, bio, gear, hue, photo, published) values
  ('seed-t1', 'Mara Ellison', 'Founder · Principal Photographer',
   'Started with two strobes and a borrowed Rollei. Fourteen years on, she still insists on metering by hand.',
   'Leica M6 · Portra 400', 'deep', '', true)
on conflict (id) do nothing;
