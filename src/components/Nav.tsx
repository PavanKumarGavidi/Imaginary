import { useEffect, useState } from "react";
import { IconAperture, IconKey, IconMenu, IconX } from "./Icons";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#packages", label: "Packages" },
  { href: "#studio", label: "Studio" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export default function Nav({ onAdmin }: { onAdmin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[70] transition-all duration-500 ${
        scrolled ? "border-b border-[var(--line-soft)] bg-[rgba(255,255,255,0.92)] backdrop-blur-md shadow-[0_10px_30px_-20px_rgba(18,42,62,0.3)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <a href="#top" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <IconAperture className="text-[var(--amber)] transition-transform duration-700 group-hover:rotate-90" width={26} height={26} />
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl tracking-[0.12em] text-[var(--ink)]">IMAGINE</span>
            <span className="font-mono mt-1 text-[9px] tracking-[0.32em] text-[var(--muted)]">EST. 2011 · PDX</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="uline font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onAdmin}
            title="Staff entrance"
            className="hidden items-center gap-2 border border-[var(--line)] px-3 py-2 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)] transition-all hover:border-[var(--amber)] hover:text-[var(--amber)] sm:flex"
          >
            <IconKey width={14} height={14} />
            Staff
          </button>
          <a href="#book" className="btn-solid !px-4 !py-2.5 text-sm">
            Book a session
          </a>
          <button
            className="flex h-10 w-10 items-center justify-center border border-[var(--line)] text-[var(--ink)] lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      <div className={`grid overflow-hidden transition-all duration-500 lg:hidden ${open ? "grid-rows-[1fr] border-b border-[var(--line-soft)] bg-[rgba(255,255,255,0.98)]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <nav className="flex flex-col px-6 py-4">
            {LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-[var(--line-soft)] py-3.5 font-mono text-xs tracking-[0.24em] uppercase text-[var(--muted)] last:border-0"
              >
                <span>{l.label}</span>
                <span className="font-mono text-[10px] text-[var(--dim)]">0{i + 1}</span>
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onAdmin();
              }}
              className="mt-4 flex items-center gap-2 self-start font-mono text-[11px] tracking-[0.24em] uppercase text-[var(--amber)]"
            >
              <IconKey width={14} height={14} /> Staff entrance
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
