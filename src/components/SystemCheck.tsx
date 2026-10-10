import { useRef, useState } from "react";
import { isSupabaseConfigured as cloud, supabase } from "../lib/supabase";
import { clientEmailsEnabled, emailNotificationsEnabled } from "../lib/notify";
import { stripeOnSiteEnabled, stripePublishableKey } from "../lib/stripe";
import { IconAperture, IconCheck, IconX } from "./Icons";

type Status = "idle" | "running" | "pass" | "fail" | "warn" | "skip";

interface CheckDef {
  id: string;
  label: string;
  group: "database" | "functions" | "services";
  hint: string;
  run: () => Promise<{ status: Status; note?: string }>;
}

const TABLES: [string, string][] = [
  ["bookings", "the booking ledger"],
  ["reviews", "reviews & testimonials"],
  ["team_members", "the team roster"],
  ["gallery_frames", "the gallery archive"],
  ["site_content", "editable website content"],
  ["site_photos", "site-wide photos"],
  ["deliveries", "client delivery galleries"],
  ["posts", "journal posts"],
  ["payments", "the payments ledger"],
];

const CHECKS: CheckDef[] = [
  ...TABLES.map(([table, what]) => ({
    id: `tbl-${table}`,
    label: `Table · ${table}`,
    group: "database" as const,
    hint: `Run the schema SQL (supabase/schema.sql) in the SQL Editor — this table holds ${what}.`,
    run: async () => {
      const { error } = await supabase!.from(table).select("*").limit(1);
      if (error && /does not exist|schema cache/i.test(error.message)) return { status: "fail" as Status, note: error.message };
      if (error) return { status: "warn" as Status, note: error.message };
      return { status: "pass" as Status };
    },
  })),
  {
    id: "fn-slots",
    label: "Function · taken_slots()",
    group: "functions",
    hint: "Run the Tier 1 SQL in the SQL Editor — it creates the slot-availability function.",
    run: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase!.rpc("taken_slots", { for_date: today });
      if (error) return { status: "fail", note: error.message };
      return { status: "pass", note: `${(data as string[]).length} slot(s) taken today` };
    },
  },
  {
    id: "fn-pay",
    label: "Edge Function · create-payment-intent",
    group: "functions",
    hint: "Deploy the function from supabase/functions/ and turn Verify JWT OFF. A 404 means it isn't deployed; a 401 means Verify JWT is still on.",
    run: async () => {
      try {
        const res = await supabase!.functions.invoke("create-payment-intent", { body: { booking_ref: "PREFLIGHT-CHECK" } });
        const d = res.data as { ok?: boolean; error?: string } | null;
        if (res.error) return { status: "fail", note: `${res.error.message ?? res.error}` };
        /* a well-behaved "booking not found" answer proves the function ran */
        if (d && d.ok === false && /not found/i.test(d.error ?? "")) return { status: "pass", note: "responding correctly" };
        if (d && d.ok === false) return { status: "warn", note: d.error ?? "unexpected answer" };
        return { status: "warn", note: "unexpected answer from the function" };
      } catch (e) {
        return { status: "fail", note: (e as Error).message };
      }
    },
  },
  {
    id: "bucket-photos",
    label: "Storage · photos bucket",
    group: "functions",
    hint: "Run the Tier 1 SQL in the SQL Editor — it creates the public photos bucket used by uploads.",
    run: async () => {
      const { error } = await supabase!.storage.from("photos").list("", { limit: 1 });
      if (error) return { status: "fail", note: error.message };
      return { status: "pass" };
    },
  },
  {
    id: "svc-email",
    label: "EmailJS · booking notifications",
    group: "services",
    hint: "Add the four VITE_EMAILJS_* variables (.env.local + Netlify) and rebuild.",
    run: async () => {
      if (!emailNotificationsEnabled) return { status: "fail", note: "keys missing — bookings won't send emails" };
      if (!clientEmailsEnabled) return { status: "warn", note: "studio alert works; the client template ID is missing" };
      return { status: "pass", note: "studio + client emails armed" };
    },
  },
  {
    id: "svc-stripe",
    label: "Stripe · on-site deposits",
    group: "services",
    hint: "Add VITE_STRIPE_PUBLISHABLE_KEY (pk_test_… / pk_live_…) and rebuild.",
    run: async () => {
      if (!stripeOnSiteEnabled) return { status: "fail", note: "publishable key missing — the pay button can't load" };
      if (!/^pk_(test|live)_/.test(stripePublishableKey))
        return { status: "warn", note: "key doesn't look like a Stripe publishable key (pk_…)" };
      return { status: "pass", note: stripePublishableKey.startsWith("pk_live_") ? "LIVE money mode" : "test mode" };
    },
  },
];

const STATUS_META: Record<Status, { dot: string; text: string; label: string }> = {
  idle: { dot: "bg-[var(--dim)]", text: "text-[var(--dim)]", label: "—" },
  running: { dot: "bg-[var(--amber)] pulse-dot", text: "text-[var(--amber)]", label: "testing…" },
  pass: { dot: "bg-[var(--sage)]", text: "text-[var(--sage)]", label: "pass" },
  fail: { dot: "bg-[var(--ember)]", text: "text-[var(--ember)]", label: "fail" },
  warn: { dot: "bg-[var(--amber)]", text: "text-[var(--amber)]", label: "check" },
  skip: { dot: "bg-[var(--dim)]", text: "text-[var(--dim)]", label: "skipped" },
};

/**
 * PREFLIGHT — a one-click smoke test of the whole deployment: every table,
 * the slot engine, the payment function, the photo bucket, email + Stripe config.
 * Lives in the Bookings tab so the desk's operator can verify health anytime.
 */
