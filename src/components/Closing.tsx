import { useState } from "react";
import { FAQS, PACKAGES, QUOTES } from "../data";
import { Marquee, Reveal, SectionHead } from "./ui";
import { IconArrow, IconCheck, IconChevron, IconStar } from "./Icons";

/* ——————————————————— PACKAGES ——————————————————— */
export function Pricing({ onChoose }: { onChoose: (packageId: string) => void }) {
  return (
    <section id="packages" className="relative border-t border-[var(--line-soft)] bg-[rgba(29,24,20,0.4)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          num="04"
          label="Packages"
          title={<>Three ways to frame it.</>}
          right={<span className="hidden font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)] sm:block">Prices in USD · deposit 30%</span>}
        />

        <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_1.16fr_1fr]">
          {PACKAGES.map((p, i) => (
            <Reveal key={p.id} delay={i * 110} className="h-full">
              <article
                className={`relative flex h-full flex-col p-8 transition-all duration-400 hover:-translate-y-2 ${
                  p.featured
                    ? "border border-[var(--amber)] bg-[var(--panel)] shadow-[0_30px_70px_-40px_rgba(224,164,88,0.45)]"
                    : "border border-[var(--line-soft)] bg-[var(--panel)] hover:border-[var(--line)]"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3.5 left-8 bg-[var(--amber)] px-3 py-1 font-mono text-[10px] tracking-[0.24em] uppercase text-[#1c140a]">
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
  return (
    <section className="relative overflow-hidden border-t border-[var(--line-soft)] py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead num="05" label="Kind words" title={<>Word from the sitter.</>} />
      </div>
      <Reveal>
        <Marquee className="pb-2">
          {QUOTES.map((q, i) => (
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
    </section>
  );
}

/* ——————————————————— FAQ ——————————————————— */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative border-t border-[var(--line-soft)] bg-[rgba(29,24,20,0.4)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead num="06" label="Before you ask" title={<>Asked before the flash.</>} />
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
            {FAQS.map((f, i) => {
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
