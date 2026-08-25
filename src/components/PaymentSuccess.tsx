import { IconAperture, IconArrow, IconCheck, IconLock } from "./Icons";

/** Confirmation screen after a Stripe deposit checkout completes. */
export default function PaymentSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="pop-in w-full max-w-lg border border-[var(--line)] bg-[var(--panel)] p-8 text-center shadow-[0_36px_70px_-40px_rgba(16,41,62,0.5)] md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--sage)]/50 bg-[rgba(47,138,99,0.08)]">
          <IconCheck width={28} height={28} className="text-[var(--sage)]" />
        </div>
        <div className="mt-6 font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--sage)]">Deposit received</div>
        <h1 className="font-display mt-3 text-4xl leading-tight text-[var(--ink)] md:text-5xl">
          Your date is <em className="italic text-[var(--amber)]">locked.</em>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          Thank you — your 30% deposit cleared and your session is now confirmed in our ledger. A receipt is on its way
          from Stripe, and the desk will be in touch within 24 hours to plan the details. The balance is due 48 hours
          before the session.
        </p>
        <div className="mt-6 flex items-center justify-center gap-1.5 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
          <IconLock width={11} height={11} className="text-[var(--sage)]" /> Processed securely by Stripe
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a href="#book" className="btn-solid">
            <IconAperture width={16} height={16} /> Back to the studio
          </a>
          <a href="#top" className="btn-ghost">
            Keep browsing <IconArrow width={15} height={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
