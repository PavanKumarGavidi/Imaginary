import { useEffect, useState } from "react";
import { IMG } from "../data";
import { useReducedMotion } from "../hooks";
import { IconAperture, IconArrow, IconFlash } from "./Icons";
import { Marquee, SafeImg, ScrambleText } from "./ui";

const GENRES = ["Portrait", "Wedding", "Editorial", "Product", "Maternity", "Events", "Film scans"];

function RotatingBadge() {
  return (
    <div className="absolute -bottom-9 -left-9 z-10 hidden h-32 w-32 items-center justify-center md:flex">
      <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0 h-full w-full">
        <defs>
          <path id="obscirc" d="M 60,60 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" fill="none" />
        </defs>
        <text className="font-mono" fontSize="9.5" letterSpacing="2.6" fill="var(--amber)">
          <textPath href="#obscirc">BOOK A SESSION · IMAGINE STUDIO · EST. 2011 ·&#160;</textPath>
        </text>
      </svg>
      <IconAperture className="text-[var(--ink)]" width={22} height={22} />
    </div>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setFlash(false), 950);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-36">
      {/* shutter flash on arrival */}
      {!reduced && flash && <div className="flash-overlay pointer-events-none fixed inset-0 z-[85] bg-white" />}

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
          {/* ——— left: statement ——— */}
          <div className="lg:col-span-7">
            <div className="mb-7 flex items-center gap-3">
              <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--amber)]" />
              <span className="kicker">
                <ScrambleText text="Currently booking · Spring ’26" />
              </span>
            </div>

            <h1 className="font-display text-[clamp(3.9rem,10vw,8rem)] leading-[0.98]">
              <span className="mask-line">
                <span style={{ animationDelay: "0.08s" }}>We write</span>
              </span>
              <span className="mask-line">
                <span style={{ animationDelay: "0.2s" }}>
                  with <em className="italic text-[var(--amber)]">light</em>
                </span>
              </span>
              <span className="mask-line">
                <span className="text-[var(--muted)]" style={{ animationDelay: "0.32s" }}>
                  &amp; <em className="italic">shadow</em>
                  <span className="text-[var(--ember)]">.</span>
                </span>
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
              Imagine is a full-service photography studio and working darkroom in Portland’s Pearl District — portraits,
              weddings, editorial and product work, lit slowly and retouched by hand under one roof.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="#book" className="btn-solid">
                Book a session <IconArrow width={17} height={17} />
              </a>
              <a href="#work" className="btn-ghost">
                Browse the archive
              </a>
            </div>

            {/* EXIF strip */}
            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--line-soft)] pt-5 font-mono text-[11px] tracking-[0.14em] text-[var(--dim)]">
              <span className="flex items-center gap-2 text-[var(--amber)]">
                <IconFlash width={13} height={13} /> REC
              </span>
              <span>PORTRA 400</span>
              <span>85MM</span>
              <span>f/1.8</span>
              <span>1/160s</span>
              <span>ISO 200</span>
              <span className="hidden sm:inline">AWB · RAW+JPEG</span>
            </div>
          </div>

          {/* ——— right: featured frame ——— */}
          <div className="relative lg:col-span-5">
            <RotatingBadge />
            <div className="group relative border border-[var(--line)] bg-[var(--panel)] p-3 shadow-[0_30px_60px_-35px_rgba(18,42,62,0.35)]">
              {/* viewfinder brackets */}
              <span className="vf-bracket left-0 top-0 border-l-2 border-t-2" />
              <span className="vf-bracket right-0 top-0 border-r-2 border-t-2" />
              <span className="vf-bracket bottom-0 left-0 border-b-2 border-l-2" />
              <span className="vf-bracket bottom-0 right-0 border-b-2 border-r-2" />

              <div className="relative overflow-hidden">
                <SafeImg
                  src={IMG.hero}
                  alt="Low-key studio portrait lit with soft daylight"
                  className="kenburns aspect-[4/3] w-full object-cover"
                  loading="eager"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(18,42,62,0.5),transparent_45%)]" />
                <div className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.2em] text-[var(--photo-ink)]/90">
                  PORTRAIT 04 — SKY SERIES
                </div>
                <div className="absolute bottom-3 right-3 border border-white/30 px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-[var(--photo-ink)]/90">
                  FR 01/24
                </div>
              </div>

              <div className="flex items-center justify-between px-1 pb-1 pt-3">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)]">In-house print · 16×20”</span>
                <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--amber)]">ƒ IMAGINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ——— genre marquee ——— */}
      <div className="mt-20 border-y border-[var(--line-soft)] bg-[rgba(233,244,251,0.85)] py-4">
        <Marquee>
          {GENRES.map((g, i) => (
            <span key={g} className="mx-5 flex items-center gap-10">
              <span className={`font-display text-xl tracking-[0.14em] uppercase ${i % 2 ? "text-[var(--amber)]" : "text-[var(--muted)]"}`}>
                {g}
              </span>
              <IconAperture width={15} height={15} className="text-[var(--dim)]" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
