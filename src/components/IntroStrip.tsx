import { IconAperture } from "./Icons";

export default function IntroStrip() {
  return (
    <section className="relative border-b border-[var(--line-soft)] bg-[var(--bg2)] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          {/* Column 1 - Philosophy */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <IconAperture width={24} height={24} className="text-[var(--amber)]" />
              <span className="kicker">Our Philosophy</span>
            </div>
            <p className="text-lg leading-relaxed text-[var(--ink)] md:text-xl">
              We believe every frame should feel like the moment it was taken — authentic, intentional, and alive.
            </p>
          </div>

          {/* Column 2 - What we do */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <span className="kicker">What We Do</span>
            </div>
            <p className="text-base leading-relaxed text-[var(--muted)] md:text-lg">
              From intimate portraits to grand weddings, editorial fashion to product still life — we craft images that tell your story with light and shadow.
            </p>
          </div>

          {/* Column 3 - The experience */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <span className="kicker">The Experience</span>
            </div>
            <p className="text-base leading-relaxed text-[var(--muted)] md:text-lg">
              Relaxed sessions in our Pearl District studio or on location. We handle the technical details so you can focus on being present.
            </p>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="mt-12 flex items-center gap-4 border-t border-[var(--line-soft)] pt-8 md:mt-16 md:pt-10">
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--amber)] via-[var(--line)] to-transparent" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--dim)]">
            Since 2011
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-[var(--amber)] via-[var(--line)] to-transparent" />
        </div>
      </div>
    </section>
  );
}
