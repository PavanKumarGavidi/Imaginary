import { useEffect, useState, useMemo } from "react";
import { useStore } from "../store";
import { useReducedMotion } from "../hooks";
import { IconAperture, IconArrow, IconFlash } from "./Icons";
import { Marquee, SafeImg, ScrambleText } from "./ui";

/** Renders *word* segments as emphasized accents */
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

/** Rotating badge - desktop only */
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
  
  const genres = useMemo(
    () => content.services.map((s) => s.title.replace(/ Sessions?$/, "")),
    [content.services]
  );
  
  const [flash, setFlash] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setFlash(false), 950);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // MOBILE VERSION - Clean, fast, optimized (unchanged)
  // ═══════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <section id="top" className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
        {/* Mobile: lightweight gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-gradient-to-br from-[rgba(246,250,253,1)] via-[rgba(233,244,251,0.8)] to-[rgba(246,250,253,1)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-5 pt-28 pb-12">
          {/* Top - eyebrow */}
          <div className="flex items-center gap-3">
            <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--amber)]" />
            <span className="kicker">{hero.eyebrow}</span>
          </div>

          {/* Middle - headline and content */}
          <div>
            <h1 className="font-display text-[clamp(2.8rem,10vw,5rem)] leading-[0.95] tracking-tight">
              <span className="block">{hero.l1}</span>
              <span className="block">
                <Accent text={hero.l2} emClass="italic text-[var(--amber)]" />
              </span>
              <span className="block text-[var(--muted)]">
                <Accent text={hero.l3} emClass="italic" />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)]">
              {hero.blurb}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <a href="#book" className="btn-solid w-full">
                Book a session <IconArrow width={17} height={17} />
              </a>
              <a href="#work" className="btn-ghost w-full">
                View our work
              </a>
            </div>

            {/* Mobile stats - horizontal scroll */}
            <div className="mt-10 flex gap-6 overflow-x-auto scrollbar-none border-t border-[var(--line-soft)] pt-6">
              <div className="shrink-0">
                <div className="font-display text-3xl text-[var(--ink)]">14+</div>
                <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                  Years
                </div>
              </div>
              <div className="shrink-0">
                <div className="font-display text-3xl text-[var(--ink)]">2,400+</div>
                <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                  Sessions
                </div>
              </div>
              <div className="shrink-0">
                <div className="font-display text-3xl text-[var(--ink)]">96%</div>
                <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                  Rebook
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DESKTOP/TABLET VERSION - Premium editorial design
  // ═══════════════════════════════════════════════════════════════
  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      {/* Shutter flash on arrival */}
      {!reduced && flash && (
        <div className="flash-overlay pointer-events-none fixed inset-0 z-[85] bg-white" />
      )}

      {/* Full-bleed hero background with Ken Burns */}
      <div className="absolute inset-0 z-0">
        <SafeImg
          src="https://image.qwenlm.ai/generated-images/b1701b48-0a30-4656-a7ae-bef26f493233/_result.png"
          alt="Imagine Studio - Professional Photography"
          className="kenburns h-full w-full object-cover"
          loading="eager"
        />
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(246,250,253,0.95)] via-[rgba(246,250,253,0.75)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(246,250,253,0.9)] via-transparent to-[rgba(246,250,253,0.3)]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-8 pt-32 pb-16">
        {/* Top bar - eyebrow and studio info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--amber)]" />
            <span className="kicker">
              <ScrambleText text={hero.eyebrow} />
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
            <IconAperture width={14} height={14} />
            <span>Est. 2011 · Portland, OR</span>
          </div>
        </div>

        {/* Middle section - headline and featured work */}
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Headline and description */}
          <div className="lg:col-span-7">
            <h1 className="font-display text-[clamp(3.5rem,7vw,7rem)] leading-[0.92] tracking-tight">
              <span className="mask-line block">
                <span style={{ animationDelay: "0.1s" }}>{hero.l1}</span>
              </span>
              <span className="mask-line block">
                <span style={{ animationDelay: "0.25s" }}>
                  <Accent text={hero.l2} emClass="italic text-[var(--amber)]" />
                </span>
              </span>
              <span className="mask-line block">
                <span className="text-[var(--muted)]" style={{ animationDelay: "0.4s" }}>
                  <Accent text={hero.l3} emClass="italic" />
                </span>
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
              {hero.blurb}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex items-center gap-4">
              <a
                href="#book"
                className="btn-solid group"
              >
                Book a session
                <IconArrow width={17} height={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href="#work" className="btn-ghost group">
                View our work
                <IconArrow width={17} height={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>

            {/* EXIF strip - technical photography details */}
            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--line-soft)] pt-5 font-mono text-[11px] tracking-[0.14em] text-[var(--dim)]">
              <span className="flex items-center gap-2 text-[var(--amber)]">
                <IconFlash width={13} height={13} /> REC
              </span>
              <span>PORTRA 400</span>
              <span>85MM</span>
              <span>f/1.8</span>
              <span>1/160s</span>
              <span>ISO 200</span>
              <span>AWB · RAW+JPEG</span>
            </div>
          </div>

          {/* Right: Featured work showcase */}
          <div className="relative lg:col-span-5">
            <RotatingBadge />
            
            {/* Main featured image with viewfinder brackets */}
            <div className="group relative border border-[var(--line)] bg-[var(--panel)] p-3 shadow-[0_30px_60px_-35px_rgba(18,42,62,0.35)] transition-shadow duration-500 hover:shadow-[0_40px_80px_-40px_rgba(18,42,62,0.5)]">
              {/* Viewfinder brackets */}
              <span className="vf-bracket left-0 top-0 border-l-2 border-t-2" />
              <span className="vf-bracket right-0 top-0 border-r-2 border-t-2" />
              <span className="vf-bracket bottom-0 left-0 border-b-2 border-l-2" />
              <span className="vf-bracket bottom-0 right-0 border-b-2 border-r-2" />

              <div className="relative overflow-hidden">
                <SafeImg
                  src="https://image.qwenlm.ai/generated-images/c0b9eff8-3185-4a55-a6dc-e9534c2ae032/_result.png"
                  alt="Featured portrait work"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(18,42,62,0.6)] via-transparent to-transparent" />
                
                {/* Image metadata */}
                <div className="absolute left-3 top-3">
                  <div className="rounded-sm bg-[rgba(18,42,62,0.8)] px-3 py-1.5 backdrop-blur-sm">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--photo-ink)]">
                      PORTRAIT · 2024
                    </div>
                  </div>
                </div>
                
                {/* Bottom info */}
                <div className="absolute bottom-3 left-3 right-3">
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

              {/* Frame info */}
              <div className="flex items-center justify-between px-1 pb-1 pt-3">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)]">
                  In-house print · 16×20"
                </span>
                <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--amber)]">
                  FR 01/24
                </span>
              </div>
            </div>

            {/* Secondary image - wedding - overlapping */}
            <div className="absolute -bottom-8 -left-8 hidden w-48 overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)] shadow-[0_20px_40px_-20px_rgba(18,42,62,0.4)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(18,42,62,0.5)] md:block">
              <div className="aspect-square overflow-hidden">
                <SafeImg
                  src="https://image.qwenlm.ai/generated-images/08b910be-ffff-49ef-a188-0539ad3febbc/_result.png"
                  alt="Wedding photography"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="bg-[var(--panel)] px-3 py-2">
                <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--muted)]">
                  Wedding · Golden Hour
                </div>
              </div>
            </div>

            {/* Stats - vertical with amber accent */}
            <div className="absolute -right-12 top-1/2 hidden -translate-y-1/2 xl:block">
              <div className="space-y-6 border-l-2 border-[var(--amber)] pl-6">
                <div>
                  <div className="font-display text-4xl text-[var(--ink)]">14+</div>
                  <div className="mt-1 font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--dim)]">
                    Years behind<br />the lens
                  </div>
                </div>
                <div>
                  <div className="font-display text-4xl text-[var(--ink)]">2,400+</div>
                  <div className="mt-1 font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--dim)]">
                    Sessions<br />delivered
                  </div>
                </div>
                <div>
                  <div className="font-display text-4xl text-[var(--ink)]">96%</div>
                  <div className="mt-1 font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--dim)]">
                    Clients who<br />rebook
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - scroll indicator */}
        <div className="flex items-center justify-between border-t border-[var(--line-soft)] pt-6">
          <div className="flex items-center gap-2">
            <div className="h-px w-12 bg-[var(--dim)]" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
              Scroll to explore
            </span>
          </div>
          <div className="animate-bounce">
            <IconArrow width={20} height={20} className="rotate-90 text-[var(--amber)]" />
          </div>
        </div>
      </div>

      {/* Genre marquee */}
      <div className="relative z-10 border-y border-[var(--line-soft)] bg-[rgba(255,255,255,0.95)] py-4 backdrop-blur-sm">
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
    </section>
  );
}
