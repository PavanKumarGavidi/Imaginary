-- ══════════ IMAGINE · TIER 2 — deposits, client galleries, journal ══════════
-- Run this ONCE in SQL Editor on an EXISTING project.
-- (Fresh installs get everything from supabase/schema.sql instead.)

-- 1) Deposit tracking on bookings
alter table public.bookings add column if not exists deposit_paid boolean not null default false;

-- 2) Client delivery galleries (password-gated private pages)
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

-- 3) Journal posts
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

-- 4) A first journal entry so the press isn't empty — edit or delete from the desk.
insert into public.posts (id, slug, title, excerpt, cover, body, tag, published) values
('seed-p1', 'hello-daylight', 'Hello, daylight — rewiring the north window',
 'Why we traded two strobes for a wall of morning sun, and what it did to our portrait sittings.',
 'https://image.qwenlm.ai/generated-images/dd7371bb-a1d8-4fd5-8305-de563b51f96d/_result.png',
 E'## The problem with pretty light\n\nFor nine years our portrait bay ran on tungsten: reliable, repeatable, and — if we were honest — a little samey. Every sitter got the same warm rim, the same soft falloff. Beautiful, but ours more than theirs.\n\n## What the window changed\n\nIn January we knocked a storage wall off the north side and hung a 4×6-metre scrim. North light is the old painters'' trick: it never goes direct, it only ever breathes. Cloudy day? Softer. Noon? Even. Golden hour? The whole room turns to honey for twenty minutes and everyone on set forgets to be nervous.\n\n> Light is not something you add to a person. It is something you let through.\n\n## What it did to the sittings\n\nSessions got quieter. People stop posing for daylight the way they brace for a flash — there is no pop to flinch at, just a slow tide. Our keep-rate on first frames doubled, and the film scanner has not caught up since.\n\n## Try it yourself\n\nBook any portrait session before the end of spring and ask for "the window". Mara shoots it herself, mornings only — that is when the light behaves.',
 'Behind the scenes', true)
on conflict (id) do nothing;
