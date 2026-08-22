# IMAGINE — Photography Studio Website

A production-ready photo studio site (React + Vite + Tailwind) with a full admin "Studio Desk":
bookings, reviews, team, gallery, site-wide photos, and all website content are editable from
the admin panel and publish live to every visitor. Data lives in **Supabase** (Postgres + Auth + RLS),
with an automatic local-storage fallback for offline demo use.

**Live:** https://imaginarycapture.netlify.app

---

## Project structure

```
├── index.html                Entry HTML (fonts, SEO/OG meta)
├── vite.config.js            Build config
├── tsconfig.json
├── .env.example              Env var template
├── .env.local                ⚠️ Supabase keys (hidden file — include in backups!)
├── supabase/schema.sql       Tables + RLS policies (run once per database)
├── netlify.toml              Netlify auto-build config
└── src/
    ├── main.tsx              React bootstrap
    ├── App.tsx               Shell + view routing (site / login / desk)
    ├── store.tsx             Data layer: cloud sync, auth, mutations
    ├── data.ts               Default content + seeds
    ├── hooks.ts              Motion/scroll hooks (reduced-motion aware)
    ├── index.css             Design system (sky-blue & white)
    ├── vite-env.d.ts         Env types
    ├── lib/supabase.ts       Supabase client + helpers
    └── components/
        Nav / Hero / Sections / Team / Gallery / Booking / Closing /
        Footer / Admin (login + dashboard) / AdminPanels (managers) /
        Icons / ui (shared primitives)
```

## Run locally

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Environment

Copy `.env.example` → `.env.local` and fill in your Supabase project values
(Supabase dashboard → Settings → API):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   (anon/public key — never the service_role key)
```

Without these keys the app runs in **local demo mode** (browser storage, demo login
`admin / imagine24`).

## Database setup (one time)

1. Create a Supabase project → **SQL Editor** → run the whole `supabase/schema.sql`
   (creates `bookings`, `reviews`, `team_members`, `gallery_frames`, `site_photos`,
   `site_content` + RLS policies + starter rows).
2. **Authentication → Providers → Email** → enable.
3. **Authentication → Users → Add user** → create your admin (enable *Auto confirm*).
4. **Authentication → URL Configuration** → set **Site URL** to your live domain and add
   `https://your-domain/**` under **Redirect URLs** (needed for password-reset emails).

## Deploy

Works on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3…).

- **Netlify:** connect the repo (or drag the project in). `netlify.toml` already sets
  `npm run build` + `publish = dist`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  under *Site settings → Environment variables*, then deploy.
- **Manual:** run `npm run build` and upload the `dist/` folder.

> Note: `.env.local` is git-ignored by convention. When moving hosts, re-add the two
> `VITE_SUPABASE_*` variables in the host's environment settings (or keep `.env.local`
> alongside the source if you're transferring files directly).

## Admin desk

- Open via **Staff** (nav) or **Staff entrance** (footer).
- Tabs: **Bookings · Reviews · Team · Gallery · Photos · Content**
- Cloud mode signs in with your Supabase email/password; includes in-app password change
  and email password reset.
- Everything saves to Supabase and appears on the public site immediately.

## Tech notes

- Uploads are downscaled to ≤1100px JPEG (~q85) client-side before storing.
- All animations honor `prefers-reduced-motion`.
- Public visitors can only insert bookings and read published content (enforced by RLS).
