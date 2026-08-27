import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { hasRecoveryInUrl } from "../lib/supabase";
import { emailNotificationsEnabled, sendTestBookingEmails } from "../lib/notify";
import { useStore } from "../store";
import type { Booking, BookingStatus } from "../store";
import {
  IconAperture,
  IconBack,
  IconBell,
  IconCalendar,
  IconCheck,
  IconDots,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconKey,
  IconLogout,
  IconMail,
  IconPhone,
  IconPrint,
  IconSearch,
  IconTrash,
  IconUsers,
  IconX,
} from "./Icons";
import { SafeImg, ScrambleText } from "./ui";
import { ContentPanel, DeliveriesPanel, GalleryPanel, JournalPanel, PhotosPanel, ReviewsPanel, TeamPanel } from "./AdminPanels";
import Insights from "./Insights";
import SystemCheck from "./SystemCheck";
import { stripeUrl } from "../lib/util";

const STATUS_META: Record<BookingStatus, { label: string; dot: string; pill: string }> = {
  pending: { label: "Pending", dot: "bg-[var(--amber)]", pill: "border-[var(--amber)]/50 bg-[rgba(13,127,194,0.1)] text-[var(--amber)]" },
  confirmed: { label: "Confirmed", dot: "bg-[var(--amber-soft)]", pill: "border-[var(--amber-soft)]/60 bg-[rgba(59,163,224,0.12)] text-[#0b6cab]" },
  completed: { label: "Completed", dot: "bg-[var(--sage)]", pill: "border-[var(--sage)]/50 bg-[rgba(47,138,99,0.1)] text-[var(--sage)]" },
  cancelled: { label: "Cancelled", dot: "bg-[var(--ember)]", pill: "border-[var(--ember)]/50 bg-[rgba(208,91,69,0.1)] text-[var(--ember)]" },
};

const fmtDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

const TABS = [
  { id: "bookings", label: "Bookings" },
  { id: "reviews", label: "Reviews" },
  { id: "team", label: "Team" },
  { id: "gallery", label: "Gallery" },
  { id: "photos", label: "Photos" },
  { id: "content", label: "Content" },
  { id: "journal", label: "Journal" },
  { id: "deliveries", label: "Deliveries" },
] as const;
type Tab = (typeof TABS)[number]["id"];

/* ————————————————— LOGIN ————————————————— */
type AuthView = "signin" | "forgot" | "sent" | "reset" | "done";

