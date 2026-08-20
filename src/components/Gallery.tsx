import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "../data";
import { useStore } from "../store";
import { Reveal, SectionHead } from "./ui";
import { IconArrowR, IconX } from "./Icons";

export default function Gallery() {
  const { frames } = useStore();
  const published = useMemo(() => frames.filter((f) => f.published), [frames]);
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = useMemo(() => (cat === "All" ? published : published.filter((g) => g.cat === cat)), [cat, published]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((v) => (v === null ? v : (v + 1) % items.length));
      if (e.key === "ArrowLeft") setLightbox((v) => (v === null ? v : (v - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, items.length]);

  const active = lightbox !== null ? items[lightbox] : null;

  return (
    <section id="work" className="relative border-t border-[var(--line-soft)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          num="03"
          label="The archive"
          title={<>Selected frames, 2011–26.</>}
          right={
            <span className="hidden font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)] sm:block">
              {items.length} frame{items.length === 1 ? "" : "s"} in view
            </span>
          }
        />

        {/* filters */}
        <Reveal>
          <div className="mb-10 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const count = c === "All" ? published.length : published.filter((g) => g.cat === c).length;
              const isActive = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`border px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-300 ${
                    isActive
                      ? "border-[var(--amber)] bg-[var(--amber)] text-white"
                      : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)]"
                  }`}
                >
                  {c} <span className={isActive ? "opacity-70" : "text-[var(--dim)]"}>{count}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* masonry */}
        {items.length === 0 ? (
          <Reveal>
            <p className="panel p-10 text-center text-sm text-[var(--muted)]">
              Nothing hangs in this room right now — the crew is printing new frames. Try another category.
            </p>
          </Reveal>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {items.map((g, i) => (
              <Reveal key={g.id} delay={(i % 3) * 90} className="mb-5 break-inside-avoid">
                <button
                  onClick={() => setLightbox(i)}
                  className="group relative block w-full overflow-hidden border border-[var(--line-soft)] bg-[var(--panel)] text-left shadow-[0_18px_40px_-30px_rgba(18,42,62,0.4)]"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={g.img}
                      alt={`${g.title} — ${g.cat} photograph by Imagine`}
                      className="w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                    {/* frame number */}
                    <span className="absolute left-3 top-3 border border-white/25 bg-[rgba(18,42,62,0.45)] px-2 py-1 font-mono text-[10px] tracking-[0.22em] text-[var(--photo-ink)]/95 backdrop-blur-sm">
                      FR {String(published.findIndex((x) => x.id === g.id) + 1).padStart(2, "0")}
                    </span>
                    <span className="chip absolute right-3 top-3 !border-white/25 bg-[rgba(18,42,62,0.45)] !text-[#8fd0f7] backdrop-blur-sm">
                      {g.cat}
                    </span>
                    {/* hover wash */}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(18,42,62,0.85),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-4 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="font-display text-2xl tracking-wide text-white">{g.title}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--photo-ink)]/75">{g.exif}</span>
                        <IconArrowR width={16} height={16} className="text-[#8fd0f7]" />
                      </div>
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={120}>
          <p className="mt-8 text-center font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--dim)]">
            The full archive holds 40,000+ frames — <span className="text-[var(--amber)]">request a private viewing</span> at the studio
          </p>
        </Reveal>
      </div>

      {/* ——— lightbox ——— */}
      {active && (
        <div
          className="fade-in fixed inset-0 z-[88] flex flex-col bg-[rgba(240,248,253,0.97)] backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
        >
          <div className="flex items-center justify-between px-5 py-4 md:px-8">
            <span className="font-mono text-[11px] tracking-[0.24em] text-[var(--muted)]">
              {String((lightbox ?? 0) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} — {active.cat.toUpperCase()}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(null);
              }}
              className="flex h-10 w-10 items-center justify-center border border-[var(--line)] bg-white text-[var(--ink)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
              aria-label="Close lightbox"
            >
              <IconX />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center gap-4 px-4 pb-4 md:gap-8 md:px-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((v) => (v === null ? v : (v - 1 + items.length) % items.length));
              }}
              className="hidden h-12 w-12 shrink-0 items-center justify-center border border-[var(--line)] bg-white text-[var(--ink)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)] md:flex"
              aria-label="Previous frame"
            >
              <IconArrowR className="rotate-180" />
            </button>

            <figure className="pop-in flex max-h-full flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img
                key={active.id}
                src={active.img}
                alt={active.title}
                className="max-h-[70vh] w-auto max-w-full border border-[var(--line)] object-contain shadow-[0_40px_80px_-40px_rgba(18,42,62,0.5)]"
              />
              <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
                <span className="font-display text-2xl text-[var(--ink)]">{active.title}</span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--muted)]">{active.exif}</span>
              </figcaption>
            </figure>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((v) => (v === null ? v : (v + 1) % items.length));
              }}
              className="hidden h-12 w-12 shrink-0 items-center justify-center border border-[var(--line)] bg-white text-[var(--ink)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)] md:flex"
              aria-label="Next frame"
            >
              <IconArrowR />
            </button>
          </div>

          {/* mobile prev/next */}
          <div className="flex justify-center gap-4 pb-6 md:hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox((v) => (v === null ? v : (v - 1 + items.length) % items.length))}
              className="flex h-11 w-11 items-center justify-center border border-[var(--line)] bg-white text-[var(--ink)]"
              aria-label="Previous frame"
            >
              <IconArrowR className="rotate-180" />
            </button>
            <button
              onClick={() => setLightbox((v) => (v === null ? v : (v + 1) % items.length))}
              className="flex h-11 w-11 items-center justify-center border border-[var(--line)] bg-white text-[var(--ink)]"
              aria-label="Next frame"
            >
              <IconArrowR />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
