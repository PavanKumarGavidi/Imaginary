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

  return (
    <section id="top" className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      {/* shutter flash on arrival - desktop only */}
      {!reduced && !isMobile && flash && (
        <div className="flash-overlay pointer-events-none fixed inset-0 z-[85] bg-white" />
      )}

      {/* Full-bleed hero image */}
      <div className="absolute inset-0 z-0">
        <SafeImg
          src="https://image.qwenlm.ai/generated-images/b1701b48-0a30-4656-a7ae-bef26f493233/_result.png"
          alt="Imagine Studio - Professional Photography"
          className={`h-full w-full object-cover ${!isMobile && !reduced ? "kenburns" : ""}`}
          loading="eager"
        />
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(246,250,253,0.95)] via-[rgba(246,250,253,0.7)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(246,250,253,0.9)] via-transparent to-[rgba(246,250,253,0.3)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-5 pt-28 pb-12 md:px-8 md:pt-32 md:pb-16">
        {/* Top section - eyebrow and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--amber)]" />
            <span className="kicker">
              {isMobile ? hero.eyebrow : <ScrambleText text={hero.eyebrow} />}
            </span>
          </div>
          {!isMobile && (
            <div className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)] md:flex">
              <IconAperture width={14} height={14} />
              <span>Est. 2011 · Portland</span>
            </div>
          )}
        </div>

        {/* Middle section - main headline and content */}
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left: Headline and description */}
          <div className="lg:col-span-7">
            <h1 className="font-display text-[clamp(2.8rem,8vw,7rem)] leading-[0.92] tracking-tight">
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

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)] md:mt-8 md:text-lg">
              {hero.blurb}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-10">
              <a
                href="#book"
                className="btn-solid group w-full sm:w-auto"
              >
                Book a session
                <IconArrow width={17} height={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href="#work" className="btn-ghost w-full sm:w-auto">
                View our work
              </a>
            </div>
          </div>

          {/* Right: Stats - only on desktop */}
          {!isMobile && (
            <div className="hidden lg:col-span-5 lg:block">
              <div className="space-y-6 border-l-2 border-[var(--amber)] pl-6">
                <div>
                  <div className="font-display text-5xl text-[var(--ink)]">14+</div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
                    Years behind the lens
                  </div>
                </div>
                <div>
                  <div className="font-display text-5xl text-[var(--ink)]">2,400+</div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
                    Sessions delivered
                  </div>
                </div>
                <div>
                  <div className="font-display text-5xl text-[var(--ink)]">96%</div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
                    Clients who rebook
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom section - Mobile stats and scroll indicator */}
        <div className="flex flex-col gap-6">
          {/* Mobile stats - horizontal scroll */}
          {isMobile && (
            <div className="flex gap-6 overflow-x-auto scrollbar-none border-t border-[var(--line-soft)] pt-6">
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
          )}

          {/* Scroll indicator - desktop only */}
          {!isMobile && (
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
          )}
        </div>
      </div>

      {/* Genre marquee - desktop only */}
      {!isMobile && (
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
      )}
    </section>
  );
}
