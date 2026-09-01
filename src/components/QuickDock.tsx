import { useEffect, useState } from "react";
import { useStore } from "../store";
import { IconArrow, IconPhone } from "./Icons";

const waDigits = (raw: string) => raw.replace(/[^0-9]/g, "");

function WaIcon({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.2.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2.1-.8 3.5.5 1.6 1.6 3 3 4a10 10 0 0 0 4.3 1.9c1.3.3 2.4.1 3.2-.5.5-.4.8-1 .9-1.6v-.9c-.1-.1-.3-.2-.5-.2z" />
    </svg>
  );
}

/** Floating quick actions on phones — call, WhatsApp, book. */
export default function QuickDock() {
  const { content } = useStore();
  const c = content.contact;
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wa = waDigits(c.whatsapp || c.phone);

  return (
    <div
      className={`fixed inset-x-0 bottom-4 z-[65] flex justify-center gap-2.5 px-4 transition-all duration-500 sm:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-16 opacity-0"
      }`}
    >
      <a
        href={`tel:${waDigits(c.phone)}`}
        aria-label="Call the studio"
        className="flex h-12 w-12 items-center justify-center border border-[var(--line)] bg-white/95 text-[var(--ink)] shadow-[0_16px_36px_-14px_rgba(18,42,62,0.45)] backdrop-blur transition-all active:scale-90"
      >
        <IconPhone width={19} height={19} />
      </a>
      {wa && (
        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent("Hi Imagine — I'd like to ask about a session.")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp the studio"
          className="flex h-12 w-12 items-center justify-center border border-[#1f9d55]/40 bg-white/95 text-[#1f9d55] shadow-[0_16px_36px_-14px_rgba(18,42,62,0.45)] backdrop-blur transition-all active:scale-90"
        >
          <WaIcon />
        </a>
      )}
      <a
        href="#book"
        className="flex h-12 items-center gap-2 border border-[var(--amber)] bg-[var(--amber)] px-6 font-semibold text-white shadow-[0_16px_36px_-14px_rgba(13,127,194,0.6)] transition-all active:scale-95"
      >
        Book a session <IconArrow width={15} height={15} />
      </a>
    </div>
  );
}
