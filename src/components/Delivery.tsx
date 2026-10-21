import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useStore } from "../store";
import { hashText, downloadImage, fmtLongDate } from "../lib/util";
import { IconAperture, IconArrow, IconDownload, IconX } from "./Icons";
import { SafeImg } from "./ui";

function Sprockets() {
  return (
    <div
      aria-hidden="true"
      className="h-3.5 opacity-80"
      style={{
        backgroundImage: "repeating-linear-gradient(90deg, rgba(242,249,254,0.7) 0 18px, transparent 18px 40px)",
        maskImage: "linear-gradient(90deg, transparent 0, black 3%, black 97%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0, black 3%, black 97%, transparent 100%)",
      }}
    />
  );
}

/** Public, password-gated client gallery — reached at #/delivery/<id>. */
export default function DeliveryPage({ id }: { id: string }) {
  const { deliveries, toast } = useStore();
  const delivery = deliveries.find((d) => d.id === id && d.published);

  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(`imagine_dlv_${id}`) === "1");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  const unlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!delivery || busy) return;
    setBusy(true);
    const h = await hashText(pass);
    setBusy(false);
    if (h === delivery.passHash) {
      sessionStorage.setItem(`imagine_dlv_${id}`, "1");
      setUnlocked(true);
      setError("");
    } else {
      setError("That key doesn't open this gallery.");
      setShakeKey((k) => k + 1);
    }
  };

  /* ——— not found / unpublished ——— */
  if (!delivery) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-5 text-center">
        <IconAperture width={40} height={40} className="text-[var(--amber)]" />
        <div>
          <h1 className="font-display text-4xl text-[var(--ink)]">This gallery isn't on the wall.</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            The link may be mistyped, or the studio hasn't published it yet. Drop us a line and we'll reshare it within the hour.
          </p>
        </div>
        <a href="#top" className="btn-ghost">
          Back to the studio <IconArrow width={15} height={15} />
        </a>
      </div>
    );
  }

  /* ——— password gate ——— */
  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-16">
        <div key={shakeKey} className={`w-full max-w-md border border-[var(--line)] bg-[var(--panel)] p-8 shadow-[0_36px_70px_-40px_rgba(16,41,62,0.5)] md:p-10 ${error ? "shake" : "pop-in"}`}>
          <div className="flex items-center gap-3">
            <IconAperture width={24} height={24} className="text-[var(--amber)]" />
            <span className="font-display text-xl tracking-[0.1em]">IMAGINE</span>
          </div>
          <div className="mt-7 font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--amber)]">Private gallery</div>
          <h1 className="font-display mt-2 text-4xl leading-tight text-[var(--ink)]">{delivery.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {delivery.photos.length} frames for <span className="text-[var(--ink)]">{delivery.clientName}</span>. Enter the key the studio sent you.
          </p>
          <form onSubmit={unlock} className="mt-7">
            <label className="label" htmlFor="dlv-pass">Gallery key</label>
            <input
              id="dlv-pass"
              type="password"
              className={`input font-mono tracking-[0.2em] ${error ? "err" : ""}`}
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              autoFocus
            />
            {error && <p className="mt-2 text-xs text-[var(--ember)]">{error}</p>}
            <button type="submit" disabled={busy || !pass} className="btn-solid mt-5 w-full justify-center disabled:cursor-wait disabled:opacity-60">
              {busy ? "Developing…" : "Unlock the frames"}
            </button>
          </form>
          <a href="#top" className="mt-5 block text-center font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)] transition-colors hover:text-[var(--amber)]">
            ← Back to the studio
          </a>
        </div>
      </div>
    );
  }

  /* ——— the gallery ——— */
  return (
    <div className="min-h-screen pb-24">
      <div className="bg-[#10293e] px-5 py-4 md:px-8">
        <Sprockets />
      </div>

      <header className="border-b border-[var(--line-soft)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 py-12 md:px-8">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--amber)]">Private gallery · {delivery.photos.length} frames</div>
            <h1 className="font-display mt-3 text-5xl leading-[0.98] text-[var(--ink)] md:text-6xl">{delivery.title}</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              For {delivery.clientName} · delivered {fmtLongDate(delivery.createdAt)}
            </p>
          </div>
          <a href="#top" className="btn-ghost !py-2.5">
            Back to the studio <IconArrow width={14} height={14} />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pt-10 md:px-8">
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {delivery.photos.map((p, i) => (
            <figure key={i} className="group relative mb-5 break-inside-avoid overflow-hidden border border-[var(--line-soft)] bg-[var(--panel)]">
              <button onClick={() => setZoom(i)} className="block w-full text-left">
                <SafeImg src={p.url} alt={p.caption || `${delivery.title} — frame ${i + 1}`} className="w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]" loading="lazy" fallbackClassName="aspect-[4/5] w-full" />
                <span className="absolute left-3 top-3 border border-white/25 bg-[rgba(18,42,62,0.45)] px-2 py-1 font-mono text-[10px] tracking-[0.22em] text-white/90 backdrop-blur-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
              {(p.caption || delivery.downloads) && (
                <figcaption className="flex items-center justify-between gap-3 border-t border-[var(--line-soft)] px-4 py-3">
                  <span className="truncate text-xs italic text-[var(--muted)]">{p.caption || "—"}</span>
                  {delivery.downloads && (
                    <button
                      onClick={() => {
                        void downloadImage(p.url, `imagine-${delivery.id}-${String(i + 1).padStart(2, "0")}.jpg`);
                        toast("Download started — enjoy the print.");
                      }}
                      className="flex shrink-0 items-center gap-1.5 font-mono text-[9.5px] tracking-[0.18em] uppercase text-[var(--amber)] transition-colors hover:text-[var(--ink)]"
                    >
                      <IconDownload width={13} height={13} /> Save
                    </button>
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div className="mt-12 border-t border-[var(--line-soft)] pt-8 text-center">
          <p className="font-display text-2xl italic text-[var(--ink)]">Thank you for sitting with us.</p>
          <p className="mt-2 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)]">
            Prints &amp; albums available at the desk · {delivery.clientEmail ? `we're one reply away at ${delivery.clientEmail}` : "reply to your confirmation email"}
          </p>
        </div>
      </main>

      {/* lightbox */}
      {zoom !== null && delivery.photos[zoom] && (
        <div className="fade-in fixed inset-0 z-[88] flex flex-col items-center justify-center bg-[rgba(16,32,46,0.97)] p-5" onClick={() => setZoom(null)}>
          <button className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center border border-white/25 text-white/90 transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]" aria-label="Close">
            <IconX />
          </button>
          <img
            src={delivery.photos[zoom].url}
            alt={delivery.photos[zoom].caption || ""}
            className="pop-in max-h-[82vh] max-w-full border border-white/15 object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {delivery.photos[zoom].caption && <p className="mt-4 text-sm italic text-white/70">{delivery.photos[zoom].caption}</p>}
          <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoom((z) => (z === null ? z : (z - 1 + delivery.photos.length) % delivery.photos.length))} className="border border-white/25 px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase text-white/80 hover:border-[var(--amber)]">
              ← Prev
            </button>
            <button onClick={() => setZoom((z) => (z === null ? z : (z + 1) % delivery.photos.length))} className="border border-white/25 px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase text-white/80 hover:border-[var(--amber)]">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
