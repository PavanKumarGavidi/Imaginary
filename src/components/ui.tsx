import { useEffect, useState } from "react";
import type { CSSProperties, ImgHTMLAttributes, ReactNode } from "react";
import { useCountUp, useInView, useReducedMotion } from "../hooks";
import { useStore } from "../store";
import { IconAperture } from "./Icons";

/* ————— image with graceful fallback —————
   Photos are served from an external CDN. If one fails (network, rate-limit,
   or a removed asset) we swap in a styled placeholder instead of a broken icon. */
export function SafeImg({
  className = "",
  fallbackClassName,
  alt,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { fallbackClassName?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [rest.src]);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center overflow-hidden bg-[linear-gradient(155deg,#dcecf8_0%,#b9d4ea_100%)] text-[var(--amber)] ${
          fallbackClassName ?? className
        }`}
      >
        <IconAperture className="opacity-50" width={34} height={34} />
      </div>
    );
  }
  return <img alt={alt} className={className} onError={() => setFailed(true)} {...rest} />;
}

/* ————— scroll reveal wrapper ————— */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`rv ${inView ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/* ————— scramble / decode text ————— */
const GLYPHS = "▓▒░#%/<>+*";

function Scrambler({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    let frame = 0;
    let raf = 0;
    const total = 24;
    const tick = () => {
      frame++;
      const resolved = Math.floor((frame / total) * text.length);
      let s = text.slice(0, resolved);
      for (let i = resolved; i < text.length; i++) {
        s += text[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (frame < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced]);
  return <>{out}</>;
}

export function ScrambleText({ text, className = "" }: { text: string; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  return (
    <span ref={ref} className={className}>
      {inView ? <Scrambler text={text} /> : text}
    </span>
  );
}

/* ————— animated counter ————— */
export function CountUp({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.5);
  const n = useCountUp(value, inView);
  return (
    <span ref={ref} className={className}>
      {n.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ————— marquee ————— */
export function Marquee({ children, fast = false, className = "" }: { children: ReactNode; fast?: boolean; className?: string }) {
  return (
    <div className={`marquee ${className}`}>
      <div className={`marquee-track ${fast ? "fast" : ""}`}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ————— section heading ————— */
export function SectionHead({
  num,
  label,
  title,
  right,
}: {
  num: string;
  label: string;
  title: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-12 md:mb-16">
      <Reveal>
        <div className="flex items-center gap-4">
          <span className="kicker">
            {num} · {label}
          </span>
          <span className="h-px flex-1 bg-[var(--line-soft)]" />
          {right}
        </div>
      </Reveal>
      <h2 className="font-display mt-5 text-[clamp(2.7rem,5.2vw,4.6rem)] leading-[1.02] text-[var(--ink)]">
        <Reveal delay={90}>{title}</Reveal>
      </h2>
    </div>
  );
}

/* ————— toasts ————— */
export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="fixed bottom-6 right-6 z-[95] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in panel flex items-center gap-3 border-l-2 px-4 py-3 text-sm shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] ${
            t.tone === "ok" ? "border-l-[var(--amber)]" : "border-l-[var(--ember)]"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${t.tone === "ok" ? "bg-[var(--amber)]" : "bg-[var(--ember)]"}`} />
          <span className="text-[var(--ink)]">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
