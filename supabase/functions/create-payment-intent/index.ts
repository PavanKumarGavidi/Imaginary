/**
 * IMAGINE · create-payment-intent — powers the ON-SITE deposit form.
 *
 * The client opens the in-page payment panel → calls this function with the
 * booking ref → this function computes the 30% deposit from the package price
 * (published in site_content) and returns a Stripe PaymentIntent client secret.
 * The Stripe Payment Element on the website then confirms it — the client
 * never sees or controls the amount.
 *
 * DEPLOY:
 *   Supabase → Edge Functions → New function → name `create-payment-intent`
 *   → paste this file → Deploy → turn OFF "Verify JWT".
 *   Secrets (Edge Functions → Secrets):
 *     STRIPE_SECRET_KEY = sk_test_… / sk_live_…
 *     STRIPE_CURRENCY   = usd (default) — set `inr` for India-based accounts, etc.
 *
 * All handled errors return HTTP 200 with { ok:false, error } so the website
 * can show the real reason instead of a generic message.
 */
import Stripe from "npm:stripe@14.25.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

interface BookingRow {
  ref: string;
  name: string;
  email: string;
  session: string;
  package_id: string;
  date: string;
  time: string;
}
interface PkgRow {
  id: string;
  name: string;
  price: number;
}

Deno.serve(async (req) => {
  /* CORS — the website calls this directly from the browser */
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  const send = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: cors });

  try {
    let booking_ref = "";
    try {
      booking_ref = String(((await req.json()) as { booking_ref?: string }).booking_ref ?? "");
    } catch {
      return send({ ok: false, error: "The request body was empty — refresh the page and try again." });
    }
    if (!booking_ref) return send({ ok: false, error: "Missing booking reference." });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /* the booking */
    const { data: bData, error: bErr } = await supabase
      .from("bookings")
      .select("ref,name,email,session,package_id,date,time")
      .eq("ref", booking_ref)
      .maybeSingle();
    if (bErr) return send({ ok: false, error: `Couldn't read the bookings table: ${bErr.message}` });
    if (!bData) return send({ ok: false, error: `Booking ${booking_ref} wasn't found in the ledger.` });
    const booking = bData as unknown as BookingRow;

    /* the package price — the amount is decided HERE, server-side */
    const { data: cData, error: cErr } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "packages")
      .maybeSingle();
    if (cErr) return send({ ok: false, error: `Couldn't read site content: ${cErr.message}` });

    const packages = (cData?.value ?? []) as unknown as PkgRow[];
    if (!Array.isArray(packages) || packages.length === 0) {
      return send({
        ok: false,
        error:
          "Package prices haven't been published to the database yet. Open the admin desk → Content tab → Packages, and click “Publish changes” once — then try paying again.",
      });
    }
    const pkg = packages.find((p) => p.id === booking.package_id);
    if (!pkg) {
      return send({ ok: false, error: `The package for ${booking_ref} isn't in the published packages list.` });
    }
    if (!(pkg.price > 0)) {
      return send({ ok: false, error: `“${pkg.name}” has no price set — edit it under Content → Packages.` });
    }

    const currency = (Deno.env.get("STRIPE_CURRENCY") ?? "usd").toLowerCase();
    const amountCents = Math.round(pkg.price * 0.3 * 100); /* 30% deposit */

    /* Try the flexible setup first (card + wallets). Some accounts' enabled
       payment methods don't support the chosen currency — in that case fall
       back to card-only, which Stripe supports in every currency. */
    let intent: Stripe.PaymentIntent;
    try {
      intent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency,
        automatic_payment_methods: { enabled: true },
        receipt_email: booking.email,
        description: `Imagine deposit — ${pkg.name} (${booking.session})`,
        metadata: { booking_ref: booking.ref, package: pkg.name },
      });
    } catch (firstErr) {
      const reason = (firstErr as Error).message ?? "";
      if (/payment method|currency/i.test(reason)) {
        intent = await stripe.paymentIntents.create({
          amount: amountCents,
          currency,
          payment_method_types: ["card"],
          receipt_email: booking.email,
          description: `Imagine deposit — ${pkg.name} (${booking.session})`,
          metadata: { booking_ref: booking.ref, package: pkg.name },
        });
      } else {
        throw firstErr;
      }
    }

    return send({
      ok: true,
      client_secret: intent.client_secret,
      amount_cents: amountCents,
      currency,
      package_name: pkg.name,
    });
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    console.error("create-payment-intent failed:", msg);
    /* friendly hint for the two most common Stripe account errors */
    if (/currency/i.test(msg) && /not supported|invalid/i.test(msg)) {
      return send({
        ok: false,
        error: `Stripe says: ${msg} — set the STRIPE_CURRENCY Edge Function secret to your account's currency (e.g. "inr") and redeploy this function.`,
      });
    }
    return send({ ok: false, error: `Stripe error: ${msg}` });
  }
});
