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

export default function Hero() {
  const reduced = useReducedMotion();
  const { content } = useStore();
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
  // DESKTOP/TABLET VERSION - Bold editorial magazine style
  // ═══════════════════════════════════════════════════════════════
  return (
    <section id="top" className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      {/* Shutter flash on arrival */}
      {!reduced && flash && (
        <div className="flash-overlay pointer-events-none fixed inset-0 z-[85] bg-white" />
      )}

      {/* Split-screen layout */}
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* LEFT SIDE - Massive typography */}
        <div className="relative flex flex-col justify-between px-8 pt-32 pb-16 lg:px-12 xl:px-16">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--amber)]" />
              <span className="kicker">
                <ScrambleText text={hero.eyebrow} />
              </span>
            </div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
              N° 001
            </div>
          </div>

          {/* Massive headline */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <h1 className="font-display text-[clamp(4rem,9vw,9rem)] leading-[0.85] tracking-tighter">
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

            <p className="mt-8 max-w-lg text-lg leading-relaxed text-[var(--muted)]">
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
                View portfolio
                <IconArrow width={17} height={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="grid grid-cols-3 gap-6 border-t border-[var(--line-soft)] pt-8">
            <div>
              <div className="font-display text-5xl text-[var(--ink)]">14+</div>
              <div className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
                Years of craft
              </div>
            </div>
            <div>
              <div className="font-display text-5xl text-[var(--ink)]">2.4K</div>
              <div className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
                Sessions
              </div>
            </div>
            <div>
              <div className="font-display text-5xl text-[var(--ink)]">96%</div>
              <div className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
                Rebook rate
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Full-bleed image with editorial overlays */}
        <div className="relative hidden lg:block">
          {/* Main image */}
          <div className="absolute inset-0 overflow-hidden">
            <SafeImg
              src="https://image.qwenlm.ai/generated-images/b1701b48-0a30-4656-a7ae-bef26f493233/_result.png"
              alt="Imagine Studio"
              className="kenburns h-full w-full object-cover"
              loading="eager"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-[rgba(246,250,253,0.3)] via-transparent to-transparent" />
          </div>

          {/* Editorial annotations */}
          <div className="absolute left-8 top-32 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
            <div className="mb-2">PORTRAIT · 2024</div>
            <div className="h-px w-12 bg-white/40" />
          </div>

          <div className="absolute bottom-32 right-8 text-right">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
              <div>85MM · f/1.8</div>
              <div>PORTRA 400</div>
              <div className="mt-2 h-px w-12 ml-auto bg-white/40" />
            </div>
          </div>

          {/* Large number overlay */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 font-display text-[20rem] leading-none text-white/5">
            ƒ
          </div>

          {/* Rotating badge */}
          <div className="absolute bottom-8 left-8">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0 h-full w-full">
                <defs>
                  <path id="badge-circ" d="M 60,60 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" fill="none" />
                </defs>
                <text className="font-mono" fontSize="9" letterSpacing="2.5" fill="white">
                  <textPath href="#badge-circ">IMAGINE STUDIO · EST. 2011 · PORTLAND ·&#160;</textPath>
                </text>
              </svg>
              <IconAperture className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" width={24} height={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom marquee */}
      <div className="relative z-10 border-t border-[var(--line-soft)] bg-[var(--bg)] py-4">
        <Marquee>
          {genres.map((g, i) => (
            <span key={g} className="mx-5 flex items-center gap-10">
              <span className={`font-display text-2xl tracking-[0.14em] uppercase ${i % 2 ? "text-[var(--amber)]" : "text-[var(--muted)]"}`}>
                {g}
              </span>
              <IconAperture width={18} height={18} className="text-[var(--dim)]" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