export default function SystemCheck() {
  const [results, setResults] = useState<Record<string, { status: Status; note?: string }>>({});
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState(false);
  const runIdRef = useRef(0);

  const runAll = async () => {
    if (running) return;
    setRunning(true);
    const id = ++runIdRef.current;
    setResults({});
    for (const c of CHECKS) {
      if (id !== runIdRef.current) return;
      setResults((r) => ({ ...r, [c.id]: { status: "running" } }));
      /* a beat between checks so the strip lights up row by row */
      await new Promise((res) => window.setTimeout(res, 120));
      if (id !== runIdRef.current) return;
      let out: { status: Status; note?: string };
      if (!cloud && (c.group === "database" || c.group === "functions")) {
        out = { status: "skip", note: "local demo mode — cloud check skipped" };
      } else {
        try {
          out = await c.run();
        } catch (e) {
          out = { status: "fail", note: (e as Error).message };
        }
      }
      if (id !== runIdRef.current) return;
      setResults((r) => ({ ...r, [c.id]: out }));
    }
    setRunning(false);
  };

  const done = Object.values(results).filter((r) => r.status !== "running" && r.status !== "idle");
  const passed = done.filter((r) => r.status === "pass").length;
  const failed = done.filter((r) => r.status === "fail").length;
  const warns = done.filter((r) => r.status === "warn").length;

  const groups: { id: CheckDef["group"]; label: string }[] = [
    { id: "database", label: "Database" },
    { id: "functions", label: "Functions & storage" },
    { id: "services", label: "Services" },
  ];

  return (
    <div className="panel mt-8 overflow-hidden">
      {/* header strip */}
      <div className="flex items-center justify-between gap-4 bg-[#10293e] px-5 py-3.5">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 text-left">
          <span
            className={`h-2 w-2 rounded-full ${
              failed > 0 ? "bg-[var(--ember)] pulse-dot" : done.length === CHECKS.length ? "bg-[var(--sage)]" : "bg-[#7ab8e6] pulse-dot"
            }`}
          />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#f2f9fe]">Preflight · deployment health</span>
          {done.length > 0 && done.length === CHECKS.length && (
            <span className={`font-mono text-[9.5px] tracking-[0.18em] uppercase ${failed ? "text-[#f0a08c]" : warns ? "text-[#eec389]" : "text-[#9fd8b0]"}`}>
              {passed} pass · {warns} check · {failed} fail
            </span>
          )}
        </button>
        <button
          onClick={runAll}
          disabled={running}
          className="flex items-center gap-2 border border-[rgba(242,249,254,0.3)] px-3.5 py-2 font-mono text-[9.5px] tracking-[0.2em] uppercase text-[#f2f9fe] transition-colors hover:border-[#7ab8e6] hover:text-[#7ab8e6] disabled:cursor-wait disabled:opacity-60"
        >
          <IconAperture width={13} height={13} className={running ? "animate-spin" : ""} />
          {running ? "Testing…" : done.length ? "Re-run" : "Run checks"}
        </button>
      </div>

      {open && (
        <div className="fade-in px-5 py-5">
          {!cloud && (
            <p className="mb-4 border border-dashed border-[var(--line)] bg-[var(--bg2)] px-4 py-3 font-mono text-[10px] leading-relaxed tracking-[0.12em] text-[var(--dim)]">
              LOCAL DEMO MODE — database & function checks need Supabase keys. Config checks below still run.
            </p>
          )}

          {groups.map((g) => (
            <div key={g.id} className={g.id === "database" ? "" : "mt-5"}>
              <div className="mb-2 flex items-center gap-3">
                <span className="font-mono text-[9px] tracking-[0.28em] uppercase text-[var(--dim)]">{g.label}</span>
                <span className="h-px flex-1 bg-[var(--line-soft)]" />
              </div>
              <div className="grid gap-1.5">
                {CHECKS.filter((c) => c.group === g.id).map((c) => {
                  const r = results[c.id] ?? { status: "idle" as Status };
                  const meta = STATUS_META[r.status];
                  return (
                    <div
                      key={c.id}
                      className={`flex items-start justify-between gap-4 border border-[var(--line-soft)] bg-[var(--bg2)] px-3.5 py-2.5 transition-all duration-300 ${
                        r.status === "fail" ? "!border-[var(--ember)]/50" : r.status === "pass" ? "!border-[var(--sage)]/40" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${meta.dot}`} />
                          <span className="truncate font-mono text-[11px] tracking-[0.08em] text-[var(--ink)]">{c.label}</span>
                        </div>
                        {r.status === "fail" || r.status === "warn" ? (
                          <p className="mt-1.5 pl-4 text-[11px] leading-relaxed text-[var(--muted)]">
                            <span className={meta.text}>{r.note}</span>
                            <span className="mt-1 block text-[var(--dim)]">Fix → {c.hint}</span>
                          </p>
                        ) : r.note && r.status === "pass" ? (
                          <p className="mt-0.5 pl-4 font-mono text-[9.5px] tracking-[0.12em] text-[var(--dim)]">{r.note}</p>
                        ) : null}
                      </div>
                      <span className={`flex shrink-0 items-center gap-1.5 font-mono text-[9px] tracking-[0.22em] uppercase ${meta.text}`}>
                        {r.status === "pass" && <IconCheck width={11} height={11} />}
                        {r.status === "fail" && <IconX width={11} height={11} />}
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="mt-5 border-t border-[var(--line-soft)] pt-4 text-center font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--dim)]">
            Run this after any deploy, SQL change or new feature — it tests what your visitors depend on
          </p>
        </div>
      )}
    </div>
  );
}
