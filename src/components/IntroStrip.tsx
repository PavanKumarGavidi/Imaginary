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
  // DESKTOP/TABLET VERSION - Bold editorial manifesto style
  // ═══════════════════════════════════════════════════════════════
  return (
    <section className="relative overflow-hidden bg-[var(--ink)] py-24 text-white">
      {/* Large background number */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-[30rem] leading-none text-white/[0.02]">
        ƒ
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-8">
        {/* Top label */}
        <div className="mb-16 flex items-center gap-4">
          <div className="h-px w-12 bg-[var(--amber)]" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--amber)]">
            Our Manifesto
          </span>
        </div>

        {/* Three columns with dramatic typography */}
        <div className="grid gap-16 md:grid-cols-3">
          {/* Column 1 - Philosophy */}
          <div className="group relative">
            <div className="mb-6 flex items-center gap-3">
              <IconAperture width={32} height={32} className="text-[var(--amber)] transition-transform duration-700 group-hover:rotate-180" />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60">
                01 / Philosophy
              </span>
            </div>
            <h3 className="font-display text-3xl leading-tight text-white mb-6">
              Every frame tells a story
            </h3>
            <p className="text-base leading-relaxed text-white/70">
              We believe photography is about capturing the authentic moment — the subtle glance, the natural laugh, the quiet connection. Not posing, but being.
            </p>
            <div className="mt-8 h-px w-12 bg-[var(--amber)] transition-all duration-500 group-hover:w-24" />
          </div>

          {/* Column 2 - What we do */}
          <div className="group relative">
            <div className="mb-6">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60">
                02 / Craft
              </span>
            </div>
            <h3 className="font-display text-3xl leading-tight text-white mb-6">
              Light, shadow, intention
            </h3>
            <p className="text-base leading-relaxed text-white/70">
              From intimate portraits to grand celebrations, we craft images with purpose. Each session is a collaboration — your story, our vision, shared through the lens.
            </p>
            <div className="mt-8 h-px w-12 bg-[var(--amber)] transition-all duration-500 group-hover:w-24" />
          </div>

          {/* Column 3 - The experience */}
          <div className="group relative">
            <div className="mb-6">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60">
                03 / Experience
              </span>
            </div>
            <h3 className="font-display text-3xl leading-tight text-white mb-6">
              Relaxed, present, authentic
            </h3>
            <p className="text-base leading-relaxed text-white/70">
              We handle the technical details so you can focus on being present. Our studio is a sanctuary — warm, welcoming, and designed for creating beautiful work together.
            </p>
            <div className="mt-8 h-px w-12 bg-[var(--amber)] transition-all duration-500 group-hover:w-24" />
          </div>
        </div>

        {/* Bottom signature */}
        <div className="mt-24 flex items-center justify-between border-t border-white/10 pt-8">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">
            Imagine Studio · Portland, OR
          </div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">
            Est. 2011
          </div>
        </div>
      </div>
    </section>
  );
}
