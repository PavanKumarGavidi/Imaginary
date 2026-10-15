import { useStore } from "../store";
import { SafeImg } from "./ui";
import { IconArrow } from "./Icons";

export default function FeaturedWork() {
  const { frames } = useStore();
  
  // Get the first 3 published frames for featured work
  const featured = frames.filter(f => f.published).slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="relative border-b border-[var(--line-soft)] bg-[var(--bg)] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Section header */}
        <div className="mb-10 text-center md:mb-14">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[var(--line)]" />
            <span className="kicker">Featured Work</span>
            <span className="h-px w-12 bg-[var(--line)]" />
          </div>
          <h2 className="font-display text-3xl text-[var(--ink)] md:text-4xl lg:text-5xl">
            Recent <span className="italic text-[var(--amber)]">Sessions</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--muted)] md:text-base lg:text-lg">
            A glimpse into our latest work — each session crafted with intention and care.
          </p>
        </div>

        {/* Featured work grid - optimized for mobile */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((frame, index) => (
            <div
              key={frame.id}
              className="group relative overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)] shadow-[0_10px_30px_-15px_rgba(18,42,62,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(18,42,62,0.3)]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image - lazy loaded for performance */}
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg2)]">
                <SafeImg
                  src={frame.img}
                  alt={frame.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,42,62,0.7)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Hover overlay - optimized */}
                <div className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-6">
                  <div>
                    <div className="font-display text-lg text-white md:text-xl lg:text-2xl">{frame.title}</div>
                    <div className="mt-1 hidden font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--photo-ink)]/80 md:block">
                      {frame.exif}
                    </div>
                  </div>
                </div>

                {/* Category badge - backdrop-blur only on desktop */}
                <div className="absolute left-3 top-3 md:left-4 md:top-4">
                  <div className="rounded-sm bg-[rgba(18,42,62,0.8)] px-2 py-1 backdrop-blur-sm md:px-3 md:py-1.5">
                    <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--photo-ink)] md:text-[10px]">
                      {frame.cat}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info bar - optimized for mobile */}
              <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-3 py-2.5 md:px-4 md:py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm text-[var(--ink)] md:text-base lg:text-lg">{frame.title}</div>
                  <div className="mt-0.5 truncate font-mono text-[8px] tracking-[0.18em] uppercase text-[var(--dim)] md:text-[9px]">
                    {frame.cat} · {frame.exif.split('·')[0]?.trim() || 'Studio'}
                  </div>
                </div>
                <div className="ml-2 shrink-0 font-mono text-[9px] tracking-[0.22em] text-[var(--amber)] md:text-[10px]">
                  ƒ IMAGINE
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-10 text-center md:mt-12">
          <a
            href="#work"
            className="btn-ghost inline-flex items-center gap-2 text-sm md:text-base"
          >
            View full archive <IconArrow width={16} height={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
