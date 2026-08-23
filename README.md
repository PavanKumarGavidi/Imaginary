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

---

## Tier 1 — Storage, booking emails, slot availability

### 📸 Image uploads → Supabase Storage

Run the **"TIER 1"** section of `supabase/schema.sql` (creates the public `photos`
bucket + policies). From then on, every upload in the desk (team portraits, gallery
frames, site photos) is stored in the bucket and referenced by a public URL like
`https://YOUR-PROJECT.supabase.co/storage/v1/object/public/photos/team/….jpg`.

Before the bucket exists (or in demo mode), uploads fall back to embedded data URLs,
so nothing ever breaks.

### ✉️ Booking email notifications (EmailJS — free)

On every booking the site can email **the studio inbox** (full request details) and
**the client** (friendly confirmation with their `IM-XXXX` reference).

1. Create a free account at **emailjs.com** (200 emails/month — plenty for a studio).
2. **Email Services → Add New Service** → connect the inbox you want to send from
   (Gmail is easiest) → copy the **Service ID**.
3. **Email Templates → Create Email Template** — make two:

   **a) Studio alert** — in template settings set *To Email* to your admin inbox,
   *From Name* to `Imagine Desk`, and *Reply To* to `{{reply_to}}` (so replying
   answers the client directly). Toggle **HTML Content** ON, then paste:

   - Subject: `New booking {{booking_ref}} · {{session}}`
   - Content: `supabase/email-templates/studio-alert.html`

   Save → copy the **Template ID**.

   **b) Client confirmation** — set *To Email* to `{{client_email}}` and
   *From Name* to `Imagine Studio`. Toggle **HTML Content** ON, then paste:

   - Subject: `Your Imagine session is in the darkroom — {{booking_ref}}`
   - Content: `supabase/email-templates/client-confirmation.html`

   Save → copy the **Template ID**.

   Available template variables (all sent by the site):
   `booking_ref · client_name · client_email · client_phone · session ·
   package · date · time · guests · notes · reply_to`

4. **Account → API keys** → copy the **Public Key**.
5. Add the four values to your host's environment variables (Netlify: *Site
   settings → Environment variables*) and/or `.env.local`, then redeploy:

   ```
   VITE_EMAILJS_SERVICE_ID=service_xxx
   VITE_EMAILJS_PUBLIC_KEY=xxx
   VITE_EMAILJS_STUDIO_TEMPLATE_ID=template_xxx
   VITE_EMAILJS_CLIENT_TEMPLATE_ID=template_xxx
   ```

Email failures never block a booking — the ledger always wins. The optional
server-side path (Resend via Edge Function) is ready in
`supabase/functions/booking-email/` — deploy it with the Supabase CLI when you
want emails sent from your own domain (see the file header for the 5 steps).

### 🗓️ Slot availability

Also in the Tier 1 SQL: the `taken_slots(date)` function. The public booking form
calls it when a date is chosen and:

- marks already-booked call-times as **"— booked"** (disabled),
- shows a live readout — *"4 of 7 call-times free on Sat, Mar 14"* (green → amber → red),
- auto-clears a slot if someone else books it while the form is open,
- re-checks at submit time, so two people can never grab the same slot.

The function returns only times for a date (never names/emails), so it's safe to
expose to anonymous visitors.

## Tier 2 — deposits, deliveries, journal, insights

**One-time SQL** (existing projects): run `supabase/migrations/tier2.sql` in the
SQL Editor. It adds `deposit_paid` to bookings plus the `deliveries` and `posts`
tables, their RLS policies, and a starter journal post.

### 💳 Deposits via Stripe Payment Links (no code, no fees until you earn)

1. In Stripe: **Payment Links → New** — create one link per package (set the
   amount to that package's 30% deposit, e.g. `$168` for a $560 package).
2. In the desk: **Content tab → Packages → Edit** → paste the link into
   *Stripe Payment Link* → publish.
3. Effect:
   - The client's booking confirmation shows **"Pay $X deposit"** — it opens
     Stripe with their email and booking ref prefilled (`client_reference_id`).
   - The desk's Bookings tab shows a **Deposit: Due / Paid** chip per booking
     (click to toggle when the payment lands in Stripe) plus **Copy pay link**.
4. Matching payments to bookings: in Stripe, open a payment and look at its
   *client reference ID* — it's the booking ref (e.g. `IM-3F7A`).

### 🔒 Client delivery galleries

Desk → **Deliveries tab** → create a gallery: title, client, email, a gallery
key (4+ chars), upload frames, toggle downloads. **Copy link** gives the private
URL (`#/delivery/<id>`) — email it to the client *with their key*. Clients see a
password gate, then their frames with captions, a lightbox, and per-photo Save
buttons when downloads are on. Keys are stored as SHA-256 hashes (convenience
privacy, not bank-grade — fine for photo delivery).

### 📝 Journal

Desk → **Journal tab** → write stories (headline, tag, excerpt, cover, body).
Body formatting: a line starting `## ` becomes a heading, `> ` a pull-quote,
blank lines split paragraphs. Public pages: `#/journal` (list) and
`#/journal/<slug>` (article), linked from the nav and footer.

### 📊 Insights

Bookings tab → **Insights** panel: sessions per month, revenue by package,
pipeline donut, conversion rate, average lead time, busiest weekday and deposits
paid — all computed live from the ledger.
