# IMAGINE · Stripe Deposit Payments — Setup Guide

On-site 30% deposits: the client pays inside the website (Stripe card form),
the deposit amount is computed server-side, and the booking flips to **Paid ✓**
automatically via webhook.

Your project values:
- Supabase project: `euhcvlhuzryqgwrxwrmk`
- Webhook URL: `https://euhcvlhuzryqgwrxwrmk.supabase.co/functions/v1/stripe-webhook`
- Site: `https://imaginarycapture.netlify.app`

Do everything below in **test mode first**. Real money comes last.

---

## Step 1 — Get your two Stripe keys (test mode)

1. Go to **https://dashboard.stripe.com/test/apikeys**
2. Keep the top-right toggle on **Test mode**.
3. Copy both:
   - **Publishable key** — starts with `pk_test_` → SAFE for the browser.
   - **Secret key** — starts with `sk_test_` → click "Reveal" to copy.
     ⚠️ NEVER put this in the website code or share it in chat.

## Step 2 — Publishable key → the website (2 places)

1. In your project, open `.env.local` and fill:
   `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_…`
2. Netlify: **Site configuration → Environment variables → Add a variable**
   - Name `VITE_STRIPE_PUBLISHABLE_KEY`, value `pk_test_…`
3. Note: `VITE_` variables are baked in at **build time** — you must rebuild
   (`npm run build`) after adding them.

## Step 3 — Deploy the two Edge Functions

The code already exists in your project:
- `supabase/functions/create-payment-intent/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**Option A — Supabase CLI (recommended).** From the project root:

```
npm install -g supabase
supabase login                      # opens a browser, approve it
supabase link --project-ref euhcvlhuzryqgwrxwrmk
supabase functions deploy create-payment-intent --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
```

**Option B — Dashboard.** **https://supabase.com/dashboard/project/euhcvlhuzryqgwrxwrmk/functions**
→ New function → name it `create-payment-intent` → open the editor → replace
`index.ts` with the file's contents → Save. Repeat for `stripe-webhook`.
Then for each function: Settings → turn **OFF "Verify JWT"**.

## Step 4 — Register the webhook in Stripe

1. Go to **https://dashboard.stripe.com/test/webhooks**
2. Click **Add endpoint** (account-level, not "developer").
3. **Endpoint URL:** `https://euhcvlhuzryqgwrxwrmk.supabase.co/functions/v1/stripe-webhook`
4. **Events:** search and select `payment_intent.succeeded` AND
   `checkout.session.completed` → **Add endpoint**.
5. On the endpoint page, click **Reveal** next to *Signing secret* → copy the
   `whsec_…` value.

## Step 5 — Add the secrets in Supabase

**https://supabase.com/dashboard/project/euhcvlhuzryqgwrxwrmq/functions** → **Secrets** tab
→ New secret, twice:

| Key | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (from step 4) |

(Project-level secrets apply to both functions.)

## Step 6 — Rebuild & redeploy

1. `npm run build`
2. Drag the new `dist/` folder to Netlify (Deploys → drag & drop).

## Test the full loop

1. On the live site: book any session.
2. Success screen → **Pay $X deposit** → the payment panel opens on-page.
3. Card `4242 4242 4242 4242`, any future date, any CVC/ZIP → Pay.
4. Expect: "Payment received" panel → within seconds the desk (Bookings tab)
   shows **Paid ✓** + a Stripe chip; Insights' **Collected** updates.
5. Stripe test dashboard → Webhooks → your endpoint → recent attempts should be `200`.

## Going live (real money)

1. Stripe top-right: switch **Test mode → Live mode**. Copy `pk_live_` and `sk_live_`.
2. Supabase Secrets: update `STRIPE_SECRET_KEY` to `sk_live_`.
3. Stripe **live** Webhooks (https://dashboard.stripe.com/webhooks — no `/test/`):
   add the same endpoint URL + same 2 events → copy the NEW `whsec_` →
   update `STRIPE_WEBHOOK_SECRET`.
4. `.env.local` + Netlify env: `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_`.
5. Rebuild + redeploy. Do one real small payment, then refund it from Stripe.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Toast "Secure payments aren't connected yet" | Publishable key not baked in → rebuild; or function not deployed |
| Panel: "Couldn't start a secure session" | `STRIPE_SECRET_KEY` missing, or Verify JWT still ON for create-payment-intent |
| Stripe webhook attempts show **401** | Verify JWT still ON for stripe-webhook → turn off |
| Webhook attempts show **400** | `STRIPE_WEBHOOK_SECRET` doesn't match the signing secret → re-copy whsec |
| Webhook attempts show **404** | Function not deployed, or URL mistyped (no trailing slash) |
| Desk never flips to Paid | Check Webhooks → endpoint → Attempts for the error; fix per above |
