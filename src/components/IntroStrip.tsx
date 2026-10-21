import { useState, useEffect } from "react";
import { IconAperture } from "./Icons";

export default function IntroStrip() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // MOBILE VERSION - Stacked, clean
  // ═══════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <section className="relative border-b border-[var(--line-soft)] bg-[var(--bg2)] py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="space-y-10">
            {/* Philosophy */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <IconAperture width={24} height={24} className="text-[var(--amber)]" />
                <span className="kicker">Our Philosophy</span>
              </div>
              <p className="text-lg leading-relaxed text-[var(--ink)]">
                We believe every frame should feel like the moment it was taken — authentic, intentional, and alive.
              </p>
            </div>

            {/* What we do */}
            <div>
              <div className="mb-4">
                <span className="kicker">What We Do</span>
              </div>
              <p className="text-base leading-relaxed text-[var(--muted)]">
                From intimate portraits to grand weddings, editorial fashion to product still life — we craft images that tell your story with light and shadow.
              </p>
            </div>

            {/* The experience */}
            <div>
              <div className="mb-4">
                <span className="kicker">The Experience</span>
              </div>
              <p className="text-base leading-relaxed text-[var(--muted)]">
                Relaxed sessions in our Pearl District studio or on location. We handle the technical details so you can focus on being present.
              </p>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="mt-12 flex items-center gap-4 border-t border-[var(--line-soft)] pt-8">
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

  // ═══════════════════════════════════════════════════════════════
  // DESKTOP/TABLET VERSION - Three columns with elegant spacing
  // ═══════════════════════════════════════════════════════════════
  return (
    <section className="relative border-b border-[var(--line-soft)] bg-[var(--bg2)] py-20">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid gap-12 md:grid-cols-3 md:gap-16">
          {/* Column 1 - Philosophy */}
          <div className="group">
            <div className="mb-6 flex items-center gap-3">
              <IconAperture width={28} height={28} className="text-[var(--amber)] transition-transform duration-500 group-hover:rotate-180" />
              <span className="kicker">Our Philosophy</span>
            </div>
            <p className="text-xl leading-relaxed text-[var(--ink)]">
              We believe every frame should feel like the moment it was taken — authentic, intentional, and alive.
            </p>
            <div className="mt-6 h-px w-12 bg-[var(--amber)] transition-all duration-500 group-hover:w-24" />
          </div>

          {/* Column 2 - What we do */}
          <div className="group">
            <div className="mb-6">
              <span className="kicker">What We Do</span>
            </div>
            <p className="text-lg leading-relaxed text-[var(--muted)]">
              From intimate portraits to grand weddings, editorial fashion to product still life — we craft images that tell your story with light and shadow.
            </p>
            <div className="mt-6 h-px w-12 bg-[var(--amber)] transition-all duration-500 group-hover:w-24" />
          </div>

          {/* Column 3 - The experience */}
          <div className="group">
            <div className="mb-6">
              <span className="kicker">The Experience</span>
            </div>
            <p className="text-lg leading-relaxed text-[var(--muted)]">
              Relaxed sessions in our Pearl District studio or on location. We handle the technical details so you can focus on being present.
            </p>
            <div className="mt-6 h-px w-12 bg-[var(--amber)] transition-all duration-500 group-hover:w-24" />
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="mt-16 flex items-center gap-4 border-t border-[var(--line-soft)] pt-10">
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