export function LoginPage({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const { login, requestReset, setNewPassword, toast, cloud, recovery, sitePhotos } = useStore();
  const [view, setView] = useState<AuthView>(() => (recovery || hasRecoveryInUrl() ? "reset" : "signin"));

  /* Supabase may confirm the recovery session a moment after the page mounts */
  useEffect(() => {
    if (recovery && view === "signin") setView("reset");
  }, [recovery, view]);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [show, setShow] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [sentTo, setSentTo] = useState("");

  /* once the new password lands, glide into the desk */
  useEffect(() => {
    if (view !== "done") return;
    const t = window.setTimeout(onSuccess, 1600);
    return () => window.clearTimeout(t);
  }, [view, onSuccess]);

  const switchView = (v: AuthView) => {
    setView(v);
    setError("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const err = await login(user, pass);
    setBusy(false);
    if (!err) {
      toast(cloud ? "Signed in — desk synced with Supabase." : "Welcome back — the desk is live.");
      onSuccess();
    } else {
      setError(cloud ? err : "Credentials not recognised. Try the demo pair below.");
      setShakeKey((k) => k + 1);
    }
  };

  const sendReset = async () => {
    if (busy) return;
    if (!/.+@.+\..+/.test(user.trim())) {
      setError("Enter the email you sign in with.");
      setShakeKey((k) => k + 1);
      return;
    }
    setBusy(true);
    const err = await requestReset(user);
    setBusy(false);
    if (!err) {
      setSentTo(user.trim());
      switchView("sent");
    } else {
      setError(err);
      setShakeKey((k) => k + 1);
    }
  };

  const submitForgot = async (e: FormEvent) => {
    e.preventDefault();
    await sendReset();
  };

  const submitReset = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (newPass.length < 8) {
      setError("Use at least 8 characters — this key opens the whole desk.");
      setShakeKey((k) => k + 1);
      return;
    }
    if (newPass !== confirmPass) {
      setError("The two passwords don't match.");
      setShakeKey((k) => k + 1);
      return;
    }
    setBusy(true);
    const err = await setNewPassword(newPass);
    setBusy(false);
    if (!err) {
      toast("Password updated — welcome back.");
      switchView("done");
    } else {
      setError(err);
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <SafeImg src={sitePhotos.login} alt="Editorial frame from the Imagine archive" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(246,250,253,0.97)_8%,rgba(246,250,253,0.8)_55%,rgba(246,250,253,0.93))]" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <IconAperture width={26} height={26} className="text-[var(--amber)]" />
            <div className="leading-none">
              <div className="font-display text-2xl tracking-[0.08em] text-[var(--ink)]">IMAGINE</div>
              <div className="font-mono mt-1 text-[9px] tracking-[0.32em] text-[var(--muted)]">BACK OFFICE</div>
            </div>
          </div>
          <div>
            <p className="font-display max-w-md text-6xl leading-[0.98] text-[var(--ink)]">
              The desk sees <span className="italic text-[var(--amber)]">everything.</span>
            </p>
            <p className="mt-5 max-w-sm font-mono text-[11px] leading-relaxed tracking-[0.14em] uppercase text-[var(--muted)]">
              Staff sign-in · bookings, reviews, team &amp; gallery sync live from the public site
            </p>
          </div>
        </div>
      </div>

      {/* form side */}
      <div className="flex items-center justify-center px-5 py-16 md:px-12">
        <div className="w-full max-w-md">
          <button onClick={onBack} className="mb-10 flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--muted)] transition-colors hover:text-[var(--amber)]">
            <IconBack width={15} height={15} /> Back to site
          </button>

          <div className="mb-2 flex items-center gap-2">
            <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--amber)]" />
            <span className="kicker">
              {view === "signin" ? "Staff only" : view === "sent" ? "Email dispatched" : view === "done" ? "Key cut" : "Password reset"}
            </span>
          </div>
          <h1 className="font-display text-6xl leading-[0.98]">
            {view === "signin" && (
              <>
                Back <span className="italic text-[var(--amber)]">office.</span>
              </>
            )}
            {view === "forgot" && (
              <>
                Lost your <span className="italic text-[var(--amber)]">key?</span>
              </>
            )}
            {view === "sent" && (
              <>
                Check your <span className="italic text-[var(--amber)]">inbox.</span>
              </>
            )}
            {view === "reset" && (
              <>
                Fresh <span className="italic text-[var(--amber)]">password.</span>
              </>
            )}
            {view === "done" && (
              <>
                All <span className="italic text-[var(--amber)]">set.</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            {view === "signin" &&
              "Sign in to manage every booking request, the testimonials wall, the crew roster and the gallery archive. The public site feeds this desk in real time."}
            {view === "forgot" &&
              "Enter your admin email and we'll dispatch a reset link that brings you straight back to this desk."}
            {view === "sent" && (
              <>
                If an account exists for <span className="font-medium text-[var(--ink)]">{sentTo}</span>, a reset link is on
                its way. Open it on this device — it stays hot for one hour.
              </>
            )}
            {view === "reset" &&
              "The link checked out. Pick something strong — at least 8 characters — and the desk is yours again."}
            {view === "done" && "Your new password is live and you're signed in. Opening the desk…"}
          </p>

          {view === "signin" && (
          <form key={shakeKey} onSubmit={submit} className={`panel mt-9 p-7 shadow-[0_24px_50px_-30px_rgba(18,42,62,0.35)] ${error ? "shake" : ""}`} noValidate>
            <div>
              <label className="label" htmlFor="adm-user">{cloud ? "Admin email" : "Username"}</label>
              <input
                id="adm-user"
                className={`input ${error ? "err" : ""}`}
                placeholder={cloud ? "you@imagine.studio" : "admin"}
                autoComplete="username"
                value={user}
                onChange={(e) => {
                  setUser(e.target.value);
                  setError("");
                }}
              />
            </div>
            <div className="mt-5">
              <label className="label" htmlFor="adm-pass">Password</label>
              <div className="relative">
                <input
                  id="adm-pass"
                  type={show ? "text" : "password"}
                  className={`input pr-12 ${error ? "err" : ""}`}
                  placeholder="•••••••••"
                  autoComplete="current-password"
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-[var(--amber)]"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <IconEyeOff width={17} height={17} /> : <IconEye width={17} height={17} />}
                </button>
              </div>
            </div>

            {cloud && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => switchView("forgot")}
                  className="uline font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] transition-colors hover:text-[var(--amber)]"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p className="mt-4 border-l-2 border-[var(--ember)] pl-3 text-xs text-[var(--ember)]">{error}</p>}

            <button type="submit" className="btn-solid mt-6 w-full justify-center" disabled={busy}>
              <IconKey width={16} height={16} /> {busy ? "Checking the darkroom…" : "Unlock the desk"}
            </button>

            {!cloud && (
              <div className="mt-6 border border-dashed border-[var(--line)] bg-[var(--bg2)] p-4">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--dim)]">Demo access</div>
                <div className="mt-2 font-mono text-xs text-[var(--muted)]">
                  user <span className="text-[var(--amber)]">admin</span> · pass <span className="text-[var(--amber)]">imagine24</span>
                </div>
              </div>
            )}
          </form>
          )}

          {/* ——— forgot: request the reset link ——— */}
          {view === "forgot" && (
            <form
              key={`f${shakeKey}`}
              onSubmit={submitForgot}
              className={`panel pop-in mt-9 p-7 shadow-[0_24px_50px_-30px_rgba(18,42,62,0.35)] ${error ? "shake" : ""}`}
              noValidate
            >
              <label className="label" htmlFor="adm-forgot-email">
                Admin email
              </label>
              <input
                id="adm-forgot-email"
                type="email"
                className={`input ${error ? "err" : ""}`}
                placeholder="you@imagine.studio"
                autoComplete="email"
                value={user}
                onChange={(e) => {
                  setUser(e.target.value);
                  setError("");
                }}
              />
              {error && <p className="mt-4 border-l-2 border-[var(--ember)] pl-3 text-xs text-[var(--ember)]">{error}</p>}
              <button type="submit" className="btn-solid mt-6 w-full justify-center" disabled={busy}>
                <IconMail width={16} height={16} /> {busy ? "Sending…" : "Send reset link"}
              </button>
              <button type="button" onClick={() => switchView("signin")} className="btn-ghost mt-3 w-full justify-center">
                <IconBack width={15} height={15} /> Back to sign in
              </button>
            </form>
          )}

          {/* ——— sent: link is on its way ——— */}
          {view === "sent" && (
            <div className="panel pop-in mt-9 p-7 shadow-[0_24px_50px_-30px_rgba(18,42,62,0.35)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-[var(--amber)]/40 bg-[rgba(13,127,194,0.08)] text-[var(--amber)]">
                  <IconMail width={18} height={18} />
                </span>
                <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--muted)]">Reset link dispatched</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                Tap <span className="font-medium text-[var(--ink)]">Reset password</span> inside the email and you'll land right
                back here to choose a new one. Nothing in the inbox after a minute? Check spam, or send it again below.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={sendReset} className="btn-ghost flex-1 justify-center" disabled={busy}>
                  {busy ? "Sending…" : "Send again"}
                </button>
                <button onClick={() => switchView("signin")} className="btn-solid flex-1 justify-center">
                  Back to sign in
                </button>
              </div>
            </div>
          )}

          {/* ——— reset: set the new password ——— */}
          {view === "reset" && (
            <form
              key={`r${shakeKey}`}
              onSubmit={submitReset}
              className={`panel pop-in mt-9 p-7 shadow-[0_24px_50px_-30px_rgba(18,42,62,0.35)] ${error ? "shake" : ""}`}
              noValidate
            >
              <label className="label" htmlFor="adm-new-pass">
                New password
              </label>
              <div className="relative">
                <input
                  id="adm-new-pass"
                  type={showNew ? "text" : "password"}
                  className={`input pr-12 ${error ? "err" : ""}`}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={newPass}
                  onChange={(e) => {
                    setNewPass(e.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-[var(--amber)]"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <IconEyeOff width={17} height={17} /> : <IconEye width={17} height={17} />}
                </button>
              </div>

              <div className="mt-5">
                <label className="label" htmlFor="adm-confirm-pass">
                  Confirm password
                </label>
                <input
                  id="adm-confirm-pass"
                  type={showNew ? "text" : "password"}
                  className={`input ${error ? "err" : ""}`}
                  placeholder="Once more, with feeling"
                  autoComplete="new-password"
                  value={confirmPass}
                  onChange={(e) => {
                    setConfirmPass(e.target.value);
                    setError("");
                  }}
                />
              </div>

              {error && <p className="mt-4 border-l-2 border-[var(--ember)] pl-3 text-xs text-[var(--ember)]">{error}</p>}

              <button type="submit" className="btn-solid mt-6 w-full justify-center" disabled={busy}>
                <IconKey width={16} height={16} /> {busy ? "Cutting the key…" : "Set new password"}
              </button>
              <button type="button" onClick={() => switchView("signin")} className="btn-ghost mt-3 w-full justify-center">
                <IconBack width={15} height={15} /> Back to sign in
              </button>
            </form>
          )}

          {/* ——— done: signed in, gliding to the desk ——— */}
          {view === "done" && (
            <div className="panel pop-in mt-9 p-8 text-center shadow-[0_24px_50px_-30px_rgba(18,42,62,0.35)]">
              <span className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--sage)]/50 bg-[rgba(47,138,99,0.1)] text-[var(--sage)]">
                <IconCheck width={22} height={22} />
              </span>
              <div className="mt-4 font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--sage)]">Key cut successfully</div>
              <p className="mt-2 text-sm text-[var(--muted)]">Use it next time you sign in.</p>
            </div>
          )}

          {!cloud && (
            <p className="mt-4 border border-[var(--line-soft)] bg-white p-3 text-center font-mono text-[9.5px] leading-relaxed tracking-[0.06em] text-[var(--dim)]">
              Running in local demo mode — add <span className="text-[var(--amber)]">VITE_SUPABASE_URL</span> &amp;{" "}
              <span className="text-[var(--amber)]">VITE_SUPABASE_ANON_KEY</span> to <span className="text-[var(--amber)]">.env.local</span>{" "}
              and run <span className="text-[var(--amber)]">supabase/schema.sql</span> to go live with cloud storage &amp; auth.
            </p>
          )}

          <p className="mt-6 text-center font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
            Unauthorised sitters will be developed in complete darkness
          </p>
        </div>
      </div>
    </div>
  );
}

