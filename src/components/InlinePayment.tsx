import { useEffect, useRef, useState } from "react";
import type { StripeElements, StripePaymentElement } from "@stripe/stripe-js";
import { getStripe, elementAppearance } from "../lib/stripe";
import { useStore } from "../store";
import type { Booking } from "../store";
import type { Pkg } from "../data";
import { IconAperture, IconArrow, IconCheck, IconLock } from "./Icons";

type Stage = "loading" | "ready" | "processing" | "success" | "error";

const fmt = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

/**
 * Inline Stripe payment form for desktop (stays on the same page).
 * Mobile uses the full DepositPage instead.
 */
export default function InlinePayment({ booking, pkg, onSuccess }: { booking: Booking; pkg: Pkg; onSuccess: () => void }) {
  const { createPaymentIntent, setBookingDeposit, toast } = useStore();
  const [stage, setStage] = useState<Stage>("loading");
  const [amount, setAmount] = useState(() => Math.round(pkg.price * 0.3 * 100));
  const [currency, setCurrency] = useState("usd");
  const [message, setMessage] = useState("");
  const mountRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const paymentElRef = useRef<StripePaymentElement | null>(null);

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
        setMessage("Secure checkout isn't available right now.");
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

  const pay = async () => {
    const stripe = await getStripe();
    const elements = elementsRef.current;
    if (!stripe || !elements || stage === "processing") return;

    setStage("processing");
    setMessage("");
    try {
      const { error: submitErr } = await elements.submit();
      if (submitErr) {
        setMessage(submitErr.message ?? "Check the card details and try again.");
        setStage("error");
        return;
      }

      const origin = window.location.origin + window.location.pathname;
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${origin}#/payment/success?ref=${encodeURIComponent(booking.ref)}`,
        },
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message ?? "The payment was declined. No charge was made.");
        setStage("error");
        return;
      }

      setBookingDeposit(booking.id, true);
      setStage("success");
      toast(`Deposit received — ${booking.ref} is locked in.`);
      onSuccess();
    } catch {
      setMessage("Something interrupted the payment. Nothing was charged — please try again.");
      setStage("error");
    }
  };

  if (stage === "success") {
    return (
      <div className="pop-in mt-6 border border-[var(--sage)]/50 bg-[rgba(47,138,99,0.06)] p-5">
        <div className="flex items-start gap-3.5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--sage)]/60 bg-[rgba(47,138,99,0.12)] text-[var(--sage)]">
            <IconCheck width={16} height={16} />
          </span>
          <div>
            <div className="font-display text-xl text-[var(--ink)]">Deposit paid — your date is locked.</div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              <span className="font-semibold text-[var(--ink)]">{fmt(amount, currency)}</span> received via Stripe · balance of{" "}
              <span className="font-semibold text-[var(--ink)]">{fmt(Math.round(pkg.price * 100) - amount, currency)}</span> due 48 hours before the
              session. Your call sheet lands in your inbox within 24 hours.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[9px] tracking-[0.16em] uppercase">
              <span className="flex items-center gap-1.5 border border-[var(--sage)]/50 bg-[rgba(47,138,99,0.1)] px-2.5 py-1 text-[var(--sage)]">
                <IconCheck width={10} height={10} /> Deposit
              </span>
              <span className="text-[var(--dim)]">→</span>
              <span className="border border-[var(--line)] px-2.5 py-1 text-[var(--muted)]">Call sheet · 24h</span>
              <span className="text-[var(--dim)]">→</span>
              <span className="border border-[var(--line)] px-2.5 py-1 text-[var(--muted)]">Shoot day</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border border-[var(--line)] bg-[var(--panel)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="label !mb-0">Secure deposit payment</span>
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--dim)]">Powered by Stripe</span>
      </div>

      {stage === "loading" && (
        <div className="space-y-3" aria-hidden="true">
          <div className="h-12 animate-pulse border border-[var(--line-soft)] bg-[var(--bg2)]" />
          <div className="h-12 animate-pulse border border-[var(--line-soft)] bg-[var(--bg2)]" />
        </div>
      )}

      <div ref={mountRef} className={stage === "loading" ? "hidden" : "min-h-[140px]"} />

      {stage === "loading" && (
        <p className="mt-3 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
          Contacting the payment desk…
        </p>
      )}

      {message && stage === "error" && (
        <div className="mt-4 border border-[var(--ember)]/50 bg-[rgba(208,91,69,0.07)] px-4 py-3 text-sm leading-relaxed text-[var(--ember)]">
          {message}
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

      <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
        <IconLock width={11} height={11} className="text-[var(--sage)]" /> Card details are encrypted by Stripe and never touch our server
      </p>
    </div>
  );
}
