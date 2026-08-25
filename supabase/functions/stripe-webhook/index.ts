/**
 * IMAGINE · Stripe webhook — automatic deposit confirmation.
 *
 * Stripe calls this after every successful payment. It flips the booking's
 * deposit_paid flag and writes a row into the payments ledger — the desk
 * updates itself, no manual "mark as paid" needed.
 *
 * Handles BOTH flows:
 *   · payment_intent.succeeded   → the on-site payment panel (DepositModal)
 *   · checkout.session.completed → legacy hosted-checkout redirects
 *
 * SETUP (via the Supabase dashboard):
 *   1. Edge Functions → "New function" → name it `stripe-webhook` → paste this file → Deploy
 *   2. On the function's page turn OFF "Verify JWT" (Stripe calls it, not the browser)
 *   3. Copy the endpoint URL:
 *        https://euhcvlhuzryqgwrxwrmk.supabase.co/functions/v1/stripe-webhook
 *   4. Stripe → Developers → Webhooks → "Add endpoint" → paste that URL →
 *      events: `payment_intent.succeeded` AND `checkout.session.completed`
 *      → Add → copy the "Signing secret" (whsec_…)
 *   5. Edge Functions → Secrets → add:
 *        STRIPE_SECRET_KEY     = sk_test_… (same as create-payment-intent)
 *        STRIPE_WEBHOOK_SECRET = whsec_…  (the signing secret from step 4)
 */
import Stripe from "npm:stripe@14.25.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function confirmDeposit(ref: string, amountCents: number, currency: string, stripeId: string) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  /* the moment money lands, the date is locked */
  await supabase.from("bookings").update({ deposit_paid: true }).eq("ref", ref);

  /* write to the payments ledger (tolerant — never lets Stripe retry-spam us) */
  const { error } = await supabase.from("payments").insert({
    booking_ref: ref,
    amount_cents: amountCents,
    currency,
    stripe_session_id: stripeId,
  });
  if (error) console.error(`payments insert failed for ${ref}:`, error.message);

  console.log(`Deposit confirmed for ${ref} — ${amountCents} ${currency}`);
}

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature ?? "",
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    return json({ error: `Webhook signature check failed: ${(err as Error).message}` }, 400);
  }

  try {
    /* ——— on-site payment panel ——— */
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const ref = pi.metadata?.booking_ref ?? null;
      if (ref) await confirmDeposit(ref, pi.amount_received ?? pi.amount, pi.currency, pi.id);
    }

    /* ——— legacy hosted checkout ——— */
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const ref = session.client_reference_id ?? session.metadata?.booking_ref ?? null;
      if (ref) await confirmDeposit(ref, session.amount_total ?? 0, session.currency ?? "usd", session.id);
    }
  } catch (e) {
    console.error("webhook processing error:", e);
    /* still 200 — Stripe shouldn't retry forever over a ledger hiccup */
  }

  return json({ received: true });
});
