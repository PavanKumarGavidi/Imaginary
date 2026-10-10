import { useEffect, useRef, useState } from "react";
import type { StripeElements, StripePaymentElement } from "@stripe/stripe-js";
import { getStripe, elementAppearance } from "../lib/stripe";
import { useStore } from "../store";
import type { Pkg } from "../data";
import { IconAperture, IconArrow, IconBack, IconCheck, IconLock, IconX } from "./Icons";

type Stage = "loading" | "ready" | "processing" | "success" | "error";

const fmt = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

const fmtDate = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

interface SavedBooking {
  ref: string;
  name: string;
  email: string;
  session: string;
  packageId: string;
  date: string;
  time: string;
  guests: number;
}

function FilmHoles({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-3 w-full ${className}`}
      style={{
        backgroundImage: "repeating-linear-gradient(90deg, rgba(242,249,254,0.7) 0 16px, transparent 16px 36px)",
        maskImage: "linear-gradient(90deg, transparent 0, black 3%, black 97%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0, black 3%, black 97%, transparent 100%)",
      }}
    />
  );
}

/**
 * Full-page secure deposit checkout (replaces the old modal — far more reliable
 * on mobile: native scrolling, no transform/blur ancestors around the Stripe
 * iframe, keyboard behaves normally).
 */
export default function DepositPage({ bookingRef }: { bookingRef: string }) {
  const { content, bookings, createPaymentIntent, setBookingDeposit, toast } = useStore();

  /* booking details travel via sessionStorage (visitors can't read the bookings table) */
  const [saved] = useState<SavedBooking | null>(() => {
    try {
      const raw = sessionStorage.getItem("imagine_deposit_booking");
      if (!raw) return null;
      const p = JSON.parse(raw) as SavedBooking;
      return p.ref === bookingRef ? p : null;
    } catch {
      return null;
    }
  });

  const pkg: Pkg | undefined = saved ? content.packages.find((p) => p.id === saved.packageId) : undefined;

  const [stage, setStage] = useState<Stage>("loading");
  const [amount, setAmount] = useState(() => Math.round((pkg?.price ?? 0) * 0.3 * 100));
  const [currency, setCurrency] = useState("usd");
  const [message, setMessage] = useState("");
  const [payRef, setPayRef] = useState("");
  const mountRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const paymentElRef = useRef<StripePaymentElement | null>(null);
  const paidRef = useRef(false);

  /* build the PaymentIntent + mount the element once */
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!saved || !pkg || pkg.price <= 0) {
        setMessage("We couldn't find this booking. Go back and start from your confirmation screen.");
        setStage("error");
        return;
      }
      const res = await createPaymentIntent(bookingRef);
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
        setMessage("Secure checkout isn't available on this device right now. Please try again, or we'll email you a payment link.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingRef]);

  const backToSite = () => {
    window.location.hash = "#top";
  };

  const pay = async () => {
    const stripe = await getStripe();
    const elements = elementsRef.current;
    if (!stripe || !elements || stage === "processing" || !saved) return;

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
          /* only used if the bank demands a 3-D Secure redirect */
          return_url: `${origin}#/payment/success?ref=${encodeURIComponent(bookingRef)}`,
        },
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message ?? "The payment was declined. No charge was made.");
        setStage("error");
        return;
      }

      /* card cleared without a redirect — show the receipt right here */
      paidRef.current = true;
      setPayRef(paymentIntent?.id ?? "");
      sessionStorage.setItem("imagine_last_booking_ref", bookingRef);
      /* local-mode consistency; in cloud the webhook flips this authoritatively */
      const local = bookings.find((b) => b.ref === bookingRef);
      if (local) setBookingDeposit(local.id, true);
      setStage("success");
      toast(`Deposit received — ${bookingRef} is locked in.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setMessage("Something interrupted the payment. Nothing was charged — please try again.");
      setStage("error");
    }
  };

  /* ——— booking not found ——— */
  if (!saved || !pkg) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-16 text-center">
        <IconAperture width={40} height={40} className="text-[var(--amber)]" />
        <h1 className="font-display mt-5 text-4xl text-[var(--ink)]">This checkout has expired.</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
          Payment links open from your booking confirmation. Head back, and tap
          <span className="font-semibold text-[var(--ink)]"> Pay deposit</span> again — it takes ten seconds.
        </p>
        <button onClick={backToSite} className="btn-solid mt-7">
          <IconBack width={15} height={15} /> Back to Imagine
        </button>
      </div>
    );
  }

  const balance = Math.round(pkg.price * 100) - amount;

  return (
    <div className="fade-in flex min-h-dvh flex-col bg-[var(--bg)]">
      {/* ————— secure bar ————— */}
      <div className="border-b border-[var(--line-soft)] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <IconLock width={14} height={14} className="text-[var(--sage)]" />
            <span className="font-mono text-[9.5px] tracking-[0.26em] uppercase text-[var(--muted)]">
              Imagine · Secure checkout
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--amber)]">{bookingRef}</span>
        </div>
      </div>

      {stage === "success" ? (
        /* ═══════════ the receipt — stays on this page ═══════════ */
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <div className="pop-in relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 right-0 z-10 rotate-[8deg] border-[2.5px] border-[var(--sage)] bg-white/70 px-3 py-1 font-display text-lg tracking-[0.22em] uppercase text-[var(--sage)] opacity-90"
            >
              Received
            </div>

            <h1 className="font-display text-4xl leading-tight text-[var(--ink)] sm:text-5xl">Payment received.</h1>
            <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
              Your date is officially on the calendar. Here's your studio receipt.
            </p>

            <div className="relative mt-6 overflow-hidden border border-[var(--line)] bg-[var(--panel)] shadow-[0_36px_70px_-45px_rgba(18,42,62,0.5)] sm:mt-8">
              <FilmHoles className="bg-[#10293e]" />

              <dl className="grid grid-cols-[92px_1fr] gap-x-3 gap-y-3 px-4 py-5 sm:grid-cols-[120px_1fr] sm:gap-x-4 sm:px-6">
                <dt className="label !mb-0">Reference</dt>
                <dd className="font-mono text-sm font-semibold tracking-[0.08em] text-[var(--amber)]">{bookingRef}</dd>

                <dt className="label !mb-0">Client</dt>
                <dd className="text-sm text-[var(--ink)]">{saved.name}</dd>

                <dt className="label !mb-0">Session</dt>
                <dd className="text-sm text-[var(--ink)]">{saved.session}</dd>

                <dt className="label !mb-0">Package</dt>
                <dd className="text-sm text-[var(--ink)]">{pkg.name}</dd>

                <dt className="label !mb-0">Call sheet</dt>
                <dd className="text-sm text-[var(--ink)]">
                  {fmtDate(saved.date)} · {saved.time} · {saved.guests} guest{saved.guests > 1 ? "s" : ""}
                </dd>

                {payRef && (
                  <>
                    <dt className="label !mb-0">Payment</dt>
                    <dd className="font-mono text-xs text-[var(--muted)]">Stripe · …{payRef.slice(-8)}</dd>
                  </>
                )}
              </dl>

              <div aria-hidden="true" className="mx-4 border-t-2 border-dashed border-[var(--line)] sm:mx-6" />

              <dl className="grid grid-cols-[92px_1fr] gap-x-3 gap-y-3 px-4 py-4 sm:grid-cols-[120px_1fr] sm:gap-x-4 sm:px-6">
                <dt className="label !mb-0">Paid today</dt>
                <dd className="font-display text-2xl leading-tight text-[var(--sage)]">{fmt(amount, currency)}</dd>

                <dt className="label !mb-0">Balance due</dt>
                <dd className="font-mono text-xs leading-relaxed text-[var(--muted)]">
                  {fmt(balance, currency)} · 48h before the session
                </dd>
              </dl>

              <FilmHoles className="bg-[#10293e]" />
            </div>

            <ol className="mt-6 space-y-3">
              {[
                <>A receipt is on its way to <span className="font-semibold text-[var(--ink)]">{saved.email}</span>.</>,
                <>The desk confirms your call sheet within <span className="font-semibold text-[var(--ink)]">24 hours</span>.</>,
                <>We'll remind you about the balance 48h before the session.</>,
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--muted)]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-[var(--line)] font-mono text-[10px] text-[var(--amber)]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <button onClick={backToSite} className="btn-solid mt-8 w-full justify-center sm:w-auto">
              Done — back to the studio <IconArrow width={15} height={15} />
            </button>
          </div>
        </main>
      ) : (
        /* ═══════════ the checkout ═══════════ */
        <>
          {/* ————— booking summary ————— */}
          <header className="relative overflow-hidden bg-[#10293e] text-[#f2f9fe]">
            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-14 select-none font-display text-[13rem] italic leading-none opacity-[0.06]">
              ƒ
            </div>
            <div className="relative mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#7ab8e6]">Secure deposit · booking</div>
                  <div className="mt-1 font-display text-2xl tracking-[0.06em] sm:text-3xl">{bookingRef}</div>
                  <div className="mt-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-[rgba(242,249,254,0.65)] sm:text-[10.5px]">
                    {pkg.name} · {fmtDate(saved.date)} · {saved.time}
                  </div>
                </div>
                <button
                  onClick={backToSite}
                  className="flex h-9 w-9 shrink-0 items-center justify-center border border-[rgba(242,249,254,0.25)] text-[#f2f9fe] transition-colors hover:border-[#7ab8e6] hover:text-[#7ab8e6]"
                  aria-label="Back to the website"
                >
                  <IconX width={15} height={15} />
                </button>
              </div>
              <div className="mt-4 flex items-end justify-between gap-3 border-t border-[rgba(242,249,254,0.15)] pt-3.5">
                <div>
                  <div className="font-mono text-[8.5px] tracking-[0.22em] uppercase text-[rgba(242,249,254,0.6)] sm:text-[9px]">30% deposit due today</div>
                  <div className="font-display text-4xl leading-tight text-[#8fd0f7] sm:text-5xl">{fmt(amount, currency)}</div>
                </div>
                <div className="pb-1 text-right font-mono text-[8.5px] leading-relaxed tracking-[0.14em] uppercase text-[rgba(242,249,254,0.5)] sm:text-[9px]">
                  Balance {fmt(balance, currency)}<br />due 48h before
                </div>
              </div>
            </div>
          </header>

          {/* ————— the card form ————— */}
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-40 pt-6 sm:px-6 sm:pb-44 sm:pt-8">
            <div className="border border-[var(--line)] bg-white p-5 shadow-[0_30px_70px_-50px_rgba(18,42,62,0.55)] sm:p-7">
              <div className="mb-4 flex items-center justify-between">
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

              {/* Stripe mounts the card form / wallets here — plain page context, ideal on mobile */}
              <div ref={mountRef} className={stage === "loading" ? "hidden" : "min-h-[190px]"} />

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
            </div>

            <p className="mt-4 flex items-center justify-center gap-2 px-4 text-center font-mono text-[8.5px] leading-relaxed tracking-[0.16em] uppercase text-[var(--dim)] sm:text-[9px]">
              <IconLock width={11} height={11} className="shrink-0 text-[var(--sage)]" />
              Card details are encrypted by Stripe and never touch our server
            </p>
          </main>

          {/* ————— pinned pay bar (always visible, above the keyboard) ————— */}
          <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/95 backdrop-blur"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
              <div className="min-w-0">
                <div className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-[var(--dim)]">Due now</div>
                <div className="font-display text-2xl leading-tight text-[var(--ink)]">{fmt(amount, currency)}</div>
              </div>
              <button
                onClick={pay}
                disabled={stage !== "ready" && stage !== "error"}
                className="btn-solid shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {stage === "processing" ? (
                  <>
                    <IconAperture width={16} height={16} className="animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    Pay deposit <IconArrow width={15} height={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
