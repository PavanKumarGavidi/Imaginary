import { useStore } from "../store";
import { SafeImg } from "./ui";
import { IconArrow } from "./Icons";

export default function FeaturedWork() {
  const { frames } = useStore();
  
  // Get the first 4 published frames for featured work
  const featured = frames.filter(f => f.published).slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section className="relative border-b border-[var(--line-soft)] bg-[var(--bg)] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Section header */}
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-12 bg-[var(--line)]" />
              <span className="kicker">Featured Work</span>
            </div>
            <h2 className="font-display text-4xl text-[var(--ink)] md:text-5xl lg:text-6xl">
              Recent <span className="italic text-[var(--amber)]">Sessions</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base text-[var(--muted)] md:text-lg">
              A glimpse into our latest work — each session crafted with intention and care.
            </p>
          </div>
          <a
            href="#work"
            className="btn-ghost inline-flex w-fit items-center gap-2"
          >
            View full archive <IconArrow width={16} height={16} />
          </a>
        </div>

        {/* Featured work grid - asymmetric layout */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-12">
          {/* Large featured item - takes up 2/3 on desktop */}
          {featured[0] && (
            <div className="group relative overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)] md:col-span-8">
              <div className="relative aspect-[16/10] overflow-hidden md:aspect-[16/9]">
                <SafeImg
                  src={featured[0].img}
                  alt={featured[0].title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:p-8">
                  <div>
                    <div className="font-display text-2xl text-white md:text-3xl lg:text-4xl">{featured[0].title}</div>
                    <div className="mt-2 font-mono text-[10px] tracking-[0.18em] uppercase text-white/80 md:text-xs">
                      {featured[0].exif}
                    </div>
                  </div>
                </div>

                {/* Category badge */}
                <div className="absolute left-4 top-4 md:left-6 md:top-6">
                  <div className="rounded-sm bg-black/60 px-3 py-1.5 backdrop-blur-sm md:px-4 md:py-2">
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white md:text-xs">
                      {featured[0].cat}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Info bar */}
              <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-4 py-3 md:px-6 md:py-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg text-[var(--ink)] md:text-xl lg:text-2xl">{featured[0].title}</div>
                  <div className="mt-0.5 truncate font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)] md:text-[10px]">
                    {featured[0].cat} · {featured[0].exif.split('·')[0]?.trim() || 'Studio'}
                  </div>
                </div>
                <div className="ml-4 shrink-0 font-mono text-[10px] tracking-[0.22em] text-[var(--amber)] md:text-xs">
                  ƒ IMAGINE
                </div>
              </div>
            </div>
          )}

          {/* Two smaller items - stacked on mobile, side-by-side on desktop */}
          <div className="grid gap-4 md:col-span-4 md:gap-6">
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
                  <div className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-5">
                    <div>
                      <div className="font-display text-xl text-white md:text-2xl">{featured[1].title}</div>
                      <div className="mt-1 hidden font-mono text-[10px] tracking-[0.18em] uppercase text-white/80 md:block">
                        {featured[1].exif}
                      </div>
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="absolute left-3 top-3 md:left-4 md:top-4">
                    <div className="rounded-sm bg-black/60 px-2 py-1 backdrop-blur-sm md:px-3 md:py-1.5">
                      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white md:text-[10px]">
                        {featured[1].cat}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Info bar */}
                <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-3 py-2.5 md:px-4 md:py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm text-[var(--ink)] md:text-base">{featured[1].title}</div>
                    <div className="mt-0.5 truncate font-mono text-[8px] tracking-[0.18em] uppercase text-[var(--dim)] md:text-[9px]">
                      {featured[1].cat}
                    </div>
                  </div>
                  <div className="ml-2 shrink-0 font-mono text-[9px] tracking-[0.22em] text-[var(--amber)] md:text-[10px]">
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
                  <div className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-5">
                    <div>
                      <div className="font-display text-xl text-white md:text-2xl">{featured[2].title}</div>
                      <div className="mt-1 hidden font-mono text-[10px] tracking-[0.18em] uppercase text-white/80 md:block">
                        {featured[2].exif}
                      </div>
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="absolute left-3 top-3 md:left-4 md:top-4">
                    <div className="rounded-sm bg-black/60 px-2 py-1 backdrop-blur-sm md:px-3 md:py-1.5">
                      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white md:text-[10px]">
                        {featured[2].cat}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Info bar */}
                <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-3 py-2.5 md:px-4 md:py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm text-[var(--ink)] md:text-base">{featured[2].title}</div>
                    <div className="mt-0.5 truncate font-mono text-[8px] tracking-[0.18em] uppercase text-[var(--dim)] md:text-[9px]">
                      {featured[2].cat}
                    </div>
                  </div>
                  <div className="ml-2 shrink-0 font-mono text-[9px] tracking-[0.22em] text-[var(--amber)] md:text-[10px]">
                    ƒ IMAGINE
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fourth item - full width on mobile, hidden on desktop to keep layout clean */}
        {featured[3] && (
          <div className="mt-4 md:mt-6">
            <div className="group relative overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)]">
              <div className="relative aspect-[16/9] overflow-hidden">
                <SafeImg
                  src={featured[3].img}
                  alt={featured[3].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-8">
                  <div>
                    <div className="font-display text-2xl text-white md:text-3xl">{featured[3].title}</div>
                    <div className="mt-2 font-mono text-[10px] tracking-[0.18em] uppercase text-white/80 md:text-xs">
                      {featured[3].exif}
                    </div>
                  </div>
                </div>

                {/* Category badge */}
                <div className="absolute left-4 top-4 md:left-6 md:top-6">
                  <div className="rounded-sm bg-black/60 px-3 py-1.5 backdrop-blur-sm md:px-4 md:py-2">
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white md:text-xs">
                      {featured[3].cat}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Info bar */}
              <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-4 py-3 md:px-6 md:py-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg text-[var(--ink)] md:text-xl">{featured[3].title}</div>
                  <div className="mt-0.5 truncate font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)] md:text-[10px]">
                    {featured[3].cat} · {featured[3].exif.split('·')[0]?.trim() || 'Studio'}
                  </div>
                </div>
                <div className="ml-4 shrink-0 font-mono text-[10px] tracking-[0.22em] text-[var(--amber)] md:text-xs">
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
