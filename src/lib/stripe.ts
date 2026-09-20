import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

/**
 * Stripe.js (publishable key — safe to ship to the browser).
 * The secret key lives ONLY in the Edge Functions' secrets.
 */
const pk = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined)?.trim() ?? "";

export const stripePublishableKey = pk;
export const stripeOnSiteEnabled = Boolean(pk);

let promise: Promise<Stripe | null> | null = null;

/** Lazily load Stripe.js once and reuse it everywhere. */
export function getStripe(): Promise<Stripe | null> {
  if (!pk) return Promise.resolve(null);
  if (!promise) promise = loadStripe(pk);
  return promise;
}

/** The Payment Element look, matched to the Imagine sky/white identity. */
export const elementAppearance = {
  theme: "flat" as const,
  variables: {
    colorPrimary: "#0d7fc2",
    colorBackground: "#ffffff",
    colorText: "#122a3e",
    colorDanger: "#d05b45",
    colorSuccess: "#2f8a63",
    fontFamily: '"Figtree", "Segoe UI", sans-serif',
    fontSizeBase: "15px",
    borderRadius: "2px",
    spacingUnit: "5px",
  },
  rules: {
    ".Input": {
      border: "1px solid #cfe2f1",
      padding: "11px 13px",
      transition: "border-color .2s ease, box-shadow .2s ease",
    },
    ".Input:focus": {
      border: "1px solid #0d7fc2",
      boxShadow: "0 0 0 3px rgba(13,127,194,0.15)",
    },
    ".Input--invalid": { border: "1px solid #d05b45" },
    ".Label": { fontWeight: "500", fontSize: "13px", color: "#42607c" },
    ".Tab": { border: "1px solid #cfe2f1", background: "#f4f9fd" },
    ".Tab--selected": { background: "#ffffff", border: "1px solid #0d7fc2" },
  },
};
