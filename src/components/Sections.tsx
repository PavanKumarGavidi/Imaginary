import type { ComponentType, SVGProps } from "react";
import { SERVICES } from "../data";
import type { Service } from "../data";
import { useStore } from "../store";
import { CountUp, Reveal, SectionHead } from "./ui";
import { IconArrow, IconFilm, IconHanger, IconLens, IconPrint, IconPrism, IconRings, IconSprout, IconStage } from "./Icons";

const SERVICE_ICONS: Record<Service["icon"], ComponentType<SVGProps<SVGSVGElement>>> = {
  lens: IconLens,
  rings: IconRings,
  prism: IconPrism,
  hanger: IconHanger,
  sprout: IconSprout,
  stage: IconStage,
};

const STATS = [
  { v: 14, suffix: "", label: "Years behind the lens" },
  { v: 2400, suffix: "+", label: "Sessions delivered" },
  { v: 38, suffix: "", label: "Awards & press features" },
  { v: 96, suffix: "%", label: "Clients who rebook" },
];

const PROCESS = [
  { n: "01", t: "The brief", d: "A 15-minute call or studio coffee. We map mood, wardrobe and the frames that matter." },
  { n: "02", t: "The shoot", d: "Unhurried, directed sessions — digital and, if you like, 35mm or 120 film on the side." },
  { n: "03", t: "The darkroom", d: "Every select is colour-graded and retouched by hand. Film is developed and scanned in-house." },
  { n: "04", t: "The handoff", d: "A private gallery, print-ready files, and archival pigment prints from our own press." },
];

/* ——————————————————— ABOUT / STUDIO ——————————————————— */
export function About() {
  const { sitePhotos } = useStore();
  return (
    <section id="studio" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* sticky narrative */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead num="01" label="The studio" title={<>A darkroom with a day job.</>} />
            <Reveal delay={120}>
              <p className="max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
                We started Imagine in 2011 with two strobes, a borrowed Rollei and a stubborn belief: that a photograph
                should feel like the room did — the heat of the tungsten, the dust in the beam, the second before the laugh.
              </p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
                Fourteen years on, the Mercer Lane floor holds three seamless bays, a print press and a working darkroom.
                The belief hasn’t changed. Neither has the coffee.
              </p>
              <p className="mt-7 font-body text-sm italic text-[var(--ink)]">
                — Mara Voss &amp; Jules Ferreira, founders
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="chip">Film · Digital</span>
                <span className="chip">In-house retouch</span>
                <span className="chip">Archival printing</span>
                <span className="chip">On-location</span>
              </div>
            </Reveal>
          </div>

          {/* studio frame + stats + process */}
          <div>
            <Reveal>
              <figure className="group relative border border-[var(--line)] bg-[var(--panel)] p-3">
                <div className="overflow-hidden">
                  <img
                    src={sitePhotos.studio}
                    alt="The Imagine studio floor — camera on tripod, backdrop rolls, soft daylight"
                    className="aspect-[5/6] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                </div>
                <figcaption className="flex items-center justify-between px-1 pb-1 pt-3">
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)]">The floor — Mercer Lane</span>
                  <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--amber)]">HP5+ · 2025</span>
                </figcaption>
              </figure>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-10 grid grid-cols-2 border border-[var(--line-soft)]">
                {STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className={`group p-6 transition-colors duration-300 hover:bg-[var(--panel)] ${i % 2 === 0 ? "border-r border-[var(--line-soft)]" : ""} ${i < 2 ? "border-b border-[var(--line-soft)]" : ""}`}
                  >
                    <div className="font-display text-4xl text-[var(--amber)] md:text-5xl">
                      <CountUp value={s.v} suffix={s.suffix} />
                    </div>
                    <div className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <div className="mt-10">
              {PROCESS.map((p, i) => (
                <Reveal key={p.n} delay={i * 80}>
                  <div className="group flex gap-6 border-t border-[var(--line-soft)] py-5 transition-all duration-300 hover:translate-x-2 hover:border-[var(--amber)]">
                    <span className="font-mono text-xs tracking-[0.2em] text-[var(--amber)]">{p.n}</span>
                    <div>
                      <h3 className="font-display text-lg tracking-wide uppercase text-[var(--ink)]">{p.t}</h3>
                      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[var(--muted)]">{p.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ——————————————————— SERVICES ——————————————————— */
export function Services({ onBookSession }: { onBookSession: (session: string) => void }) {
  return (
    <section id="services" className="relative border-t border-[var(--line-soft)] bg-[rgba(233,244,251,0.6)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          num="02"
          label="What we shoot"
          title={<>Six ways to sit for us.</>}
          right={<span className="hidden font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)] sm:block">All sessions include in-house retouch</span>}
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = SERVICE_ICONS[s.icon];
            return (
              <Reveal key={s.id} delay={(i % 3) * 100} className={i % 3 === 1 ? "lg:translate-y-6" : ""}>
                <article className="group relative flex h-full flex-col border border-[var(--line-soft)] bg-[var(--panel)] p-7 transition-all duration-400 hover:-translate-y-1.5 hover:border-[var(--amber)] hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.9)]">
                  <div className="flex items-start justify-between">
                    <Icon width={30} height={30} className="text-[var(--amber)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                    <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--dim)]">0{i + 1}</span>
                  </div>
                  <h3 className="font-display mt-5 text-2xl tracking-wide uppercase text-[var(--ink)]">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{s.desc}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {s.includes.map((inc) => (
                      <span key={inc} className="chip">{inc}</span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[var(--line-soft)] pt-5 text-sm">
                    <span className="font-mono text-[11px] tracking-[0.16em] text-[var(--dim)]">
                      FROM <span className="text-[var(--ink)]">${s.from}</span> · {s.duration.toUpperCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => onBookSession(s.title)}
                    className="mt-5 flex items-center gap-2 self-start font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--amber)] transition-all hover:gap-3.5"
                  >
                    Book this <IconArrow width={14} height={14} />
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={140}>
          <div className="mt-14 flex flex-col items-start gap-4 border border-[var(--line-soft)] bg-[var(--panel)] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <IconFilm width={22} height={22} className="text-[var(--amber)]" />
              <p className="text-sm text-[var(--muted)]">
                <span className="text-[var(--ink)]">Film add-on:</span> any session can include 35mm or 120 rolls — developed and scanned in our darkroom within the week.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="chip"><IconPrint width={12} height={12} className="mr-1.5 inline" />Prints from $18</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
