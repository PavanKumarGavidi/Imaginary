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

-- ————— site-wide photos (hero / studio / login backdrop) —————
create table if not exists public.site_photos (
  slot_key text primary key check (slot_key in ('hero','studio','login')),
  img      text not null
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.bookings       enable row level security;
alter table public.reviews        enable row level security;
alter table public.team_members   enable row level security;
alter table public.gallery_frames enable row level security;
alter table public.site_photos    enable row level security;

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

drop policy if exists "site photos public read" on public.site_photos;
create policy "site photos public read"
  on public.site_photos for select to anon using (true);

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

drop policy if exists "site photos staff all" on public.site_photos;
create policy "site photos staff all"
  on public.site_photos for all to authenticated using (true) with check (true);

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

insert into public.gallery_frames (id, title, cat, img, exif, published) values
  ('seed-g1', 'Vows at Dunmore', 'Wedding', 'https://image.qwenlm.ai/generated-images/36926275-fe9f-4de6-a9fb-d3ac749133f3/_result.png', '85MM · f/1.8 · 1/250 · ISO 200', true),
  ('seed-g2', 'Rust & Velvet', 'Fashion', 'https://image.qwenlm.ai/generated-images/b9274cf3-727c-46d5-94a7-7f681624a1d4/_result.png', '50MM · f/2.8 · 1/160 · ISO 400', true),
  ('seed-g3', 'Amber No. 9', 'Product', 'https://image.qwenlm.ai/generated-images/e927488a-0c87-4d25-9ca1-11570c7eabba/_result.png', '90MM MACRO · f/8 · 1/125 · ISO 100', true)
on conflict (id) do nothing;

insert into public.site_photos (slot_key, img) values
  ('hero',   'https://image.qwenlm.ai/generated-images/1d06e80a-d9ab-413a-b0e5-3708708d9646/_result.png'),
  ('studio', 'https://image.qwenlm.ai/generated-images/dd7371bb-a1d8-4fd5-8305-de563b51f96d/_result.png'),
  ('login',  'https://image.qwenlm.ai/generated-images/b9274cf3-727c-46d5-94a7-7f681624a1d4/_result.png')
on conflict (slot_key) do nothing;

-- ============================================================
-- TIER 2 — deposits, client delivery galleries, journal
-- (existing projects: run supabase/migrations/tier2.sql instead)
-- ============================================================
alter table public.bookings add column if not exists deposit_paid boolean not null default false;

create table if not exists public.deliveries (
  id           text primary key,
  title        text not null,
  client_name  text not null,
  client_email text default '',
  pass_hash    text not null,
  photos       jsonb not null default '[]',
  downloads    boolean not null default true,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);
alter table public.deliveries enable row level security;
drop policy if exists "deliveries public read" on public.deliveries;
create policy "deliveries public read" on public.deliveries for select to anon using (published = true);
drop policy if exists "deliveries staff all" on public.deliveries;
create policy "deliveries staff all" on public.deliveries for all to authenticated using (true) with check (true);

create table if not exists public.posts (
  id         text primary key,
  slug       text not null unique,
  title      text not null,
  excerpt    text default '',
  cover      text default '',
  body       text default '',
  tag        text default 'Studio',
  published  boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.posts enable row level security;
drop policy if exists "posts public read" on public.posts;
create policy "posts public read" on public.posts for select to anon using (published = true);
drop policy if exists "posts staff all" on public.posts;
create policy "posts staff all" on public.posts for all to authenticated using (true) with check (true);

insert into public.posts (id, slug, title, excerpt, cover, body, tag, published) values
('seed-p1', 'hello-daylight', 'Hello, daylight — rewiring the north window',
 'Why we traded two strobes for a wall of morning sun, and what it did to our portrait sittings.',
 'https://image.qwenlm.ai/generated-images/dd7371bb-a1d8-4fd5-8305-de563b51f96d/_result.png',
 E'## The problem with pretty light\n\nFor nine years our portrait bay ran on tungsten: reliable, repeatable, and — if we were honest — a little samey. Every sitter got the same warm rim, the same soft falloff. Beautiful, but ours more than theirs.\n\n## What the window changed\n\nIn January we knocked a storage wall off the north side and hung a 4×6-metre scrim. North light is the old painters'' trick: it never goes direct, it only ever breathes. Cloudy day? Softer. Noon? Even. Golden hour? The whole room turns to honey for twenty minutes and everyone on set forgets to be nervous.\n\n> Light is not something you add to a person. It is something you let through.\n\n## What it did to the sittings\n\nSessions got quieter. People stop posing for daylight the way they brace for a flash — there is no pop to flinch at, just a slow tide. Our keep-rate on first frames doubled, and the film scanner has not caught up since.\n\n## Try it yourself\n\nBook any portrait session before the end of spring and ask for "the window". Mara shoots it herself, mornings only — that is when the light behaves.',
 'Behind the scenes', true)
on conflict (id) do nothing;

-- ============================================================
-- TIER 1 — image Storage bucket + slot availability
-- ============================================================

-- Public bucket for all site imagery (team portraits, gallery frames, site photos).
-- Uploads from the desk land here; the public site reads them by URL.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

-- Anyone may read photos in the bucket
drop policy if exists "photos public read" on storage.objects;
create policy "photos public read"
  on storage.objects for select to public
  using (bucket_id = 'photos');

-- Only signed-in staff may add / replace / remove files
drop policy if exists "photos staff insert" on storage.objects;
create policy "photos staff insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos');

drop policy if exists "photos staff update" on storage.objects;
create policy "photos staff update"
  on storage.objects for update to authenticated
  using (bucket_id = 'photos');

drop policy if exists "photos staff delete" on storage.objects;
create policy "photos staff delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos');

-- Slot availability for the public booking form.
-- Returns ONLY call-times for a date (never names/emails), so it's safe for anon.
create or replace function public.taken_slots(for_date text)
returns text[]
language sql
security definer
set search_path = public
as $$
  select coalesce(array_agg(time), '{}')::text[]
  from public.bookings
  where date = for_date
    and status <> 'cancelled';
$$;

grant execute on function public.taken_slots(text) to anon, authenticated;
