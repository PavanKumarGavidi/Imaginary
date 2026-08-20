import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { PACKAGES, SESSIONS, STUDIO, TIME_SLOTS, getPackage } from "../data";
import type { Booking as BookingType } from "../store";
import { useStore } from "../store";
import { Reveal } from "./ui";
import { IconAperture, IconArrow, IconCalendar, IconClock, IconMail, IconPhone, IconPin, IconUsers } from "./Icons";

const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

interface FormState {
  name: string;
  email: string;
  phone: string;
  session: string;
  packageId: string;
  date: string;
  time: string;
  guests: string;
  notes: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  session: "",
  packageId: "contact",
  date: "",
  time: "",
  guests: "1",
  notes: "",
};

export default function BookingSection() {
  const { addBooking, prefill, toast } = useStore();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState<BookingType | null>(null);
  const [sending, setSending] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  /* package / session prefill coming from pricing cards & service links */
  useEffect(() => {
    if (!prefill) return;
    setForm((f) => ({
      ...f,
      ...(prefill.session ? { session: prefill.session } : {}),
      ...(prefill.packageId ? { packageId: prefill.packageId } : {}),
    }));
    setSubmitted(null);
  }, [prefill]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = (): boolean => {
    const er: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) er.name = "Tell us who’s sitting.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = "That email won’t develop.";
    if (form.phone.replace(/\D/g, "").length < 7) er.phone = "We need a reachable number.";
    if (!form.session) er.session = "Pick a session type.";
    if (!form.packageId) er.packageId = "Pick a package.";
    if (!form.date) er.date = "Choose a date.";
    else if (form.date < today) er.date = "That date has already been exposed.";
    if (!form.time) er.time = "Pick a time slot.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    // simulate the desk processing the request
    window.setTimeout(() => {
      const b = addBooking({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        session: form.session,
        packageId: form.packageId,
        date: form.date,
        time: form.time,
        guests: Number(form.guests),
        notes: form.notes.trim(),
      });
      setSubmitted(b);
      setSending(false);
      toast(`Request ${b.ref} received — confirmation within 24h.`);
    }, 650);
  };

  const pkg = getPackage(form.packageId);

  return (
    <section id="book" className="relative border-t border-[var(--line-soft)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          {/* ——— sticky intro ——— */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="kicker">07 · Reserve</span>
                <span className="h-px flex-1 bg-[var(--line-soft)]" />
              </div>
            </Reveal>
            <h2 className="font-display mt-5 text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[0.98] uppercase">
              <Reveal delay={90}>Reserve your session.</Reveal>
            </h2>
            <Reveal delay={140}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--muted)]">
                Send the request and the desk replies within 24 hours with a confirmation and your deposit link. Your date
                is locked the moment the deposit clears.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-9 space-y-0">
                {[
                  ["Request", "Tell us the date, the package and the mood. Notes welcome."],
                  ["Confirm", "We reply within 24h. A 30% deposit locks the slot."],
                  ["Shoot", "Arrive rested. We handle light, direction and the clock."],
                ].map(([t, d], i) => (
                  <div key={t} className="flex gap-5 border-t border-[var(--line-soft)] py-4">
                    <span className="font-mono text-xs tracking-[0.2em] text-[var(--amber)]">0{i + 1}</span>
                    <div>
                      <div className="font-display text-base tracking-wide uppercase">{t}</div>
                      <p className="mt-1 text-sm text-[var(--muted)]">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className="panel mt-9 p-6">
                <div className="space-y-3.5 text-sm">
                  <a href={`tel:${STUDIO.phone.replace(/[^0-9]/g, "")}`} className="flex items-center gap-3 text-[var(--muted)] transition-colors hover:text-[var(--amber)]">
                    <IconPhone width={16} height={16} className="text-[var(--amber)]" /> {STUDIO.phone}
                  </a>
                  <a href={`mailto:${STUDIO.email}`} className="flex items-center gap-3 text-[var(--muted)] transition-colors hover:text-[var(--amber)]">
                    <IconMail width={16} height={16} className="text-[var(--amber)]" /> {STUDIO.email}
                  </a>
                  <div className="flex items-center gap-3 text-[var(--muted)]">
                    <IconPin width={16} height={16} className="text-[var(--amber)]" /> {STUDIO.addr}, {STUDIO.city}
                  </div>
                </div>
                <div className="mt-5 border-t border-[var(--line-soft)] pt-4">
                  {STUDIO.hours.map(([d, h]) => (
                    <div key={d} className="flex justify-between py-1 font-mono text-[11px] tracking-[0.14em] text-[var(--dim)]">
                      <span className="uppercase">{d}</span>
                      <span className="text-[var(--muted)]">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <p className="mt-6 border-l-2 border-[var(--amber)] pl-4 text-sm leading-relaxed text-[var(--muted)]">
                <span className="text-[var(--ink)]">Good to know:</span> reschedule once, free, with 72h notice. Weather
                calls for outdoor work are always on us.
              </p>
            </Reveal>
          </div>

          {/* ——— form / confirmation ——— */}
          <Reveal delay={120}>
            {submitted ? (
              <div className="pop-in border border-[var(--amber)] bg-[var(--panel)] p-8 md:p-10">
                <div className="flex items-center gap-4">
                  <IconAperture width={34} height={34} className="text-[var(--amber)]" />
                  <div>
                    <h3 className="font-display text-3xl uppercase">Request in the darkroom.</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">The desk confirms within 24 hours — watch your inbox.</p>
                  </div>
                </div>

                <div className="mt-8 border border-dashed border-[var(--line)] bg-[var(--bg2)] p-5 text-center">
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--dim)]">Your reference</div>
                  <div className="font-display mt-2 text-4xl tracking-[0.14em] text-[var(--amber)]">{submitted.ref}</div>
                  <div className="mt-2 inline-flex items-center gap-2 border border-[var(--amber)]/40 bg-[rgba(13,127,194,0.08)] px-3 py-1 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--amber)]">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> Pending confirmation
                  </div>
                </div>

                <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                  {[
                    ["Client", submitted.name],
                    ["Email", submitted.email],
                    ["Session", submitted.session],
                    ["Package", `${getPackage(submitted.packageId)?.name} — $${getPackage(submitted.packageId)?.price}`],
                    ["Date", fmtDate(submitted.date)],
                    ["Call time", `${submitted.time} · ${submitted.guests} guest${submitted.guests > 1 ? "s" : ""}`],
                  ].map(([k, v]) => (
                    <div key={k} className="border-b border-[var(--line-soft)] pb-3">
                      <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)]">{k}</dt>
                      <dd className="mt-1 text-[var(--ink)]">{v}</dd>
                    </div>
                  ))}
                </dl>

                {submitted.notes && (
                  <p className="mt-6 border-l-2 border-[var(--line)] pl-4 text-sm italic text-[var(--muted)]">“{submitted.notes}”</p>
                )}

                <div className="mt-9 flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      setSubmitted(null);
                      setForm(EMPTY);
                    }}
                    className="btn-solid"
                  >
                    Book another session <IconArrow width={16} height={16} />
                  </button>
                  <a href="#top" className="btn-ghost">Back to top</a>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="border border-[var(--line)] bg-[var(--panel)] p-8 md:p-10">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="font-display text-2xl tracking-wide uppercase">Booking request</h3>
                  <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--dim)]">FORM 26-B</span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="bk-name">Full name *</label>
                    <input id="bk-name" className={`input ${errors.name ? "err" : ""}`} placeholder="Ada Merriweather" value={form.name} onChange={set("name")} />
                    {errors.name && <p className="mt-1.5 text-xs text-[var(--ember)]">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="bk-email">Email *</label>
                    <input id="bk-email" type="email" className={`input ${errors.email ? "err" : ""}`} placeholder="ada@postbox.com" value={form.email} onChange={set("email")} />
                    {errors.email && <p className="mt-1.5 text-xs text-[var(--ember)]">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="bk-phone">Phone *</label>
                    <input id="bk-phone" className={`input ${errors.phone ? "err" : ""}`} placeholder="(503) 555-0100" value={form.phone} onChange={set("phone")} />
                    {errors.phone && <p className="mt-1.5 text-xs text-[var(--ember)]">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="bk-guests">People on set</label>
                    <select id="bk-guests" className="input" value={form.guests} onChange={set("guests")}>
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="bk-session">Session type *</label>
                    <select id="bk-session" className={`input ${errors.session ? "err" : ""}`} value={form.session} onChange={set("session")}>
                      <option value="">Select…</option>
                      {SESSIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.session && <p className="mt-1.5 text-xs text-[var(--ember)]">{errors.session}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="bk-package">Package *</label>
                    <select id="bk-package" className={`input ${errors.packageId ? "err" : ""}`} value={form.packageId} onChange={set("packageId")}>
                      {PACKAGES.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>
                      ))}
                    </select>
                    {errors.packageId && <p className="mt-1.5 text-xs text-[var(--ember)]">{errors.packageId}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="bk-date">Preferred date *</label>
                    <input id="bk-date" type="date" min={today} className={`input ${errors.date ? "err" : ""}`} value={form.date} onChange={set("date")} />
                    {errors.date && <p className="mt-1.5 text-xs text-[var(--ember)]">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="bk-time">Call time *</label>
                    <select id="bk-time" className={`input ${errors.time ? "err" : ""}`} value={form.time} onChange={set("time")}>
                      <option value="">Select…</option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.time && <p className="mt-1.5 text-xs text-[var(--ember)]">{errors.time}</p>}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="label" htmlFor="bk-notes">The brief — mood, references, must-have frames</label>
                  <textarea
                    id="bk-notes"
                    rows={4}
                    className="input resize-none"
                    placeholder="Golden-hour couple portraits, grandmother’s garden, one frame for the mantel…"
                    value={form.notes}
                    onChange={set("notes")}
                  />
                </div>

                <div className="mt-7 flex flex-col gap-5 border-t border-[var(--line-soft)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)]">Estimated total</div>
                    <div className="font-display mt-1 text-3xl text-[var(--amber)]">${pkg?.price ?? 0}</div>
                    <div className="font-mono text-[10px] tracking-[0.14em] text-[var(--dim)]">30% deposit · ${Math.round((pkg?.price ?? 0) * 0.3)} due on confirmation</div>
                  </div>
                  <button type="submit" disabled={sending} className="btn-solid disabled:cursor-wait disabled:opacity-70">
                    {sending ? (
                      <>Developing…</>
                    ) : (
                      <>
                        Send request <IconArrow width={17} height={17} />
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--dim)]">
                  <span className="flex items-center gap-2"><IconCalendar width={12} height={12} /> Free 72h reschedule</span>
                  <span className="flex items-center gap-2"><IconClock width={12} height={12} /> 24h reply, every day</span>
                  <span className="flex items-center gap-2"><IconUsers width={12} height={12} /> Up to 8 on set</span>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
