import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { IMG, getPackage } from "../data";
import type { Booking, BookingStatus } from "../store";
import { useStore } from "../store";
import {
  IconAperture,
  IconBack,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconKey,
  IconLogout,
  IconSearch,
  IconTrash,
} from "./Icons";
import { ScrambleText } from "./ui";

/* ————————————————— helpers ————————————————— */
const STATUS_META: Record<BookingStatus, { label: string; pill: string; dot: string }> = {
  pending: {
    label: "Pending",
    pill: "border-[var(--amber)]/50 bg-[rgba(224,164,88,0.1)] text-[var(--amber)]",
    dot: "bg-[var(--amber)]",
  },
  confirmed: {
    label: "Confirmed",
    pill: "border-[var(--sage)]/50 bg-[rgba(169,177,139,0.1)] text-[var(--sage)]",
    dot: "bg-[var(--sage)]",
  },
  completed: {
    label: "Completed",
    pill: "border-[var(--line)] bg-[rgba(241,232,215,0.05)] text-[var(--muted)]",
    dot: "bg-[var(--muted)]",
  },
  cancelled: {
    label: "Cancelled",
    pill: "border-[var(--ember)]/50 bg-[rgba(207,85,51,0.1)] text-[var(--ember)]",
    dot: "bg-[var(--ember)]",
  },
};

const STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* ————————————————— LOGIN PAGE ————————————————— */
export function LoginPage({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const { login, toast } = useStore();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (login(user, pass)) {
      toast("Welcome back — the ledger is live.");
      onSuccess();
    } else {
      setError("Credentials not recognised. Try the demo pair below.");
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src={IMG.fashion} alt="Editorial frame from the OBSCURA archive" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(23,19,16,0.94)_8%,rgba(23,19,16,0.35)_55%,rgba(23,19,16,0.6))]" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <IconAperture width={26} height={26} className="text-[var(--amber)]" />
            <div className="leading-none">
              <div className="font-display text-lg tracking-[0.12em] text-[var(--ink)]">OBSCURA</div>
              <div className="font-mono mt-1 text-[9px] tracking-[0.32em] text-[var(--muted)]">BACK OFFICE</div>
            </div>
          </div>
          <div>
            <p className="font-display max-w-md text-5xl leading-[0.95] uppercase text-[var(--ink)]">
              The desk sees <span className="text-[var(--amber)]">everything.</span>
            </p>
            <p className="mt-5 max-w-sm font-mono text-[11px] leading-relaxed tracking-[0.14em] text-[var(--muted)] uppercase">
              Staff sign-in · bookings sync live from the public site · ledger, statuses &amp; export
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
          <h1 className="font-display text-5xl uppercase leading-[0.95]">
            Back <span className="text-[var(--amber)]">office.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            Sign in to see every booking request, change statuses, and export the ledger. The public booking form feeds
            this desk in real time.
          </p>

          <form key={shakeKey} onSubmit={submit} className={`panel mt-9 p-7 ${error ? "shake" : ""}`} noValidate>
            <div>
              <label className="label" htmlFor="adm-user">Username</label>
              <input
                id="adm-user"
                className={`input ${error ? "err" : ""}`}
                placeholder="admin"
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

            <button type="submit" className="btn-solid mt-6 w-full justify-center">
              <IconKey width={16} height={16} /> Unlock the desk
            </button>

            <div className="mt-6 border border-dashed border-[var(--line)] bg-[var(--bg2)] p-4">
              <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--dim)]">Demo access</div>
              <div className="mt-2 font-mono text-xs text-[var(--muted)]">
                user <span className="text-[var(--amber)]">admin</span> · pass <span className="text-[var(--amber)]">obscura24</span>
              </div>
            </div>
          </form>

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
  const { bookings, setStatus, removeBooking, logout, toast } = useStore();
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (deleteTimer.current) window.clearTimeout(deleteTimer.current);
    };
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    STATUSES.forEach((s) => (c[s] = bookings.filter((b) => b.status === s).length));
    return c;
  }, [bookings]);

  const revenue = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + (getPackage(b.packageId)?.price ?? 0), 0),
    [bookings]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...bookings]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((b) => (filter === "all" ? true : b.status === filter))
      .filter((b) =>
        q ? [b.name, b.email, b.ref, b.session, b.packageId].join(" ").toLowerCase().includes(q) : true
      );
  }, [bookings, filter, search]);

  const askDelete = (b: Booking) => {
    if (deletingId === b.id) {
      removeBooking(b.id);
      setDeletingId(null);
      toast(`Booking ${b.ref} struck from the ledger.`, "warn");
      return;
    }
    setDeletingId(b.id);
    if (deleteTimer.current) window.clearTimeout(deleteTimer.current);
    deleteTimer.current = window.setTimeout(() => setDeletingId(null), 2600);
  };

  const exportCsv = () => {
    const head = ["Ref", "Name", "Email", "Phone", "Session", "Package", "Price", "Date", "Time", "Guests", "Status", "Notes", "Created"];
    const rows = filtered.map((b) =>
      [
        b.ref,
        b.name,
        b.email,
        b.phone,
        b.session,
        getPackage(b.packageId)?.name ?? b.packageId,
        getPackage(b.packageId)?.price ?? "",
        b.date,
        b.time,
        b.guests,
        b.status,
        b.notes.replace(/"/g, "'"),
        new Date(b.createdAt).toLocaleString(),
      ]
        .map((v) => `"${v}"`)
        .join(",")
    );
    const blob = new Blob([[head.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `obscura-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Ledger exported — ${filtered.length} booking${filtered.length === 1 ? "" : "s"}.`);
  };

  const onLogout = () => {
    logout();
    toast("Signed out of the back office.", "warn");
  };

  return (
    <div className="min-h-screen">
      {/* header */}
      <header className="sticky top-0 z-[70] border-b border-[var(--line-soft)] bg-[rgba(23,19,16,0.9)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <IconAperture width={24} height={24} className="text-[var(--amber)]" />
            <div className="leading-none">
              <div className="font-display text-lg tracking-[0.12em]">OBSCURA</div>
              <div className="font-mono mt-1 text-[9px] tracking-[0.32em] text-[var(--muted)]">BACK OFFICE</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="mr-2 hidden items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--sage)] sm:flex">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--sage)]" /> Live sync
            </span>
            <button onClick={onExit} className="btn-ghost !px-4 !py-2 text-sm">
              <IconBack width={15} height={15} /> View site
            </button>
            <button onClick={onLogout} className="btn-ghost !px-4 !py-2 text-sm hover:!border-[var(--ember)] hover:!text-[var(--ember)]">
              <IconLogout width={15} height={15} /> Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="kicker">
              <ScrambleText text="The booking ledger" />
            </span>
            <h1 className="font-display mt-3 text-4xl uppercase leading-none md:text-5xl">
              Every frame <span className="text-[var(--amber)]">accounted for.</span>
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            Requests from the public booking form land here instantly. Confirm, complete, cancel — or strike a row from
            the ledger entirely.
          </p>
        </div>

        {/* stats strip */}
        <div className="mt-10 grid grid-cols-2 border border-[var(--line-soft)] bg-[var(--panel)] lg:grid-cols-4">
          {[
            { label: "Total bookings", value: String(counts.all), accent: "text-[var(--ink)]" },
            { label: "Pending review", value: String(counts.pending), accent: "text-[var(--amber)]" },
            { label: "Confirmed", value: String(counts.confirmed), accent: "text-[var(--sage)]" },
            { label: "Booked revenue", value: `$${revenue.toLocaleString("en-US")}`, accent: "text-[var(--amber)]" },
          ].map((s, i) => (
            <div key={s.label} className={`p-6 ${i % 2 === 0 ? "border-r border-[var(--line-soft)]" : ""} ${i < 2 ? "border-b border-[var(--line-soft)] lg:border-b-0" : ""} ${i === 1 ? "lg:border-r" : ""}`}>
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)]">{s.label}</div>
              <div className={`font-display mt-2 text-4xl ${s.accent}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* controls */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <IconSearch width={15} height={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dim)]" />
            <input
              className="input !pl-10"
              placeholder="Search name, email, ref…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", ...STATUSES] as const).map((s) => {
              const active = filter === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`border px-3.5 py-2 font-mono text-[10px] tracking-[0.18em] uppercase transition-all ${
                    active
                      ? "border-[var(--amber)] bg-[var(--amber)] text-[#1c140a]"
                      : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)]"
                  }`}
                >
                  {s === "all" ? "All" : STATUS_META[s].label} · {counts[s]}
                </button>
              );
            })}
          </div>
          <button onClick={exportCsv} className="btn-ghost ml-auto !px-4 !py-2.5 text-sm">
            <IconDownload width={15} height={15} /> Export CSV
          </button>
        </div>

        {/* ledger table */}
        <div className="panel mt-6 overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
              <IconAperture width={36} height={36} className="text-[var(--dim)]" />
              <p className="font-display text-xl uppercase text-[var(--muted)]">Nothing on this roll.</p>
              <p className="max-w-xs text-sm text-[var(--dim)]">No bookings match the current filter. Clear the search or pick another status.</p>
              <button
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                }}
                className="btn-ghost mt-2 !py-2 text-sm"
              >
                Show everything
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line-soft)] font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)]">
                  <th className="px-5 py-4 font-normal">Ref</th>
                  <th className="px-5 py-4 font-normal">Client</th>
                  <th className="px-5 py-4 font-normal">Session</th>
                  <th className="px-5 py-4 font-normal">Package</th>
                  <th className="px-5 py-4 font-normal">Date · Call</th>
                  <th className="px-5 py-4 font-normal">Status</th>
                  <th className="px-5 py-4 text-right font-normal">—</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const pkg = getPackage(b.packageId);
                  return (
                    <tr key={b.id} className="group border-b border-[var(--line-soft)] transition-colors last:border-0 hover:bg-[rgba(224,164,88,0.035)]">
                      <td className="px-5 py-4 font-mono text-xs tracking-[0.14em] text-[var(--amber)]">{b.ref}</td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-[var(--ink)]">{b.name}</div>
                        <div className="mt-0.5 text-xs text-[var(--dim)]">{b.email} · {b.phone}</div>
                        {b.notes && <div className="mt-1 max-w-[260px] truncate text-xs italic text-[var(--muted)]" title={b.notes}>“{b.notes}”</div>}
                      </td>
                      <td className="px-5 py-4 text-[var(--muted)]">{b.session}</td>
                      <td className="px-5 py-4">
                        <span className="text-[var(--ink)]">{pkg?.name ?? b.packageId}</span>
                        <span className="ml-2 font-mono text-xs text-[var(--dim)]">${pkg?.price ?? "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[var(--ink)]">{fmtDate(b.date)}</div>
                        <div className="mt-0.5 font-mono text-xs text-[var(--dim)]">{b.time} · {b.guests} guest{b.guests > 1 ? "s" : ""}</div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={b.status}
                          onChange={(e) => {
                            const s = e.target.value as BookingStatus;
                            setStatus(b.id, s);
                            toast(`${b.ref} → ${STATUS_META[s].label}.`);
                          }}
                          className={`cursor-pointer border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase outline-none transition-colors focus:border-[var(--amber)] ${STATUS_META[b.status].pill} bg-[var(--panel)]`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-[var(--panel)] text-[var(--ink)]">
                              {STATUS_META[s].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {deletingId === b.id ? (
                          <button
                            onClick={() => askDelete(b)}
                            className="border border-[var(--ember)] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ember)] transition-colors hover:bg-[var(--ember)] hover:text-[var(--ink)]"
                          >
                            Sure?
                          </button>
                        ) : (
                          <button
                            onClick={() => askDelete(b)}
                            aria-label={`Delete booking ${b.ref}`}
                            className="inline-flex h-8 w-8 items-center justify-center border border-transparent text-[var(--dim)] transition-all hover:border-[var(--ember)] hover:text-[var(--ember)]"
                          >
                            <IconTrash width={15} height={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-6 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
          Showing {filtered.length} of {bookings.length} bookings · revenue counts confirmed + completed only
        </p>
      </main>
    </div>
  );
}
