import { useEffect, useState, useMemo } from "react";
import { useStore } from "../store";
import { useReducedMotion } from "../hooks";
import { IconAperture, IconArrow } from "./Icons";
import { SafeImg } from "./ui";

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
  const { sitePhotos, content } = useStore();
  const { hero } = content;
  
  // Memoize genres to prevent recalculation
  const genres = useMemo(
    () => content.services.map((s) => s.title.replace(/ Sessions?$/, "")),
    [content.services]
  );

  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      {/* Optimized background - lazy loaded, no heavy gradients */}
      <div className="absolute inset-0 z-0">
        <SafeImg
          src="https://image.qwenlm.ai/generated-images/38efb22b-275d-41b2-87d3-20d381b60e09/_result.png"
          alt="Imagine Studio"
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {/* Simple overlay - no complex gradients */}
        <div className="absolute inset-0 bg-white/80" />
      </div>

      {/* Content - simplified animations */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-24 pb-16 md:px-8 md:pt-32 md:pb-24">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Main content */}
          <div className="text-center lg:text-left">
            {/* Simple eyebrow - no scramble animation */}
            <div className="mb-4 flex items-center justify-center gap-2 lg:justify-start">
              <span className="h-2 w-2 rounded-full bg-[var(--amber)]" />
              <span className="kicker">{hero.eyebrow}</span>
            </div>

            {/* Headline - simple fade in, no mask-line */}
            <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] tracking-tight animate-fade-in">
              <span className="block">{hero.l1}</span>
              <span className="block">
                <Accent text={hero.l2} emClass="italic text-[var(--amber)]" />
              </span>
              <span className="block text-[var(--muted)]">
                <Accent text={hero.l3} emClass="italic" />
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] lg:mx-0">
              {hero.blurb}
            </p>

            {/* CTA Buttons - simplified */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a href="#book" className="btn-solid w-full sm:w-auto">
                Book a session <IconArrow width={17} height={17} />
              </a>
              <a href="#work" className="btn-ghost w-full sm:w-auto">
                View our work
              </a>
            </div>

            {/* Trust signals - simplified */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--line-soft)] pt-6">
              <div className="text-center lg:text-left">
                <div className="font-display text-2xl text-[var(--ink)] md:text-3xl">14+</div>
                <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                  Years
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-display text-2xl text-[var(--ink)] md:text-3xl">2,400+</div>
                <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                  Sessions
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-display text-2xl text-[var(--ink)] md:text-3xl">96%</div>
                <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                  Satisfaction
                </div>
              </div>
            </div>
          </div>

          {/* Right: Featured image - simplified, no rotating badge */}
          <div className="relative hidden lg:block">
            <div className="overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)]">
              <div className="relative aspect-[4/5] overflow-hidden">
                <SafeImg
                  src="https://image.qwenlm.ai/generated-images/c0b9eff8-3185-4a55-a6dc-e9534c2ae032/_result.png"
                  alt="Featured work"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {/* Simple overlay - no backdrop blur */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Simple metadata - no backdrop blur */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="font-display text-lg text-white">Featured Portrait</div>
                  <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-white/80">
                    85MM · f/1.8
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple genre list - no marquee animation */}
      <div className="relative z-10 border-y border-[var(--line-soft)] bg-white/90 py-3">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {genres.map((g, i) => (
              <span
                key={g}
                className={`font-display text-sm tracking-[0.14em] uppercase md:text-base ${
                  i % 2 ? "text-[var(--amber)]" : "text-[var(--muted)]"
                }`}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
