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
  
  // Get the first 4 published frames for featured work
  const featured = frames.filter(f => f.published).slice(0, 4);

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
  // DESKTOP/TABLET VERSION - Asymmetric editorial grid
  // ═══════════════════════════════════════════════════════════════
  return (
    <section className="relative border-b border-[var(--line-soft)] bg-[var(--bg)] py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-8">
        {/* Section header */}
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-12 bg-[var(--line)]" />
              <span className="kicker">Featured Work</span>
            </div>
            <h2 className="font-display text-5xl text-[var(--ink)] lg:text-6xl">
              Recent <span className="italic text-[var(--amber)]">Sessions</span>
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
              A glimpse into our latest work — each session crafted with intention and care.
            </p>
          </div>
          <a
            href="#work"
            className="btn-ghost inline-flex w-fit items-center gap-2 group"
          >
            View full archive
            <IconArrow width={16} height={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Asymmetric grid - desktop */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Large featured item - takes up 8 columns */}
          {featured[0] && (
            <div className="group relative overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)] md:col-span-8">
              <div className="relative aspect-[16/10] overflow-hidden">
                <SafeImg
                  src={featured[0].img}
                  alt={featured[0].title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-end p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div>
                    <div className="font-display text-4xl text-white">{featured[0].title}</div>
                    <div className="mt-2 font-mono text-xs tracking-[0.18em] uppercase text-white/80">
                      {featured[0].exif}
                    </div>
                  </div>
                </div>

                {/* Category badge with backdrop blur */}
                <div className="absolute left-6 top-6">
                  <div className="rounded-sm bg-black/60 px-4 py-2 backdrop-blur-sm">
                    <div className="font-mono text-xs tracking-[0.2em] uppercase text-white">
                      {featured[0].cat}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Info bar */}
              <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-2xl text-[var(--ink)]">{featured[0].title}</div>
                  <div className="mt-0.5 truncate font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
                    {featured[0].cat} · {featured[0].exif.split('·')[0]?.trim() || 'Studio'}
                  </div>
                </div>
                <div className="ml-4 shrink-0 font-mono text-xs tracking-[0.22em] text-[var(--amber)]">
                  ƒ IMAGINE
                </div>
              </div>
            </div>
          )}

          {/* Two smaller items - stacked in 4 columns */}
          <div className="grid gap-6 md:col-span-4">
            {featured[1] && (
              <div className="group relative overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SafeImg
                    src={featured[1].img}
                    alt={featured[1].title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div>
                      <div className="font-display text-2xl text-white">{featured[1].title}</div>
                      <div className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-white/80">
                        {featured[1].exif}
                      </div>
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="absolute left-4 top-4">
                    <div className="rounded-sm bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white">
                        {featured[1].cat}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Info bar */}
                <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-base text-[var(--ink)]">{featured[1].title}</div>
                    <div className="mt-0.5 truncate font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                      {featured[1].cat}
                    </div>
                  </div>
                  <div className="ml-2 shrink-0 font-mono text-[10px] tracking-[0.22em] text-[var(--amber)]">
                    ƒ IMAGINE
                  </div>
                </div>
              </div>
            )}

            {featured[2] && (
              <div className="group relative overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SafeImg
                    src={featured[2].img}
                    alt={featured[2].title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div>
                      <div className="font-display text-2xl text-white">{featured[2].title}</div>
                      <div className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-white/80">
                        {featured[2].exif}
                      </div>
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="absolute left-4 top-4">
                    <div className="rounded-sm bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white">
                        {featured[2].cat}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Info bar */}
                <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-base text-[var(--ink)]">{featured[2].title}</div>
                    <div className="mt-0.5 truncate font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                      {featured[2].cat}
                    </div>
                  </div>
                  <div className="ml-2 shrink-0 font-mono text-[10px] tracking-[0.22em] text-[var(--amber)]">
                    ƒ IMAGINE
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fourth item - full width showcase */}
        {featured[3] && (
          <div className="mt-6">
            <div className="group relative overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)]">
              <div className="relative aspect-[21/9] overflow-hidden">
                <SafeImg
                  src={featured[3].img}
                  alt={featured[3].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-end p-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div>
                    <div className="font-display text-3xl text-white">{featured[3].title}</div>
                    <div className="mt-2 font-mono text-xs tracking-[0.18em] uppercase text-white/80">
                      {featured[3].exif}
                    </div>
                  </div>
                </div>

                {/* Category badge */}
                <div className="absolute left-6 top-6">
                  <div className="rounded-sm bg-black/60 px-4 py-2 backdrop-blur-sm">
                    <div className="font-mono text-xs tracking-[0.2em] uppercase text-white">
                      {featured[3].cat}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Info bar */}
              <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-xl text-[var(--ink)]">{featured[3].title}</div>
                  <div className="mt-0.5 truncate font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
                    {featured[3].cat} · {featured[3].exif.split('·')[0]?.trim() || 'Studio'}
                  </div>
                </div>
                <div className="ml-4 shrink-0 font-mono text-xs tracking-[0.22em] text-[var(--amber)]">
                  ƒ IMAGINE
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