/* ————————————————— CHANGE PASSWORD ————————————————— */
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { changePassword, toast } = useStore();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (next.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("The new passwords don't match.");
      return;
    }
    setBusy(true);
    const err = await changePassword(cur, next);
    setBusy(false);
    if (!err) {
      toast("Password changed — use it next time you sign in.");
      onClose();
    } else {
      setError(err);
    }
  };

  return (
    <div className="fade-in fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(18,42,62,0.5)] px-5 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Change password">
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="pop-in panel max-h-[92dvh] w-full max-w-md overflow-y-auto p-5 shadow-[0_40px_90px_-40px_rgba(18,42,62,0.6)] sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <div className="kicker">Security</div>
            <h2 className="font-display mt-2 text-3xl text-[var(--ink)]">New key for the desk.</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--ember)] hover:text-[var(--ember)]" aria-label="Close">
            <IconX width={16} height={16} />
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="label" htmlFor="pw-cur">Current password</label>
            <input id="pw-cur" type={show ? "text" : "password"} className="input" autoComplete="current-password" value={cur} onChange={(e) => { setCur(e.target.value); setError(""); }} />
          </div>
          <div>
            <label className="label" htmlFor="pw-next">New password</label>
            <input id="pw-next" type={show ? "text" : "password"} className="input" autoComplete="new-password" placeholder="8+ characters" value={next} onChange={(e) => { setNext(e.target.value); setError(""); }} />
          </div>
          <div>
            <label className="label" htmlFor="pw-confirm">Repeat new password</label>
            <input id="pw-confirm" type={show ? "text" : "password"} className="input" autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(""); }} />
          </div>
        </div>

        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-[var(--amber)]" /> Show passwords
        </label>

        {error && <p className="mt-4 border-l-2 border-[var(--ember)] pl-3 text-xs text-[var(--ember)]">{error}</p>}

        <button type="submit" className="btn-solid mt-6 w-full justify-center" disabled={busy}>
          <IconKey width={16} height={16} /> {busy ? "Turning the key…" : "Change password"}
        </button>
      </form>
    </div>
  );
}

