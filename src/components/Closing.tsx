import { useState } from "react";
import type { FormEvent } from "react";
import { useStore } from "../store";
import { Marquee, Reveal, SectionHead } from "./ui";
import { IconArrow, IconCheck, IconChevron, IconStar } from "./Icons";

/* ————— guestbook — clients leave a word; the desk approves it ————— */
function Guestbook() {
  const { addReview, toast, content } = useStore();
  const [quote, setQuote] = useState("");
  const [name, setName] = useState("");
  const [meta, setMeta] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!quote.trim() || !name.trim()) {
      setErr("A few words and your name — that's all we need.");
      return;
    }
    addReview({ quote: quote.trim(), name: name.trim(), meta: meta.trim() || "Studio client", published: false });
    toast("Thank you — your words will hang on the wall after a quick read.");
    setSent(true);
  };

  if (sent) {
    return (
      <Reveal>
        <div className="panel pop-in mx-auto mt-14 max-w-xl border-l-2 !border-l-[var(--sage)] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--sage)]/50 bg-[rgba(47,138,99,0.08)] text-[var(--sage)]">
            <IconCheck width={20} height={20} />
          </div>
          <p className="font-display mt-4 text-2xl text-[var(--ink)]">In the darkroom, developing.</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            The desk reads every word personally. Yours goes up on the wall once it's approved — usually within the day.
          </p>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal delay={120}>
      <div className="mx-auto mt-14 max-w-4xl border border-[var(--line)] bg-[var(--panel)] shadow-[0_30px_70px_-45px_rgba(18,42,62,0.5)]">
        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-[var(--line-soft)] bg-[#10293e] p-8 text-[#f2f9fe] md:border-b-0 md:border-r">
            <div className="font-mono text-[9.5px] tracking-[0.3em] uppercase text-[#7ab8e6]">The guestbook</div>
            <h3 className="font-display mt-3 text-3xl leading-tight">
              Had a sitting?<br />
              <em className="italic text-[#8fd0f7]">Leave a word.</em>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[rgba(242,249,254,0.7)]">
              Every note is read at the desk before it hangs. It's how the wall stays honest — and how the next sitter
              knows what the light feels like.
            </p>
            <div className="mt-6 flex gap-1 text-[#8fd0f7]">
              {Array.from({ length: 5 }).map((_, s) => (
                <IconStar key={s} />
              ))}
            </div>
          </div>
          <form onSubmit={submit} className="p-8">
            <div className="grid gap-4">
              <div>
                <label className="label" htmlFor="gb-quote">Your words</label>
                <textarea
                  id="gb-quote"
                  className={`input resize-none ${err && !quote.trim() ? "err" : ""}`}
                  rows={3}
                  value={quote}
                  onChange={(e) => {
                    setQuote(e.target.value);
                    setErr("");
                  }}
                  placeholder="They waited out the rain, then gave us golden hour anyway…"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="gb-name">Name</label>
                  <input
                    id="gb-name"
                    className={`input ${err && !name.trim() ? "err" : ""}`}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErr("");
                    }}
                    placeholder="Maya L."
                  />
                </div>
                <div>
                  <label className="label" htmlFor="gb-meta">Session</label>
                  <select id="gb-meta" className="input" value={meta} onChange={(e) => setMeta(e.target.value)}>
                    <option value="">Studio client</option>
                    {content.services.map((s) => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              {err && <p className="text-xs text-[var(--ember)]">{err}</p>}
              <button type="submit" className="btn-solid w-full justify-center">
                Pin it to the wall <IconArrow width={15} height={15} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Reveal>
  );
}

/* ——————————————————— PACKAGES ——————————————————— */
export function Pricing({ onChoose }: { onChoose: (packageId: string) => void }) {
  const { content } = useStore();
  return (
    <section id="packages" className="relative border-t border-[var(--line-soft)] bg-[rgba(233,244,251,0.6)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          num="05"
          label="Packages"
          title={<>Three ways to frame it.</>}
          right={<span className="hidden font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)] sm:block">Prices in USD · deposit 30%</span>}
        />

        <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_1.16fr_1fr]">
          {content.packages.map((p, i) => (
            <Reveal key={p.id} delay={i * 110} className="h-full">
              <article
                className={`relative flex h-full flex-col p-8 transition-all duration-400 hover:-translate-y-2 ${
                  p.featured
                    ? "border border-[var(--amber)] bg-[var(--panel)] shadow-[0_30px_70px_-40px_rgba(13,127,194,0.4)]"
                    : "border border-[var(--line-soft)] bg-[var(--panel)] hover:border-[var(--line)]"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3.5 left-8 bg-[var(--amber)] px-3 py-1 font-mono text-[10px] tracking-[0.24em] uppercase text-white">
                    Most booked
                  </span>
                )}
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-2xl tracking-wide uppercase text-[var(--ink)]">{p.name}</h3>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--dim)]">PKG 0{i + 1}</span>
                </div>
                <p className="mt-2 text-sm italic text-[var(--muted)]">{p.tagline}</p>

                <div className="mt-6 flex items-end gap-2 border-b border-[var(--line-soft)] pb-6">
                  <span className={`font-display text-6xl leading-none ${p.featured ? "text-[var(--amber)]" : "text-[var(--ink)]"}`}>
                    ${p.price}
                  </span>
                  <span className="pb-1 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">/ session</span>
                </div>

                <div className="mt-5 font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--amber)]">{p.hours}</div>

                <ul className="mt-5 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-[var(--muted)]">
                      <IconCheck width={15} height={15} className={`mt-0.5 shrink-0 ${p.featured ? "text-[var(--amber)]" : "text-[var(--dim)]"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button onClick={() => onChoose(p.id)} className={p.featured ? "btn-solid mt-8 w-full justify-center" : "btn-ghost mt-8 w-full justify-center"}>
                  Book {p.name} <IconArrow width={16} height={16} />
                </button>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={160}>
          <p className="mt-10 text-center text-sm text-[var(--muted)]">
            Need something between packages? <a href="#book" className="uline text-[var(--amber)]">Tell us the brief</a> — most odd jobs get a same-day quote.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ——————————————————— TESTIMONIALS ——————————————————— */
export function Testimonials() {
  const { reviews } = useStore();
  const live = reviews.filter((r) => r.published);
  return (
    <section className="relative overflow-hidden border-t border-[var(--line-soft)] py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          num="06"
          label="Kind words"
          title={<>Word from the sitter.</>}
          right={
            <span className="hidden font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)] sm:block">
              {live.length} on the wall
            </span>
          }
        />
      </div>
      {live.length === 0 ? (
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="panel p-10 text-center text-sm text-[var(--muted)]">The wall of kind words is being rehung — check back soon.</p>
        </div>
      ) : (
      <Reveal>
        <Marquee className="pb-2">
          {live.map((q, i) => (
            <div
              key={q.name}
              className={`mx-3 w-[320px] shrink-0 border border-[var(--line-soft)] bg-[var(--panel)] p-6 transition-colors duration-300 hover:border-[var(--amber)] md:w-[380px] ${
                i % 2 ? "md:translate-y-4" : ""
              }`}
            >
              <div className="flex gap-1 text-[var(--amber)]">
                {Array.from({ length: 5 }).map((_, s) => (
                  <IconStar key={s} />
                ))}
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink)]">“{q.quote}”</p>
              <div className="mt-5 border-t border-[var(--line-soft)] pt-4">
                <div className="font-display text-sm tracking-[0.14em] uppercase text-[var(--ink)]">{q.name}</div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">{q.meta}</div>
              </div>
            </div>
          ))}
        </Marquee>
      </Reveal>
      )}
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Guestbook />
      </div>
    </section>
  );
}

/* ——————————————————— FAQ ——————————————————— */
export function Faq() {
  const { content } = useStore();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative border-t border-[var(--line-soft)] bg-[rgba(233,244,251,0.6)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead num="07" label="Before you ask" title={<>Asked before the flash.</>} />
            <Reveal delay={120}>
              <p className="max-w-md text-base leading-relaxed text-[var(--muted)]">
                Deposits, delivery dates, film stocks and travel — the questions every sitter asks before the first frame.
                Anything else, the desk answers within the hour on shoot days.
              </p>
              <a href="#contact" className="btn-ghost mt-8">
                Ask the desk <IconArrow width={16} height={16} />
              </a>
            </Reveal>
          </div>

          <div>
            {content.faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={f.q} delay={i * 60}>
                  <div className={`border-b border-[var(--line-soft)] transition-colors duration-300 ${isOpen ? "border-[var(--amber)]" : ""}`}>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--dim)]">0{i + 1}</span>
                        <span className={`text-base font-medium transition-colors md:text-lg ${isOpen ? "text-[var(--amber)]" : "text-[var(--ink)]"}`}>
                          {f.q}
                        </span>
                      </span>
                      <IconChevron
                        width={18}
                        height={18}
                        className={`shrink-0 text-[var(--muted)] transition-transform duration-400 ${isOpen ? "rotate-180 text-[var(--amber)]" : ""}`}
                      />
                    </button>
                    <div className={`acc-body ${isOpen ? "open" : ""}`}>
                      <div>
                        <p className="max-w-2xl pb-6 pl-9 text-sm leading-relaxed text-[var(--muted)] md:text-[15px]">{f.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
