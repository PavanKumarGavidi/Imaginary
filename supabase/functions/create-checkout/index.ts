/**
 * IMAGINE · Stripe Checkout — deposit session creator.
 *
 * Creates a Stripe Checkout session for a booking's 30% deposit. The amount is
 * computed HERE (server-side) from the package price stored in site_content, so
 * clients can never tamper with the price — they only ever pass their booking ref.
 *
 * SETUP (via the Supabase dashboard, no CLI needed):
 *   1. Edge Functions → "New function" → name it `create-checkout` → paste this file → Deploy
 *   2. On the function's page turn OFF "Verify JWT" (clients call it before signing in)
 *   3. Edge Functions → Secrets → add:  STRIPE_SECRET_KEY = sk_test_… (or sk_live_…)
 *
 * Test with sk_test_ keys and card 4242 4242 4242 4242, any future date, any CVC.
 */
import Stripe from "npm:stripe@14.25.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { booking_ref, success_url, cancel_url } = (await req.json()) as {
      booking_ref?: string;
      success_url?: string;
      cancel_url?: string;
    };
    if (!booking_ref) return json({ error: "booking_ref is required" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    /* look up the booking (service role — bookings are not public) */
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, ref, package_id, email")
      .eq("ref", booking_ref)
      .maybeSingle();
    if (!booking) return json({ error: "Booking not found — the reference may be mistyped." }, 404);

    /* find the package price from the site's published content */
    let price = 0;
    let pkgName = "Studio session";
    const { data: content } = await supabase.from("site_content").select("value").eq("key", "packages").maybeSingle();
    const pkgs = (content?.value as { id: string; name: string; price: number }[] | null) ?? [];
    const pkg = pkgs.find((p) => p.id === booking.package_id);
    if (pkg) {
      price = Number(pkg.price) || 0;
      pkgName = pkg.name;
    }
    if (price <= 0) return json({ error: "No package price on file for this booking." }, 400);

    /* 30% deposit, in cents */
    const depositCents = Math.round(price * 0.3 * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: `Imagine deposit (30%) — ${pkgName}`,
              description: `Booking ${booking.ref} · balance due 48h before the session`,
            },
            unit_amount: depositCents,
          },
        },
      ],
      customer_email: booking.email || undefined,
      client_reference_id: booking.ref,
      metadata: { booking_ref: booking.ref, booking_id: booking.id },
      success_url:
        success_url || "https://imaginarycapture.netlify.app/#/payment/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancel_url || "https://imaginarycapture.netlify.app/#/payment/canceled",
    });

    return json({ url: session.url, amount_cents: depositCents });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
