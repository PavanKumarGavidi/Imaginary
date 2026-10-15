import { useEffect, useState } from "react";
import { useStore } from "../store";
import { useReducedMotion } from "../hooks";
import { IconAperture, IconArrow, IconFlash } from "./Icons";
import { Marquee, SafeImg, ScrambleText } from "./ui";

/** Renders *word* segments as emphasized accents (admin marks emphasis with asterisks). */
function Accent({ text, emClass = "italic" }: { text: string; emClass?: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={i} className={emClass}>
            {part.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function RotatingBadge() {
  return (
    <div className="absolute -bottom-9 -left-9 z-10 hidden h-32 w-32 items-center justify-center md:flex">
      <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0 h-full w-full">
        <defs>
          <path id="obscirc" d="M 60,60 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" fill="none" />
        </defs>
        <text className="font-mono" fontSize="9.5" letterSpacing="2.6" fill="var(--amber)">
          <textPath href="#obscirc">BOOK A SESSION · IMAGINE STUDIO · EST. 2011 ·&#160;</textPath>
        </text>
      </svg>
      <IconAperture className="text-[var(--ink)]" width={22} height={22} />
    </div>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  const { sitePhotos, content } = useStore();
  const { hero } = content;
  const genres = content.services.map((s) => s.title.replace(/ Sessions?$/, ""));
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setFlash(false), 950);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      {/* shutter flash on arrival */}
      {!reduced && flash && <div className="flash-overlay pointer-events-none fixed inset-0 z-[85] bg-white" />}

      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <SafeImg
          src="https://image.qwenlm.ai/generated-images/38efb22b-275d-41b2-87d3-20d381b60e09/_result.png"
          alt="Imagine Studio - Professional Photography"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(246,250,253,0.85)] via-[rgba(246,250,253,0.7)] to-[rgba(246,250,253,0.95)]" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-32 pb-20 md:px-8 md:pt-40 md:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Main content */}
          <div className="text-center lg:text-left">
            {/* Eyebrow */}
            <div className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
              <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--amber)]" />
              <span className="kicker">
                <ScrambleText text={hero.eyebrow} />
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] tracking-tight">
              <span className="mask-line block">
                <span style={{ animationDelay: "0.08s" }}>{hero.l1}</span>
              </span>
              <span className="mask-line block">
                <span style={{ animationDelay: "0.2s" }}>
                  <Accent text={hero.l2} emClass="italic text-[var(--amber)]" />
                </span>
              </span>
              <span className="mask-line block">
                <span className="text-[var(--muted)]" style={{ animationDelay: "0.32s" }}>
                  <Accent text={hero.l3} emClass="italic" />
                </span>
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[var(--muted)] lg:mx-0 lg:text-xl">
              {hero.blurb}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#book"
                className="btn-solid w-full sm:w-auto"
              >
                Book a session <IconArrow width={17} height={17} />
              </a>
              <a href="#work" className="btn-ghost w-full sm:w-auto">
                View our work
              </a>
            </div>

            {/* Trust signals */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-[var(--line-soft)] pt-8">
              <div className="text-center lg:text-left">
                <div className="font-display text-3xl text-[var(--ink)] md:text-4xl">14+</div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
                  Years of craft
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-display text-3xl text-[var(--ink)] md:text-4xl">2,400+</div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
                  Sessions delivered
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-display text-3xl text-[var(--ink)] md:text-4xl">96%</div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
                  Client satisfaction
                </div>
              </div>
            </div>
          </div>

          {/* Right: Featured work showcase */}
          <div className="relative hidden lg:block">
            <RotatingBadge />
            
            {/* Main featured image */}
            <div className="group relative overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)] shadow-[0_40px_80px_-40px_rgba(18,42,62,0.5)] transition-all duration-500 hover:shadow-[0_50px_100px_-40px_rgba(18,42,62,0.6)]">
              <div className="relative aspect-[4/5] overflow-hidden">
                <SafeImg
                  src="https://image.qwenlm.ai/generated-images/c0b9eff8-3185-4a55-a6dc-e9534c2ae032/_result.png"
                  alt="Featured portrait work"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,42,62,0.6)] via-transparent to-transparent" />
                
                {/* Image metadata */}
                <div className="absolute left-4 top-4">
                  <div className="rounded-sm bg-[rgba(18,42,62,0.8)] px-3 py-1.5 backdrop-blur-sm">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--photo-ink)]">
                      PORTRAIT · 2024
                    </div>
                  </div>
                </div>
                
                {/* Bottom info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="font-display text-xl text-white">Elegant Portrait</div>
                      <div className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--photo-ink)]/80">
                        85MM · f/1.8 · PORTRA 400
                      </div>
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--amber)]">
                      ƒ IMAGINE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary image - wedding */}
            <div className="absolute -bottom-8 -left-8 hidden w-48 overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)] shadow-[0_20px_40px_-20px_rgba(18,42,62,0.4)] md:block">
              <div className="aspect-square overflow-hidden">
                <SafeImg
                  src="https://image.qwenlm.ai/generated-images/08b910be-ffff-49ef-a188-0539ad3febbc/_result.png"
                  alt="Wedding photography"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="bg-[var(--panel)] px-3 py-2">
                <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--muted)]">
                  Wedding · Golden Hour
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Genre marquee */}
      <div className="relative z-10 border-y border-[var(--line-soft)] bg-[rgba(255,255,255,0.9)] py-4 backdrop-blur-sm">
        <Marquee>
          {genres.map((g, i) => (
            <span key={g} className="mx-5 flex items-center gap-10">
              <span className={`font-display text-xl tracking-[0.14em] uppercase ${i % 2 ? "text-[var(--amber)]" : "text-[var(--muted)]"}`}>
                {g}
              </span>
              <IconAperture width={15} height={15} className="text-[var(--dim)]" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
            Scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-[var(--dim)] to-transparent" />
        </div>
      </div>
    </section>
  );
}
