/**
 * OPTIONAL server-side notification path (Resend via a Supabase Edge Function).
 *
 * The site currently emails through EmailJS (see src/lib/notify.ts), which needs
 * no deployment. When you want emails sent from your own domain via Resend:
 *
 *   1. Install the Supabase CLI:  npm i -g supabase
 *   2. Log in & link:            supabase login && supabase link --project-ref euhcvlhuzryqgwrxwrmk
 *   3. Set secrets:              supabase secrets set RESEND_API_KEY=re_xxx STUDIO_INBOX=you@imaginarycapture.com
 *   4. Deploy:                   supabase functions deploy booking-email --no-verify-jwt
 *   5. In src/lib/notify.ts, replace the EmailJS sends with:
 *        supabase.functions.invoke("booking-email", { body: params })
 *
 * Resend free tier: 3 000 emails/month, 100/day — plenty for a studio.
 * Verify your sending domain in Resend (DNS takes a few minutes) so emails
 * arrive from bookings@imaginarycapture.com instead of onboarding@resend.dev.
 */

interface BookingPayload {
  booking_ref: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  session: string;
  package: string;
  date: string;
  time: string;
  guests: string;
  notes: string;
}

Deno.serve(async (req) => {
  try {
    const p = (await req.json()) as BookingPayload;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const studioInbox = Deno.env.get("STUDIO_INBOX") ?? "you@yourdomain.com";
    const from = Deno.env.get("RESEND_FROM") ?? "Imagine Studio <bookings@imaginarycapture.com>";
    if (!resendKey) return json({ error: "RESEND_API_KEY not set" }, 500);

    const body = (who: string) => `
      <h2 style="font-family:Georgia,serif">Booking ${p.booking_ref}</h2>
      <p><strong>${who}</strong></p>
      <table style="font-family:monospace;font-size:13px;border-collapse:collapse">
        ${row("Client", `${p.client_name} · ${p.client_email} · ${p.client_phone}`)}
        ${row("Session", p.session)}
        ${row("Package", p.package)}
        ${row("Date", `${p.date} at ${p.time}`)}
        ${row("Guests", p.guests)}
        ${row("Notes", p.notes)}
      </table>
      <p style="color:#667;font-size:12px">Sent from the Imagine studio desk.</p>`;

    const send = (to: string, subject: string, html: string, replyTo?: string) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
      });

    const [studio, client] = await Promise.allSettled([
      send(studioInbox, `New booking ${p.booking_ref} — ${p.session}`, body("A new booking landed in the ledger."), p.client_email),
      send(p.client_email, `Your Imagine booking ${p.booking_ref} is in the darkroom`, body("Thanks — here's what we've pencilled in."), undefined),
    ]);

    return json({
      studio: studio.status === "fulfilled" && studio.value.ok,
      client: client.status === "fulfilled" && client.value.ok,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function row(k: string, v: string) {
  return `<tr><td style="padding:4px 12px 4px 0;color:#667">${k}</td><td style="padding:4px 0">${v}</td></tr>`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
