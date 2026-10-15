import { useStore } from "../store";
import { SafeImg } from "./ui";
import { IconArrow } from "./Icons";

export default function FeaturedWork() {
  const { frames } = useStore();
  
  // Get the first 3 published frames for featured work
  const featured = frames.filter(f => f.published).slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="relative border-b border-[var(--line-soft)] bg-[var(--bg)] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Section header */}
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[var(--line)]" />
            <span className="kicker">Featured Work</span>
            <span className="h-px w-12 bg-[var(--line)]" />
          </div>
          <h2 className="font-display text-4xl text-[var(--ink)] md:text-5xl">
            Recent <span className="italic text-[var(--amber)]">Sessions</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--muted)] md:text-lg">
            A glimpse into our latest work — each session crafted with intention and care.
          </p>
        </div>

        {/* Featured work grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((frame, index) => (
            <div
              key={frame.id}
              className="group relative overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--panel)] shadow-[0_20px_40px_-20px_rgba(18,42,62,0.3)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-30px_rgba(18,42,62,0.4)]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <SafeImg
                  src={frame.img}
                  alt={frame.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,42,62,0.7)] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div>
                    <div className="font-display text-2xl text-white">{frame.title}</div>
                    <div className="mt-2 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--photo-ink)]/80">
                      {frame.exif}
                    </div>
                  </div>
                </div>

                {/* Category badge */}
                <div className="absolute left-4 top-4">
                  <div className="rounded-sm bg-[rgba(18,42,62,0.8)] px-3 py-1.5 backdrop-blur-sm">
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--photo-ink)]">
                      {frame.cat}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info bar */}
              <div className="flex items-center justify-between border-t border-[var(--line-soft)] bg-[var(--panel)] px-4 py-3">
                <div>
                  <div className="font-display text-lg text-[var(--ink)]">{frame.title}</div>
                  <div className="mt-0.5 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">
                    {frame.cat} · {frame.exif.split('·')[0]?.trim() || 'Studio'}
                  </div>
                </div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--amber)]">
                  ƒ IMAGINE
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-12 text-center">
          <a
            href="#work"
            className="btn-ghost inline-flex items-center gap-2"
          >
            View full archive <IconArrow width={16} height={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
