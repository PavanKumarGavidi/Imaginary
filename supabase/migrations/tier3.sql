-- ══════════ IMAGINE · TIER 3 — guestbook + realtime sync ══════════
-- Run this ONCE in SQL Editor on an EXISTING project. (Both statements are
-- safe to re-run.)

-- 1) Public guestbook: visitors may submit testimonials, but ONLY as
--    unpublished — they go live once staff approves them in the desk.
drop policy if exists "reviews guestbook insert" on public.reviews;
create policy "reviews guestbook insert"
  on public.reviews for insert to anon with check (published = false);

-- 2) Realtime publication for live multi-tab sync of all content tables.
--    (If it errors with "table already member of publication", you're done.)
alter publication supabase_realtime add table public.reviews, public.team_members,
  public.gallery_frames, public.site_photos, public.site_content,
  public.deliveries, public.posts;
