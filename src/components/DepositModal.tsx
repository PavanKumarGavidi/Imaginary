import { useEffect, useRef, useState } from "react";
import type { StripeElements, StripePaymentElement } from "@stripe/stripe-js";
import { getStripe, elementAppearance } from "../lib/stripe";
import { useStore } from "../store";
import type { Booking } from "../store";
import type { Pkg } from "../data";
import { IconAperture, IconArrow, IconCheck, IconX } from "./Icons";

type Stage = "loading" | "ready" | "processing" | "success" | "error";

const fmt = (cents: number, currency = "usd") => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
};
const fmtDate = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

/**
 * On-site 30% deposit payment. The Stripe Payment Element (card form + wallets)
 * renders inside this modal on the same page — the client never leaves the site.
 */
export default function DepositModal({ booking, pkg, onClose }: { booking: Booking; pkg: Pkg; onClose: () => void }) {
  const { createPaymentIntent, toast } = useStore();
  const [stage, setStage] = useState<Stage>("loading");
  const [amount, setAmount] = useState(() => Math.round(pkg.price * 0.3 * 100));
  const [currency, setCurrency] = useState("usd");
  const [message, setMessage] = useState("");
  const mountRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const paymentElRef = useRef<StripePaymentElement | null>(null);
  const paidRef = useRef(false);

  /* build the PaymentIntent + mount the element once */
  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await createPaymentIntent(booking.ref);
      if (!alive) return;
      if (!res.ok) {
        setMessage(res.message);
        setStage("error");
        return;
      }
      setAmount(res.amountCents);
      setCurrency(res.currency);

      const stripe = await getStripe();
      if (!alive) return;
      if (!stripe) {
        setMessage("Payments aren't configured on this device yet.");
        setStage("error");
        return;
      }

      const elements = stripe.elements({ clientSecret: res.clientSecret, appearance: elementAppearance, loader: "auto" });
      const el = elements.create("payment");
      elementsRef.current = elements;
      paymentElRef.current = el;
      if (mountRef.current) el.mount(mountRef.current);
      setStage("ready");
    })();
    return () => {
      alive = false;
      try {
        paymentElRef.current?.destroy();
      } catch {
        /* already unmounted */
      }
    };
  }, [booking.ref, createPaymentIntent]);

  /* lock page scroll while open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* esc / backdrop close — disabled while money is moving */
  const closeable = stage === "ready" || stage === "success" || stage === "error";
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeable) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeable, onClose]);

  const pay = async () => {
    const stripe = await getStripe();
    const elements = elementsRef.current;
    if (!stripe || !elements || stage === "processing") return;

    setStage("processing");
    setMessage("");
    try {
      /* validate the card fields first */
      const { error: submitErr } = await elements.submit();
      if (submitErr) {
        setMessage(submitErr.message ?? "Check the card details and try again.");
        setStage("error");
        return;
      }

      const origin = window.location.origin + window.location.pathname;
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          /* only used if the bank demands a 3-D Secure redirect */
          return_url: `${origin}#/payment/success?ref=${encodeURIComponent(booking.ref)}`,
        },
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message ?? "The payment was declined. No charge was made.");
        setStage("error");
        return;
      }

      /* No redirect needed — the card cleared immediately. */
      paidRef.current = true;
      sessionStorage.setItem("imagine_last_booking_ref", booking.ref);
      setStage("success");
      toast(`Deposit received — ${booking.ref} is locked in.`);
    } catch {
      setMessage("Something interrupted the payment. Nothing was charged — please try again.");
      setStage("error");
    }
  };

  return (
    <div
      className="fade-in fixed inset-0 z-[90] flex items-end justify-center bg-[rgba(18,42,62,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={() => closeable && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Pay your deposit"
    >
      <div
        className="pop-in relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden border border-[var(--line)] bg-white shadow-[0_50px_120px_-40px_rgba(18,42,62,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ————— header: booking summary strip ————— */}
        <div className="relative overflow-hidden bg-[#10293e] px-6 py-5 text-[#f2f9fe] sm:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-10 select-none font-display text-[10rem] italic leading-none opacity-[0.07]">
            ƒ
          </div>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[9.5px] tracking-[0.3em] uppercase text-[#7ab8e6]">Secure deposit · booking</div>
              <div className="mt-1 font-display text-2xl tracking-[0.08em]">{booking.ref}</div>
              <div className="mt-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-[rgba(242,249,254,0.65)]">
                {pkg.name} · {fmtDate(booking.date)} · {booking.time}
              </div>
            </div>
            <button
              onClick={() => closeable && onClose()}
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-[rgba(242,249,254,0.25)] text-[#f2f9fe] transition-colors hover:border-[#7ab8e6] hover:text-[#7ab8e6]"
              aria-label="Close payment window"
            >
              <IconX width={16} height={16} />
            </button>
          </div>
          <div className="relative mt-4 flex items-end justify-between border-t border-[rgba(242,249,254,0.15)] pt-3.5">
            <div>
              <div className="font-mono text-[9px] tracking-[0.24em] uppercase text-[rgba(242,249,254,0.6)]">30% deposit due today</div>
              <div className="font-display text-4xl leading-tight text-[#8fd0f7]">{fmt(amount, currency)}</div>
            </div>
            <div className="pb-1 text-right font-mono text-[9px] leading-relaxed tracking-[0.18em] uppercase text-[rgba(242,249,254,0.5)]">
              Balance {fmt(Math.round(pkg.price * 100) - amount, currency)}<br />due 48h before the session
            </div>
          </div>
        </div>

        {/* ————— body ————— */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {stage === "success" ? (
            <div className="pop-in flex flex-col items-center py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--sage)] bg-[rgba(47,138,99,0.08)] text-[var(--sage)]">
                <IconCheck width={30} height={30} />
              </div>
              <h3 className="font-display mt-5 text-3xl text-[var(--ink)]">Payment received.</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">{fmt(amount, currency)}</span> is on its way to the studio and{" "}
                <span className="font-semibold text-[var(--ink)]">{booking.ref}</span> is now locked in. A receipt is in
                your inbox — we'll see you on set.
              </p>
              <button onClick={onClose} className="btn-solid mt-6">
                Back to your confirmation <IconArrow width={15} height={15} />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="label !mb-0">Payment details</span>
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--dim)]">Powered by Stripe</span>
              </div>

              {stage === "loading" && (
                <div className="space-y-3" aria-hidden="true">
                  <div className="h-12 animate-pulse border border-[var(--line-soft)] bg-[var(--bg2)]" />
                  <div className="h-12 animate-pulse border border-[var(--line-soft)] bg-[var(--bg2)]" />
                  <div className="h-12 animate-pulse border border-[var(--line-soft)] bg-[var(--bg2)]" />
                </div>
              )}

              {/* Stripe mounts the card form / wallets here — stays on this page */}
              <div ref={mountRef} className={stage === "loading" ? "hidden" : "min-h-[140px]"} />

              {stage === "loading" && (
                <p className="mt-3 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
                  Contacting the payment desk…
                </p>
              )}

              {message && stage === "error" && (
                <div className="mt-4 border border-[var(--ember)]/50 bg-[rgba(208,91,69,0.07)] px-4 py-3 text-sm text-[var(--ember)]">
                  {message}
                  {/wasn't found in the ledger/i.test(message) && (
                    <span className="mt-2 block text-[var(--muted)]">
                      This usually means the booking didn't sync to the studio. Close this panel and submit the booking form
                      again — you'll now see a clear note if the save fails.
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={pay}
                disabled={stage !== "ready" && stage !== "error"}
                className="btn-solid mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                {stage === "processing" ? (
                  <>
                    <IconAperture width={17} height={17} className="animate-spin" /> Processing securely…
                  </>
                ) : (
                  <>
                    Pay {fmt(amount, currency)} deposit <IconArrow width={15} height={15} />
                  </>
                )}
              </button>

              <p className="mt-4 flex items-center justify-center gap-2 text-center font-mono text-[9px] leading-relaxed tracking-[0.16em] uppercase text-[var(--dim)]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                </svg>
                Card details are encrypted by Stripe and never touch our server
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
