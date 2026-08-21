import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { IMG, getPackage } from "../data";
import { useStore } from "../store";
import type { Booking, BookingStatus } from "../store";
import {
  IconAperture,
  IconBack,
  IconCalendar,
  IconCheck,
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
import { GalleryPanel, ReviewsPanel, TeamPanel } from "./AdminPanels";

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
] as const;
type Tab = (typeof TABS)[number]["id"];

/* ————————————————— LOGIN ————————————————— */
export function LoginPage({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const { login, toast, cloud } = useStore();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

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

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <SafeImg src={IMG.fashion} alt="Editorial frame from the Imagine archive" className="absolute inset-0 h-full w-full object-cover" />
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
            <span className="kicker">Staff only</span>
          </div>
          <h1 className="font-display text-6xl leading-[0.98]">
            Back <span className="italic text-[var(--amber)]">office.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            Sign in to manage every booking request, the testimonials wall, the crew roster and the gallery archive.
            The public site feeds this desk in real time.
          </p>

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

            {error && <p className="mt-4 border-l-2 border-[var(--ember)] pl-3 text-xs text-[var(--ember)]">{error}</p>}

            <button type="submit" className="btn-solid mt-6 w-full justify-center" disabled={busy}>
              <IconKey width={16} height={16} /> {busy ? "Checking the darkroom…" : "Unlock the desk"}
            </button>

            {cloud ? (
              <div className="mt-6 border border-dashed border-[var(--sage)]/50 bg-[rgba(47,138,99,0.06)] p-4">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--sage)]">Cloud mode · Supabase</div>
                <div className="mt-2 font-mono text-[11px] leading-relaxed text-[var(--muted)]">
                  Signed-in staff get full control; visitors can only send bookings and read published content (row-level security).
                </div>
              </div>
            ) : (
              <div className="mt-6 border border-dashed border-[var(--line)] bg-[var(--bg2)] p-4">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--dim)]">Demo access</div>
                <div className="mt-2 font-mono text-xs text-[var(--muted)]">
                  user <span className="text-[var(--amber)]">admin</span> · pass <span className="text-[var(--amber)]">imagine24</span>
                </div>
              </div>
            )}
          </form>

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

/* ————————————————— DASHBOARD ————————————————— */
export function Dashboard({ onExit }: { onExit: () => void }) {
  const { bookings, setBookingStatus, removeBooking, reviews, team, frames, logout, toast, cloud, syncError } = useStore();
  const [tab, setTab] = useState<Tab>("bookings");
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [query, setQuery] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);

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
        .reduce((sum, b) => sum + (getPackage(b.packageId)?.price ?? 0), 0),
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

  const exportCsv = () => {
    const head = "Ref,Name,Email,Phone,Session,Package,Date,Time,Guests,Status,Notes,Created";
    const rows = visible.map((b) =>
      [b.ref, b.name, b.email, b.phone, b.session, getPackage(b.packageId)?.name ?? b.packageId, b.date, b.time, b.guests, b.status, b.notes, b.createdAt]
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
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-[70] border-b border-[var(--line-soft)] bg-[rgba(255,255,255,0.92)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-3.5 md:px-8">
          <div className="flex items-center gap-3">
            <IconAperture width={24} height={24} className="text-[var(--amber)]" />
            <div className="leading-none">
              <div className="font-display text-2xl tracking-[0.08em]">IMAGINE</div>
              <div className="font-mono mt-0.5 text-[8.5px] tracking-[0.3em] text-[var(--muted)]">STUDIO DESK</div>
            </div>
          </div>
          <span
            className={`ml-auto hidden items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase sm:flex ${
              syncError ? "text-[var(--ember)]" : cloud ? "text-[var(--sage)]" : "text-[var(--dim)]"
            }`}
          >
            <span className={`pulse-dot h-1.5 w-1.5 rounded-full ${syncError ? "bg-[var(--ember)]" : cloud ? "bg-[var(--sage)]" : "bg-[var(--dim)]"}`} />
            {syncError ? "Sync issue" : cloud ? "Cloud sync · Supabase" : "Local demo mode"}
          </span>
          <button onClick={onExit} className="btn-ghost !px-4 !py-2 text-sm">
            <IconBack width={15} height={15} /> View site
          </button>
          <button
            onClick={() => {
              logout();
              toast("Signed out — the desk is locked.");
              onExit();
            }}
            className="flex items-center gap-2 border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:border-[var(--ember)] hover:text-[var(--ember)]"
          >
            <IconLogout width={15} height={15} /> Sign out
          </button>
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
                              <div className="text-[var(--ink)]">{getPackage(b.packageId)?.name ?? "—"}</div>
                              <div className="font-mono text-[10px] text-[var(--dim)]">{usd(getPackage(b.packageId)?.price ?? 0)}</div>
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
                          <span className="text-right">{getPackage(b.packageId)?.name}</span>
                          <span className="flex items-center gap-1.5"><IconCalendar width={13} height={13} className="text-[var(--dim)]" /> {fmtDate(b.date)} · {b.time}</span>
                          <span className="flex items-center justify-end gap-1.5"><IconUsers width={13} height={13} className="text-[var(--dim)]" /> {b.guests}</span>
                        </div>
                        {b.notes && <p className="mt-3 border-l-2 border-[var(--line)] pl-3 text-xs italic text-[var(--dim)]">{b.notes}</p>}
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
