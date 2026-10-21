import { useState, useEffect } from "react";
import { useStore } from "../store";
import { SafeImg } from "./ui";
import { IconArrow } from "./Icons";

export default function FeaturedWork() {
  const { frames } = useStore();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  
  // Get the first 5 published frames for featured work
  const featured = frames.filter(f => f.published).slice(0, 5);

  if (featured.length === 0) return null;

  // ═══════════════════════════════════════════════════════════════
  // MOBILE VERSION - Clean, simple grid
  // ═══════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <section className="relative border-b border-[var(--line-soft)] bg-[var(--bg)] py-16">
        <div className="mx-auto max-w-7xl px-5">
          {/* Section header */}
          <div className="mb-10 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-[var(--line)]" />
              <span className="kicker">Featured Work</span>
              <span className="h-px w-12 bg-[var(--line)]" />
            </div>
            <h2 className="font-display text-3xl text-[var(--ink)]">
              Recent <span className="italic text-[var(--amber)]">Sessions</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--muted)]">
              A glimpse into our latest work — each session crafted with intention and care.
            </p>
          </div>

          {/* Simple grid for mobile */}
          <div className="grid gap-4">
            {featured.map((frame) => (
              <div
                key={frame.id}
                className="group relative overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg2)]">
                  <SafeImg
                    src={frame.img}
                    alt={frame.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Category badge */}
                  <div className="absolute left-3 top-3">
                    <div className="rounded-sm bg-black/70 px-2 py-1">
                      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white">
                        {frame.cat}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info bar */}
                <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm text-[var(--ink)]">{frame.title}</div>
                    <div className="mt-0.5 truncate font-mono text-[8px] tracking-[0.18em] uppercase text-[var(--dim)]">
                      {frame.cat} · {frame.exif.split('·')[0]?.trim() || 'Studio'}
                    </div>
                  </div>
                  <div className="ml-2 shrink-0 font-mono text-[9px] tracking-[0.22em] text-[var(--amber)]">
                    ƒ IMAGINE
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View all link */}
          <div className="mt-10 text-center">
            <a
              href="#work"
              className="btn-ghost inline-flex items-center gap-2 text-sm"
            >
              View full archive <IconArrow width={16} height={16} />
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DESKTOP/TABLET VERSION - Bold editorial magazine layout
  // ═══════════════════════════════════════════════════════════════
  return (
    <section className="relative bg-[var(--bg)] py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-8">
        {/* Section header - editorial style */}
        <div className="mb-20 flex items-end justify-between border-b-2 border-[var(--ink)] pb-8">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--amber)]">
                Portfolio
              </span>
              <div className="h-px w-12 bg-[var(--amber)]" />
            </div>
            <h2 className="font-display text-6xl text-[var(--ink)] lg:text-7xl">
              Selected <span className="italic">Works</span>
            </h2>
          </div>
          <a
            href="#work"
            className="group flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--ink)] transition-colors hover:text-[var(--amber)]"
          >
            View Archive
            <IconArrow width={16} height={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Editorial grid - completely different layout */}
        <div className="grid gap-8 md:grid-cols-12 md:gap-6">
          {/* Large hero image - spans 7 columns */}
          {featured[0] && (
            <div className="group relative md:col-span-7">
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg2)]">
                <SafeImg
                  src={featured[0].img}
                  alt={featured[0].title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/40" />
                
                {/* Info overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/80 mb-2">
                    {featured[0].cat}
                  </div>
                  <div className="font-display text-4xl text-white mb-2">
                    {featured[0].title}
                  </div>
                  <div className="font-mono text-xs tracking-[0.18em] text-white/70">
                    {featured[0].exif}
                  </div>
                </div>

                {/* Corner annotation */}
                <div className="absolute left-6 top-6 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
                  N° 001
                </div>
              </div>
              
              {/* Caption below */}
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <div className="font-display text-2xl text-[var(--ink)]">{featured[0].title}</div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
                    {featured[0].cat} · {featured[0].exif.split('·')[0]?.trim() || 'Studio'}
                  </div>
                </div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--amber)]">
                  ƒ IMAGINE
                </div>
              </div>
            </div>
          )}

          {/* Right column - two stacked images */}
          <div className="flex flex-col gap-8 md:col-span-5">
            {featured[1] && (
              <div className="group relative">
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg2)]">
                  <SafeImg
                    src={featured[1].img}
                    alt={featured[1].title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/40" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/80 mb-2">
                      {featured[1].cat}
                    </div>
                    <div className="font-display text-3xl text-white">
                      {featured[1].title}
                    </div>
                  </div>

                  <div className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
                    N° 002
                  </div>
                </div>
                
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <div className="font-display text-xl text-[var(--ink)]">{featured[1].title}</div>
                    <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                      {featured[1].cat}
                    </div>
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.22em] text-[var(--amber)]">
                    ƒ IMAGINE
                  </div>
                </div>
              </div>
            )}

            {featured[2] && (
              <div className="group relative">
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg2)]">
                  <SafeImg
                    src={featured[2].img}
                    alt={featured[2].title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/40" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/80 mb-2">
                      {featured[2].cat}
                    </div>
                    <div className="font-display text-3xl text-white">
                      {featured[2].title}
                    </div>
                  </div>

                  <div className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
                    N° 003
                  </div>
                </div>
                
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <div className="font-display text-xl text-[var(--ink)]">{featured[2].title}</div>
                    <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                      {featured[2].cat}
                    </div>
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.22em] text-[var(--amber)]">
                    ƒ IMAGINE
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row - two more images side by side */}
        {(featured[3] || featured[4]) && (
          <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-6">
            {featured[3] && (
              <div className="group relative">
                <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg2)]">
                  <SafeImg
                    src={featured[3].img}
                    alt={featured[3].title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/40" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/80 mb-2">
                      {featured[3].cat}
                    </div>
                    <div className="font-display text-3xl text-white">
                      {featured[3].title}
                    </div>
                  </div>

                  <div className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
                    N° 004
                  </div>
                </div>
                
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <div className="font-display text-xl text-[var(--ink)]">{featured[3].title}</div>
                    <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                      {featured[3].cat}
                    </div>
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.22em] text-[var(--amber)]">
                    ƒ IMAGINE
                  </div>
                </div>
              </div>
            )}

            {featured[4] && (
              <div className="group relative">
                <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg2)]">
                  <SafeImg
                    src={featured[4].img}
                    alt={featured[4].title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/40" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/80 mb-2">
                      {featured[4].cat}
                    </div>
                    <div className="font-display text-3xl text-white">
                      {featured[4].title}
                    </div>
                  </div>

                  <div className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
                    N° 005
                  </div>
                </div>
                
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <div className="font-display text-xl text-[var(--ink)]">{featured[4].title}</div>
                    <div className="mt-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                      {featured[4].cat}
                    </div>
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.22em] text-[var(--amber)]">
                    ƒ IMAGINE
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <a
            href="#work"
            className="btn-solid group inline-flex items-center gap-2"
          >
            Explore Full Archive
            <IconArrow width={16} height={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