/* ————————————————— DASHBOARD ————————————————— */
/** Mobile overflow menu for secondary desk actions. */
function MoreMenu({ items }: { items: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div className="relative sm:hidden" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-9 items-center justify-center border transition-colors ${
          open ? "border-[var(--amber)] text-[var(--amber)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--amber)]"
        }`}
        aria-label="More actions"
        aria-expanded={open}
      >
        <IconDots width={16} height={16} />
      </button>
      {open && (
        <div className="pop-in absolute right-0 top-full z-[75] mt-2 w-52 divide-y divide-[var(--line-soft)] border border-[var(--line)] bg-white shadow-[0_24px_50px_-20px_rgba(18,42,62,0.45)]">
          {items.map((it) => (
            <button
              key={it.label}
              disabled={it.disabled}
              onClick={() => {
                it.onClick();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-xs font-medium text-[var(--ink)] transition-colors hover:bg-[rgba(13,127,194,0.06)] disabled:cursor-default disabled:opacity-50"
            >
              <span className="text-[var(--muted)]">{it.icon}</span>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard({ onExit }: { onExit: () => void }) {
  const { bookings, setBookingStatus, removeBooking, setBookingDeposit, reviews, team, frames, posts, deliveries, logout, toast, cloud, syncError, content, unseenCount, markSeen, requestNotifyPermission, payments } = useStore();
  const pkgOf = (id: string) => content.packages.find((p) => p.id === id);
  const [tab, setTab] = useState<Tab>("bookings");

  /* viewing the ledger counts as "seen" */
  useEffect(() => {
    if (tab === "bookings") markSeen();
  }, [tab, markSeen]);

  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [query, setQuery] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [notifyPerm, setNotifyPerm] = useState<string>(() =>
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const [mailTesting, setMailTesting] = useState(false);

  /* fire a sample booking through both email templates to verify the wiring */
  const testEmails = async () => {
    if (mailTesting) return;
    setMailTesting(true);
    const res = await sendTestBookingEmails(content.contact.email);
    setMailTesting(false);
    if (!res.enabled) {
      toast("Emails aren't configured — set the EmailJS keys first.", "err");
      return;
    }
    if (res.studio && res.client) toast(`Test sent — check ${content.contact.email} for both the studio alert and the client email.`);
    else if (res.studio) toast("Studio alert sent, but the client email failed — check the template's To Email field.", "err");
    else toast("Test emails failed — check your EmailJS templates and keys.", "err");
  };

  /* ask the browser for notification permission (shared by desktop button + mobile menu) */
  const enableAlerts = () => {
    requestNotifyPermission();
    window.setTimeout(() => {
      if (typeof Notification !== "undefined") {
        setNotifyPerm(Notification.permission);
        if (Notification.permission === "granted") toast("Desktop alerts on — we'll ping you on new bookings.");
        if (Notification.permission === "denied") toast("Alerts blocked by the browser — the desk badge still works.");
      }
    }, 600);
  };

  /* secondary actions that live inline on desktop but collapse into the ⋯ menu on mobile */
  const menuItems = [
    ...(cloud && notifyPerm !== "unsupported"
      ? [
          {
            icon: <IconBell width={14} height={14} />,
            label: notifyPerm === "granted" ? "Alerts are on" : "Enable alerts",
            onClick: enableAlerts,
            disabled: notifyPerm === "granted",
          },
        ]
      : []),
    ...(emailNotificationsEnabled
      ? [
          {
            icon: <IconMail width={14} height={14} />,
            label: mailTesting ? "Sending…" : "Test emails",
            onClick: () => void testEmails(),
            disabled: mailTesting,
          },
        ]
      : []),
    { icon: <IconKey width={14} height={14} />, label: "Change password", onClick: () => setPwOpen(true) },
  ];

  const counts = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings]
  );

  const revenue = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + (pkgOf(b.packageId)?.price ?? 0), 0),
    [bookings]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => filter === "all" || b.status === filter)
      .filter((b) => !q || [b.name, b.email, b.ref, b.session].some((v) => v.toLowerCase().includes(q)));
  }, [bookings, filter, query]);

  const changeStatus = (b: Booking, s: BookingStatus) => {
    setBookingStatus(b.id, s);
    toast(`${b.ref} marked ${STATUS_META[s].label.toLowerCase()}.`);
  };

  const deleteBooking = (b: Booking) => {
    if (confirmDel !== b.id) {
      setConfirmDel(b.id);
      window.setTimeout(() => setConfirmDel((v) => (v === b.id ? null : v)), 3000);
      return;
    }
    removeBooking(b.id);
    setConfirmDel(null);
    toast(`${b.ref} removed from the ledger.`, "err");
  };

  /* ————— deposit tracking ————— */
  const toggleDeposit = (b: Booking) => {
    setBookingDeposit(b.id, !b.depositPaid);
    toast(b.depositPaid ? `${b.ref} deposit marked as due again.` : `${b.ref} deposit marked paid — date locked.`);
  };
  const copyPayLink = (b: Booking) => {
    const link = pkgOf(b.packageId)?.stripeLink;
    if (!link) return;
    const url = stripeUrl(link, b.email, b.ref);
    void navigator.clipboard?.writeText(url).then(
      () => toast("Deposit link copied — client email & ref prefilled."),
      () => toast(url)
    );
  };
  const paymentFor = (b: Booking) => payments.find((p) => p.bookingRef === b.ref) ?? null;

  const exportCsv = () => {
    const head = "Ref,Name,Email,Phone,Session,Package,Date,Time,Guests,Status,Notes,Created";
    const rows = visible.map((b) =>
      [b.ref, b.name, b.email, b.phone, b.session, pkgOf(b.packageId)?.name ?? b.packageId, b.date, b.time, b.guests, b.status, b.notes, b.createdAt]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[head, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imagine-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    window.setTimeout(() => setExportDone(false), 2500);
    toast(`Exported ${visible.length} booking${visible.length === 1 ? "" : "s"} to CSV.`);
  };

  const tabCount: Record<Tab, number> = {
    bookings: bookings.length,
    reviews: reviews.length,
    team: team.length,
    gallery: frames.length,
    photos: 3,
    content: 6,
    journal: posts.length,
    deliveries: deliveries.length,
  };

  return (
    <div className="min-h-screen pb-24">
      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
      <header className="sticky top-0 z-[70] border-b border-[var(--line-soft)] bg-[rgba(255,255,255,0.92)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-4 md:px-8">
          {/* brand — tapping it returns to the site */}
          <button onClick={onExit} className="flex min-w-0 items-center gap-3 text-left" title="Back to the website">
            <IconAperture width={24} height={24} className="shrink-0 text-[var(--amber)]" />
            <span className="min-w-0 leading-none">
              <span className="font-display block truncate text-2xl tracking-[0.08em]">IMAGINE</span>
              <span className="mt-0.5 block font-mono text-[8.5px] tracking-[0.3em] text-[var(--muted)]">STUDIO DESK</span>
            </span>
          </button>

          {/* sync status — full pill on desktop, a tiny dot on mobile */}
          <span
            className={`ml-auto hidden items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase sm:flex ${
              syncError ? "text-[var(--ember)]" : cloud ? "text-[var(--sage)]" : "text-[var(--dim)]"
            }`}
          >
            <span className={`pulse-dot h-1.5 w-1.5 rounded-full ${syncError ? "bg-[var(--ember)]" : cloud ? "bg-[var(--sage)]" : "bg-[var(--dim)]"}`} />
            {syncError ? "Sync issue" : cloud ? "Cloud sync · Supabase" : "Local demo mode"}
          </span>
          <span
            className={`pulse-dot ml-auto h-2 w-2 shrink-0 rounded-full sm:hidden ${
              syncError ? "bg-[var(--ember)]" : cloud ? "bg-[var(--sage)]" : "bg-[var(--dim)]"
            }`}
            title={syncError ? "Sync issue" : cloud ? "Cloud sync · Supabase" : "Local demo mode"}
          />

          <div className="flex shrink-0 items-center gap-2 sm:ml-0">
            {/* View site — same square footprint as sign-out / menu on mobile */}
            <button
              onClick={onExit}
              className="flex h-9 w-9 items-center justify-center border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)] sm:h-auto sm:w-auto sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs sm:font-medium"
              title="View site"
            >
              <IconBack width={15} height={15} />
              <span className="hidden sm:inline">View site</span>
            </button>

            {/* secondary actions — inline on desktop only */}
            {emailNotificationsEnabled && (
              <button
                onClick={() => void testEmails()}
                disabled={mailTesting}
                className="hidden items-center gap-2 border border-[var(--line)] px-3.5 py-2 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)] disabled:cursor-wait disabled:opacity-60 sm:flex"
                title="Send a sample booking through both email templates to verify they work"
              >
                <IconMail width={13} height={13} /> {mailTesting ? "Sending…" : "Test emails"}
              </button>
            )}
            {cloud && notifyPerm !== "unsupported" && (
              notifyPerm === "granted" ? (
                <span className="hidden items-center gap-2 border border-[var(--sage)]/50 bg-[rgba(47,138,99,0.08)] px-3.5 py-2 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--sage)] sm:flex" title="Browser alerts for new bookings are on">
                  <IconBell width={13} height={13} /> Alerts on
                </span>
              ) : (
                <button
                  onClick={enableAlerts}
                  className="hidden items-center gap-2 border border-[var(--line)] px-3.5 py-2 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)] sm:flex"
                  title="Get a browser notification when a new booking lands"
                >
                  <IconBell width={13} height={13} /> Enable alerts
                </button>
              )
            )}
            <button
              onClick={() => setPwOpen(true)}
              className="hidden items-center gap-2 border border-[var(--line)] px-3.5 py-2 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)] sm:flex"
            >
              <IconKey width={13} height={13} /> Password
            </button>

            {/* secondary actions — collapsed into a ⋯ menu on mobile */}
            <MoreMenu items={menuItems} />

            {/* Sign out — icon-only on mobile, labelled on desktop */}
            <button
              onClick={() => {
                logout();
                toast("Signed out — the desk is locked.");
                onExit();
              }}
              className="flex h-9 w-9 items-center justify-center border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--ember)] hover:text-[var(--ember)] sm:h-auto sm:w-auto sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs sm:font-medium"
              title="Sign out"
            >
              <IconLogout width={15} height={15} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {syncError && (
        <div className="border-b border-[var(--ember)]/40 bg-[rgba(208,91,69,0.08)] px-5 py-3 md:px-8">
          <p className="font-mono text-[11px] leading-relaxed tracking-[0.04em] text-[var(--ember)]">
            ⚠ {syncError}
          </p>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 pt-10 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="kicker">
              <ScrambleText text="The studio desk" />
            </span>
            <h1 className="font-display mt-2 text-5xl leading-[0.98] md:text-6xl">
              Good light, <span className="italic text-[var(--amber)]">boss.</span>
            </h1>
          </div>
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
            {counts.pending} awaiting reply · {usd(revenue)} booked revenue
          </p>
        </div>

        {/* tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-[var(--line-soft)] pb-px">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-300 ${
                  active ? "text-[var(--amber)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {t.label}
                <span className={`border px-1.5 py-0.5 text-[9px] ${active ? "border-[var(--amber)]/60 bg-[rgba(13,127,194,0.08)]" : "border-[var(--line)]"}`}>
                  {tabCount[t.id]}
                </span>
                {t.id === "bookings" && unseenCount > 0 && !active && (
                  <span className="pulse-dot absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ember)] px-1 font-mono text-[9px] font-bold text-white">
                    {unseenCount > 9 ? "9+" : unseenCount}
                  </span>
                )}
                {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--amber)]" />}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {tab === "bookings" && (
            <div className="fade-in">
              {/* stats */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Total requests", value: String(counts.all), accent: "text-[var(--ink)]" },
                  { label: "Pending reply", value: String(counts.pending), accent: "text-[var(--amber)]" },
                  { label: "Confirmed", value: String(counts.confirmed), accent: "text-[#0b6cab]" },
                  { label: "Booked revenue", value: usd(revenue), accent: "text-[var(--sage)]" },
                ].map((s, i) => (
                  <div key={s.label} className="panel p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--line)]" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="font-mono text-[9.5px] tracking-[0.24em] uppercase text-[var(--dim)]">{s.label}</div>
                    <div className={`font-display mt-2 text-4xl ${s.accent}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* insights */}
              <Insights />

              {/* deployment health smoke test */}
              <SystemCheck />

              {/* controls */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((s) => {
                  const active = filter === s;
                  const n = s === "all" ? counts.all : counts[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={`flex items-center gap-2 border px-3.5 py-2 font-mono text-[10.5px] tracking-[0.16em] uppercase transition-all duration-300 ${
                        active ? "border-[var(--amber)] bg-[var(--amber)] text-white" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {s === "all" ? "All" : STATUS_META[s].label} <span className={active ? "opacity-70" : "text-[var(--dim)]"}>{n}</span>
                    </button>
                  );
                })}
                <div className="relative ml-auto w-full sm:w-72">
                  <IconSearch width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dim)]" />
                  <input className="input !py-2 pl-9" placeholder="Search name, ref, email…" value={query} onChange={(e) => setQuery(e.target.value)} />
                  {query && (
                    <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--dim)] hover:text-[var(--ember)]" aria-label="Clear search">
                      <IconX width={14} height={14} />
                    </button>
                  )}
                </div>
                <button onClick={exportCsv} className="btn-ghost !px-4 !py-2 text-sm">
                  {exportDone ? <IconCheck width={15} height={15} className="text-[var(--sage)]" /> : <IconDownload width={15} height={15} />}
                  {exportDone ? "Saved" : "Export CSV"}
                </button>
              </div>

              {/* list */}
              {visible.length === 0 ? (
                <div className="panel mt-6 flex flex-col items-center gap-3 p-14 text-center">
                  <IconCalendar width={34} height={34} className="text-[var(--dim)]" />
                  <p className="font-display text-2xl text-[var(--ink)]">No bookings in this view.</p>
                  <p className="max-w-sm text-sm text-[var(--muted)]">
                    {query || filter !== "all" ? "Try clearing the search or switching tabs — the desk is quieter than it looks." : "New requests from the public booking form will land here the moment they're sent."}
                  </p>
                  {(query || filter !== "all") && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setFilter("all");
                      }}
                      className="btn-ghost mt-2 !py-2 text-sm"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="panel mt-6 overflow-hidden">
                  {/* desktop table */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[960px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--line-soft)] font-mono text-[9.5px] tracking-[0.22em] uppercase text-[var(--dim)]">
                          <th className="px-5 py-3.5 font-medium">Ref / Client</th>
                          <th className="px-4 py-3.5 font-medium">Session</th>
                          <th className="px-4 py-3.5 font-medium">Date</th>
                          <th className="px-4 py-3.5 font-medium">Package</th>
                          <th className="px-4 py-3.5 font-medium">Deposit</th>
                          <th className="px-4 py-3.5 font-medium">Status</th>
                          <th className="px-4 py-3.5 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((b) => (
                          <tr key={b.id} className="group border-b border-[var(--line-soft)] transition-colors last:border-0 hover:bg-[rgba(13,127,194,0.05)]">
                            <td className="px-5 py-4">
                              <div className="font-medium text-[var(--ink)]">{b.name}</div>
                              <div className="mt-0.5 flex items-center gap-3 font-mono text-[10px] text-[var(--dim)]">
                                <span className="text-[var(--amber)]">{b.ref}</span>
                                <span className="flex items-center gap-1"><IconMail width={11} height={11} /> {b.email}</span>
                                <span className="flex items-center gap-1"><IconPhone width={11} height={11} /> {b.phone}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-[var(--muted)]">{b.session}</td>
                            <td className="px-4 py-4">
                              <div className="text-[var(--ink)]">{fmtDate(b.date)}</div>
                              <div className="font-mono text-[10px] text-[var(--dim)]">{b.time} · {b.guests} guest{b.guests === 1 ? "" : "s"}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-[var(--ink)]">{pkgOf(b.packageId)?.name ?? "—"}</div>
                              <div className="font-mono text-[10px] text-[var(--dim)]">{usd(pkgOf(b.packageId)?.price ?? 0)}</div>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => toggleDeposit(b)}
                                title="Toggle deposit paid"
                                className={`chip transition-all hover:-translate-y-0.5 ${
                                  b.depositPaid ? "!border-[var(--sage)]/60 !text-[var(--sage)]" : "hover:!border-[var(--amber)] hover:!text-[var(--amber)]"
                                }`}
                              >
                                {b.depositPaid ? "Paid ✓" : "Due"}
                              </button>
                              {paymentFor(b) && (
                                <span className="mt-1.5 block font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--sage)]">
                                  Stripe · ${(paymentFor(b)!.amountCents / 100).toFixed(0)}
                                </span>
                              )}
                              {pkgOf(b.packageId)?.stripeLink && (
                                <button onClick={() => copyPayLink(b)} className="mt-1.5 block font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--dim)] transition-colors hover:text-[var(--amber)]">
                                  Copy pay link
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <select
                                value={b.status}
                                onChange={(e) => changeStatus(b, e.target.value as BookingStatus)}
                                className={`cursor-pointer border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${STATUS_META[b.status].pill}`}
                                style={{ background: "var(--panel)" }}
                              >
                                {(Object.keys(STATUS_META) as BookingStatus[]).map((s) => (
                                  <option key={s} value={s}>{STATUS_META[s].label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => deleteBooking(b)}
                                className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.14em] uppercase transition-all ${
                                  confirmDel === b.id
                                    ? "border-[var(--ember)] bg-[var(--ember)] text-white"
                                    : "border-transparent text-[var(--dim)] opacity-0 hover:border-[var(--ember)] hover:text-[var(--ember)] group-hover:opacity-100"
                                }`}
                              >
                                <IconTrash width={13} height={13} /> {confirmDel === b.id ? "Confirm?" : "Delete"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* mobile cards */}
                  <div className="divide-y divide-[var(--line-soft)] lg:hidden">
                    {visible.map((b) => (
                      <div key={b.id} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-display text-xl text-[var(--ink)]">{b.name}</div>
                            <div className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-[var(--amber)]">{b.ref}</div>
                          </div>
                          <span className={`chip !border-0 ${STATUS_META[b.status].pill}`}>{STATUS_META[b.status].label}</span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-[var(--muted)]">
                          <span>{b.session}</span>
                          <span className="text-right">{pkgOf(b.packageId)?.name}</span>
                          <span className="flex items-center gap-1.5"><IconCalendar width={13} height={13} className="text-[var(--dim)]" /> {fmtDate(b.date)} · {b.time}</span>
                          <span className="flex items-center justify-end gap-1.5"><IconUsers width={13} height={13} className="text-[var(--dim)]" /> {b.guests}</span>
                        </div>
                        {b.notes && <p className="mt-3 border-l-2 border-[var(--line)] pl-3 text-xs italic text-[var(--dim)]">{b.notes}</p>}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => toggleDeposit(b)}
                            className={`chip transition-colors ${b.depositPaid ? "!border-[var(--sage)]/60 !text-[var(--sage)]" : "hover:!border-[var(--amber)] hover:!text-[var(--amber)]"}`}
                          >
                            Deposit {b.depositPaid ? "paid ✓" : "due"}
                          </button>
                          {paymentFor(b) && (
                            <span className="chip !border-[var(--sage)]/50 !text-[var(--sage)]">
                              Stripe · ${(paymentFor(b)!.amountCents / 100).toFixed(0)}
                            </span>
                          )}
                          {pkgOf(b.packageId)?.stripeLink && (
                            <button onClick={() => copyPayLink(b)} className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--dim)] transition-colors hover:text-[var(--amber)]">
                              Copy pay link
                            </button>
                          )}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <select
                            value={b.status}
                            onChange={(e) => changeStatus(b, e.target.value as BookingStatus)}
                            className={`input !w-auto !py-1.5 font-mono !text-[10px] uppercase ${STATUS_META[b.status].pill}`}
                          >
                            {(Object.keys(STATUS_META) as BookingStatus[]).map((s) => (
                              <option key={s} value={s}>{STATUS_META[s].label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteBooking(b)}
                            className={`ml-auto flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[9.5px] tracking-[0.14em] uppercase transition-all ${
                              confirmDel === b.id ? "border-[var(--ember)] bg-[var(--ember)] text-white" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--ember)] hover:text-[var(--ember)]"
                            }`}
                          >
                            <IconTrash width={13} height={13} /> {confirmDel === b.id ? "Confirm?" : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "reviews" && <ReviewsPanel />}
          {tab === "team" && <TeamPanel />}
          {tab === "gallery" && <GalleryPanel />}
          {tab === "photos" && <PhotosPanel />}
          {tab === "content" && <ContentPanel />}
          {tab === "journal" && <JournalPanel />}
          {tab === "deliveries" && <DeliveriesPanel />}
        </div>
      </main>

      {/* content pulse strip */}
      <footer className="mx-auto mt-14 max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-[var(--line-soft)] pt-5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
          <span className="flex items-center gap-2"><IconPrint width={13} height={13} className="text-[var(--amber)]" /> {reviews.filter((r) => r.published).length} reviews live</span>
          <span className="flex items-center gap-2"><IconUsers width={13} height={13} className="text-[var(--amber)]" /> {team.filter((m) => m.published).length} crew on site</span>
          <span className="flex items-center gap-2"><IconEye width={13} height={13} className="text-[var(--amber)]" /> {frames.filter((f) => f.published).length} frames in archive</span>
          <span className="ml-auto">Changes publish to the public site instantly</span>
        </div>
      </footer>
    </div>
  );
}
