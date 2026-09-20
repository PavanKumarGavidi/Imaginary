import { useEffect, useState } from "react";
import { useStore } from "../store";
import { IconAperture, IconArrow, IconCheck, IconLock } from "./Icons";
import { Reveal } from "./ui";

type PayState = "success" | "canceled" | "unknown";

function parseState(): { state: PayState; sessionId: string | null } {
  const hash = window.location.hash;
  const sessionId = new URLSearchParams(hash.split("?")[1] ?? "").get("session_id");
  if (hash.includes("/success")) return { state: "success", sessionId };
  if (hash.includes("/canceled") || hash.includes("/cancel")) return { state: "canceled", sessionId: null };
  return { state: "unknown", sessionId };
}

/** Landing page after Stripe Checkout — reached at #/payment/success or #/payment/canceled. */
export default function PaymentSuccess() {
  const { bookings } = useStore();
  const [{ state, sessionId }] = useState(parseState);
  const [ref] = useState(() => sessionStorage.getItem("imagine_last_booking_ref") ?? "");

  /* keep the desk ledger fresh so the deposit chip flips the moment the webhook lands */
  useEffect(() => {
    const t = window.setTimeout(() => window.location.reload(), state === "success" ? 8000 : 0);
    return () => window.clearTimeout(t);
  }, [state]);

  const booking = bookings.find((b) => b.ref === ref) ?? null;
  const depositPaid = booking?.depositPaid ?? false;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      {/* soft ambient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            state === "success"
              ? "radial-gradient(700px 420px at 50% 18%, rgba(47,138,99,0.14), transparent 65%)"
              : "radial-gradient(700px 420px at 50% 18%, rgba(13,127,194,0.12), transparent 65%)",
        }}
      />

      <div className="relative w-full max-w-xl">
        <Reveal>
          <div className="panel pop-in border-t-2 p-8 text-center md:p-10" style={{ borderTopColor: state === "success" ? "var(--sage)" : "var(--amber)" }}>
            {/* mark */}
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 ${
                state === "success" ? "border-[var(--sage)]/60 bg-[rgba(47,138,99,0.1)] text-[var(--sage)]" : "border-[var(--amber)]/60 bg-[rgba(13,127,194,0.08)] text-[var(--amber)]"
              }`}
            >
              {state === "success" ? <IconCheck width={28} height={28} /> : <IconAperture width={28} height={28} />}
            </div>

            <div className="mt-6 font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--dim)]">
              {state === "success" ? "Payment received" : "Checkout"}
            </div>

            {state === "success" ? (
              <>
                <h1 className="font-display mt-2 text-4xl leading-tight text-[var(--ink)] md:text-5xl">
                  Your date is <em className="italic text-[var(--sage)]">locked in</em>.
                </h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                  The deposit cleared and your session is confirmed. A receipt is on its way to your inbox,
                  and we'll reach out personally within 24 hours with the final details.
                </p>

                {ref && (
                  <div className="mx-auto mt-6 max-w-xs border border-[var(--line-soft)] bg-[var(--bg2)] px-5 py-4">
                    <div className="font-mono text-[9px] tracking-[0.26em] uppercase text-[var(--dim)]">Your reference</div>
                    <div className="font-display mt-1 text-3xl tracking-[0.12em] text-[var(--amber)]">{ref}</div>
                    {sessionId && (
                      <div className="mt-2 truncate font-mono text-[9px] text-[var(--dim)]" title={sessionId}>
                        Stripe session · {sessionId.slice(0, 22)}…
                      </div>
                    )}
                    <div
                      className={`mt-3 inline-flex items-center gap-2 border px-3 py-1 font-mono text-[9px] tracking-[0.2em] uppercase ${
                        depositPaid
                          ? "border-[var(--sage)]/50 text-[var(--sage)]"
                          : "border-[var(--amber)]/40 bg-[rgba(13,127,194,0.07)] text-[var(--amber)]"
                      }`}
                    >
                      <span className={`pulse-dot h-1.5 w-1.5 rounded-full ${depositPaid ? "bg-[var(--sage)]" : "bg-[var(--amber)]"}`} />
                      {depositPaid ? "Deposit confirmed" : "Confirming deposit…"}
                    </div>
                  </div>
                )}

                <div className="mx-auto mt-6 grid max-w-sm gap-2 text-left">
                  {[
                    "We email you within 24h to plan the sitting",
                    "Balance is due 48h before the session",
                    "Reschedule once, free, with 72h notice",
                  ].map((s) => (
                    <div key={s} className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--muted)]">
                      <IconCheck width={14} height={14} className="mt-0.5 shrink-0 text-[var(--sage)]" />
                      {s}
                    </div>
                  ))}
                </div>
              </>
            ) : state === "canceled" ? (
              <>
                <h1 className="font-display mt-2 text-4xl leading-tight text-[var(--ink)] md:text-5xl">
                  No charge was <em className="italic text-[var(--amber)]">made</em>.
                </h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                  You closed the checkout before paying — that's perfectly fine. Your booking request is still
                  saved, and you can settle the deposit any time, or we'll confirm it within 24 hours.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display mt-2 text-4xl leading-tight text-[var(--ink)]">Payment</h1>
                <p className="mx-auto mt-4 max-w-md text-sm text-[var(--muted)]">Taking you back to the studio…</p>
              </>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#work" className="btn-solid">
                Browse the archive <IconArrow width={15} height={15} />
              </a>
              {state === "canceled" ? (
                <a href="#book" className="btn-ghost">
                  Return to booking
                </a>
              ) : (
                <a href="#top" className="btn-ghost">
                  Back to the studio
                </a>
              )}
            </div>

            <p className="mt-6 flex items-center justify-center gap-1.5 font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--dim)]">
              <IconLock width={11} height={11} /> Secured by Stripe · card, Apple Pay, Google Pay
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
