/**
 * IMAGINE · create-payment-intent — powers the ON-SITE deposit form.
 *
 * The client opens the in-page payment panel → calls this function with the
 * booking ref → this function computes the 30% deposit from the package price
 * (stored in site_content) and returns a Stripe PaymentIntent client secret.
 * The Stripe Payment Element on the website then confirms it — the client
 * never sees or controls the amount.
 *
 * DEPLOY:
 *   Supabase → Edge Functions → New function → name `create-payment-intent`
 *   → paste this file → Deploy → turn OFF "Verify JWT".
 *   Secrets (Edge Functions → Secrets):
 *     STRIPE_SECRET_KEY = sk_test_… / sk_live_…
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
  try {
    const { booking_ref } = (await req.json()) as { booking_ref?: string };
    if (!booking_ref) return json({ error: "booking_ref is required" }, 400);

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
    if (bErr || !bData) return json({ error: "Booking not found." }, 404);
    const booking = bData as unknown as BookingRow;

    /* the package price — the amount is decided HERE, server-side */
    const { data: cData } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "packages")
      .maybeSingle();
    const packages = (cData?.value ?? []) as unknown as PkgRow[];
    const pkg = packages.find((p) => p.id === booking.package_id);
    if (!pkg || !(pkg.price > 0)) return json({ error: "This package has no price set yet." }, 422);

    const amountCents = Math.round(pkg.price * 0.3 * 100); /* 30% deposit */

    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: booking.email,
      description: `Imagine deposit — ${pkg.name} (${booking.session})`,
      metadata: { booking_ref: booking.ref, package: pkg.name },
    });

    return json({
      client_secret: intent.client_secret,
      amount_cents: amountCents,
      package_name: pkg.name,
    });
  } catch (e) {
    console.error("create-payment-intent failed:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
