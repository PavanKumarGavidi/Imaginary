import { useStore } from "../store";
import { IconAperture, IconInstagram, IconKey, IconMail, IconPhone, IconPin } from "./Icons";

export default function Footer({ onAdmin }: { onAdmin: () => void }) {
  const { content } = useStore();
  const c = content.contact;
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-[var(--line-soft)] bg-[rgba(232,243,250,0.85)]">
      <div className="mx-auto max-w-7xl px-5 pt-20 md:px-8">
        {/* giant wordmark */}
        <div aria-hidden="true" className="select-none text-center">
          <span className="stroke-word font-display block text-[16vw] leading-[0.9] tracking-[0.05em] uppercase transition-colors duration-700 hover:text-[rgba(13,127,194,0.12)]">
            IMAGINE
          </span>
        </div>

        <div className="mt-14 grid gap-12 border-t border-[var(--line-soft)] pt-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <IconAperture width={22} height={22} className="text-[var(--amber)]" />
              <span className="font-display text-lg tracking-[0.12em]">IMAGINE</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
              Photography studio &amp; working darkroom. Portraits, weddings, editorial and product — lit slowly since 2011.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { label: "Instagram", icon: IconInstagram },
                { label: "Email", icon: IconMail },
                { label: "Phone", icon: IconPhone },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.label === "Instagram" ? "#top" : s.label === "Email" ? `mailto:${c.email}` : `tel:${c.phone.replace(/[^0-9]/g, "")}`}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center border border-[var(--line)] text-[var(--muted)] transition-all hover:-translate-y-1 hover:border-[var(--amber)] hover:text-[var(--amber)]"
                >
                  <s.icon width={16} height={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="kicker">Visit</h4>
            <div className="mt-5 space-y-2 text-sm text-[var(--muted)]">
              <p className="flex items-start gap-2.5">
                <IconPin width={15} height={15} className="mt-0.5 shrink-0 text-[var(--amber)]" />
                <span>{c.address}<br />{c.city}</span>
              </p>
            </div>
            <div className="mt-5">
              {c.hours.map(([d, h]: [string, string]) => (
                <div key={d} className="flex justify-between gap-6 py-1 font-mono text-[11px] tracking-[0.12em] text-[var(--dim)]">
                  <span className="uppercase">{d}</span>
                  <span className="text-[var(--muted)]">{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="kicker">Talk</h4>
            <div className="mt-5 space-y-3 text-sm">
              <a href={`tel:${c.phone.replace(/[^0-9]/g, "")}`} className="flex items-center gap-2.5 text-[var(--muted)] transition-colors hover:text-[var(--amber)]">
                <IconPhone width={15} height={15} className="text-[var(--amber)]" /> {c.phone}
              </a>
              <a href={`mailto:${c.email}`} className="flex items-center gap-2.5 text-[var(--muted)] transition-colors hover:text-[var(--amber)]">
                <IconMail width={15} height={15} className="text-[var(--amber)]" /> {c.email}
              </a>
              <p className="pt-2 text-xs leading-relaxed text-[var(--dim)]">
                The desk answers within the hour on shoot days. Urgent wedding-day calls go straight to Mara’s mobile.
              </p>
            </div>
          </div>

          <div>
            <h4 className="kicker">Navigate</h4>
            <nav className="mt-5 grid gap-2.5 text-sm">
              {[
                ["The archive", "#work"],
                ["Services", "#services"],
                ["Packages", "#packages"],
                ["The studio", "#studio"],
                ["The journal", "#/journal"],
                ["FAQ", "#faq"],
                ["Book a session", "#book"],
              ].map(([label, href]) => (
                <a key={href} href={href} className="uline w-fit text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
                  {label}
                </a>
              ))}
            </nav>
            <button
              onClick={onAdmin}
              className="mt-6 flex items-center gap-2 border border-[var(--line)] px-4 py-2.5 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)] transition-all hover:border-[var(--amber)] hover:text-[var(--amber)]"
            >
              <IconKey width={13} height={13} /> Staff entrance
            </button>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[var(--line-soft)] py-6 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)] sm:flex-row sm:items-center">
          <span>© 2026 Obscura Studio — All frames reserved</span>
          <span>Made under tungsten light · Portland, OR</span>
        </div>
      </div>
    </footer>
  );
}
