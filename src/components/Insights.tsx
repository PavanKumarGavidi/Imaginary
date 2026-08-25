import { useMemo } from "react";
import { useStore } from "../store";
import { useInView } from "../hooks";

const STATUS_META: { id: string; label: string; color: string }[] = [
  { id: "pending", label: "Pending", color: "#0d7fc2" },
  { id: "confirmed", label: "Confirmed", color: "#0b6cab" },
  { id: "completed", label: "Completed", color: "#2f8a63" },
  { id: "cancelled", label: "Cancelled", color: "#d05b45" },
];

/** Hand-rolled SVG/CSS analytics for the Bookings tab — no chart library needed. */
export default function Insights() {
  const { bookings, content } = useStore();
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  const months = useMemo(() => {
    const out: { key: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      out.push({
        key,
        label: d.toLocaleDateString("en-US", { month: "short" }),
        count: bookings.filter((b) => b.date.startsWith(key)).length,
      });
    }
    return out;
  }, [bookings]);
  const maxMonth = Math.max(1, ...months.map((m) => m.count));

  const revenue = useMemo(() => {
    return content.packages
      .map((p) => ({
        name: p.name,
        total: bookings.filter((b) => b.packageId === p.id && (b.status === "confirmed" || b.status === "completed")).length * p.price,
        count: bookings.filter((b) => b.packageId === p.id && (b.status === "confirmed" || b.status === "completed")).length,
      }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [bookings, content.packages]);
  const maxRevenue = Math.max(1, ...revenue.map((r) => r.total));

  const donut = useMemo(() => {
    const total = Math.max(1, bookings.length);
    let acc = 0;
    const C = 2 * Math.PI * 40;
    return STATUS_META.map((s) => {
      const count = bookings.filter((b) => b.status === s.id).length;
      const frac = count / total;
      const seg = { ...s, count, frac, dash: `${frac * C} ${C}`, offset: -acc * C };
      acc += frac;
      return seg;
    });
  }, [bookings]);

  const quick = useMemo(() => {
    const total = bookings.length;
    const won = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length;
    const leads = bookings
      .map((b) => (new Date(b.date).getTime() - new Date(b.createdAt).getTime()) / 86400000)
      .filter((d) => Number.isFinite(d) && d >= 0);
    const avgLead = leads.length ? Math.round(leads.reduce((a, b) => a + b, 0) / leads.length) : 0;
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const tally = [0, 0, 0, 0, 0, 0, 0];
    bookings.forEach((b) => {
      const d = new Date(b.date);
      if (!Number.isNaN(d.getTime())) tally[d.getDay()]++;
    });
    const busiest = weekdays[tally.indexOf(Math.max(...tally))];
    const deposits = bookings.filter((b) => b.depositPaid).length;
    return { total, conversion: total ? Math.round((won / total) * 100) : 0, avgLead, busiest, deposits };
  }, [bookings]);

  return (
    <div ref={ref} className="panel mt-6 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl text-[var(--ink)]">Insights</h3>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">Computed live from the ledger</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { k: "Conversion", v: `${quick.conversion}%` },
            { k: "Avg lead time", v: `${quick.avgLead}d` },
            { k: "Busiest day", v: quick.busiest },
            { k: "Deposits paid", v: String(quick.deposits) },
          ].map((s) => (
            <div key={s.k} className="border border-[var(--line-soft)] bg-[var(--bg2)] px-3.5 py-2 text-center">
              <div className="font-display text-xl leading-none text-[var(--amber)]">{s.v}</div>
              <div className="mt-1 font-mono text-[8.5px] tracking-[0.2em] uppercase text-[var(--dim)]">{s.k}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_auto]">
        {/* monthly volume */}
        <div>
          <div className="mb-3 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)]">Sessions per month</div>
          <div className="flex h-36 items-end gap-2">
            {months.map((m, i) => (
              <div key={m.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className={`font-mono text-[9px] text-[var(--dim)] transition-opacity ${m.count ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{m.count}</span>
                <div
                  className="w-full bg-[linear-gradient(to_top,#0b6cab,#7ab8e6)] transition-all duration-700 ease-out group-hover:opacity-80"
                  style={{ height: inView ? `${Math.max(3, (m.count / maxMonth) * 100)}%` : "3%", transitionDelay: `${i * 60}ms`, opacity: m.count ? 1 : 0.25 }}
                />
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--dim)]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* revenue by package */}
        <div>
          <div className="mb-3 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)]">Revenue by package</div>
          {revenue.length === 0 ? (
            <p className="pt-6 text-sm text-[var(--dim)]">Confirm a booking to see revenue appear here.</p>
          ) : (
            <div className="space-y-3.5 pt-1">
              {revenue.map((r, i) => (
                <div key={r.name}>
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-[var(--ink)]">{r.name}</span>
                    <span className="font-mono text-[10px] text-[var(--muted)]">
                      ${r.total.toLocaleString("en-US")} · {r.count}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden bg-[var(--bg2)]">
                    <div
                      className="h-full bg-[var(--amber)] transition-all duration-700 ease-out"
                      style={{ width: inView ? `${(r.total / maxRevenue) * 100}%` : "0%", transitionDelay: `${i * 90}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* status donut */}
        <div className="flex flex-col items-center">
          <div className="mb-3 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)]">Pipeline</div>
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg2)" strokeWidth="12" />
              {donut.map(
                (s) =>
                  s.count > 0 && (
                    <circle
                      key={s.id}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="12"
                      strokeDasharray={s.dash}
                      strokeDashoffset={s.offset}
                      className="transition-all duration-700"
                    />
                  )
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl leading-none text-[var(--ink)]">{quick.total}</span>
              <span className="mt-0.5 font-mono text-[8px] tracking-[0.24em] uppercase text-[var(--dim)]">bookings</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
            {donut.map((s) => (
              <span key={s.id} className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--muted)]">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} /> {s.label} {s.count}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
