import emailjs from "@emailjs/browser";
import type { Booking } from "../store";

/**
 * Booking notifications.
 *
 * Client-side path (active): EmailJS — free (200 emails/month), no server
 * deploy. Configure four values (see README → "Booking emails"):
 *
 *   VITE_EMAILJS_SERVICE_ID        your EmailJS service id
 *   VITE_EMAILJS_PUBLIC_KEY        Account → API keys → Public Key
 *   VITE_EMAILJS_STUDIO_TEMPLATE_ID  template that alerts the studio inbox
 *   VITE_EMAILJS_CLIENT_TEMPLATE_ID  template that confirms the client (optional)
 *
 * Server-side upgrade path: supabase/functions/booking-email (Resend via an
 * Edge Function) — swap `sendBookingEmails` for a `supabase.functions.invoke`
 * call once deployed; the call-site stays identical.
 */

const SERVICE = (import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined)?.trim();
const PUBLIC_KEY = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined)?.trim();
const STUDIO_TPL = (import.meta.env.VITE_EMAILJS_STUDIO_TEMPLATE_ID as string | undefined)?.trim();
const CLIENT_TPL = (import.meta.env.VITE_EMAILJS_CLIENT_TEMPLATE_ID as string | undefined)?.trim();

export const emailNotificationsEnabled = Boolean(SERVICE && PUBLIC_KEY && STUDIO_TPL);
export const clientEmailsEnabled = emailNotificationsEnabled && Boolean(CLIENT_TPL);

export interface BookingEmailResult {
  enabled: boolean;
  studio: boolean;
  client: boolean;
}

/** Fire the studio alert + client confirmation. Never throws — bookings must not fail on email errors. */
export async function sendBookingEmails(b: Booking, packageName: string): Promise<BookingEmailResult> {
  if (!emailNotificationsEnabled) return { enabled: false, studio: false, client: false };

  const params = {
    booking_ref: b.ref,
    client_name: b.name,
    client_email: b.email,
    client_phone: b.phone || "—",
    session: b.session,
    package: packageName,
    date: b.date,
    time: b.time,
    guests: String(b.guests),
    notes: b.notes || "—",
    reply_to: b.email,
  };

  const jobs: Promise<unknown>[] = [
    emailjs.send(SERVICE as string, STUDIO_TPL as string, params, { publicKey: PUBLIC_KEY as string }),
  ];
  if (CLIENT_TPL) {
    jobs.push(emailjs.send(SERVICE as string, CLIENT_TPL, params, { publicKey: PUBLIC_KEY as string }));
  }

  const results = await Promise.allSettled(jobs);
  return {
    enabled: true,
    studio: results[0].status === "fulfilled",
    client: CLIENT_TPL ? results[1].status === "fulfilled" : false,
  };
}
