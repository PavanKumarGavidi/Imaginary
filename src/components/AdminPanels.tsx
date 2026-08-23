import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { CATEGORIES } from "../data";
import type { Faq, Pkg, Service } from "../data";
import { DEFAULT_SITE_CONTENT, DEFAULT_SITE_PHOTOS, useStore } from "../store";
import type { AboutContent, ContactContent, Delivery, DeliveryPhoto, GalleryFrame, HeroContent, Post, Review, SitePhotoKey, TeamHue, TeamMember } from "../store";
import { fmtLongDate, hashText, slugify } from "../lib/util";
import { storeImage } from "../lib/images";
import type { PhotoFolder } from "../lib/images";
import { isSupabaseConfigured as supabaseConfigured } from "../lib/supabase";
import { IconCheck, IconTrash, IconX } from "./Icons";
import { SafeImg } from "./ui";

/* ————— shared bits ————— */
function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  on,
  onToggle,
  labelOn = "Live",
  labelOff = "Hidden",
}: {
  on: boolean;
  onToggle: () => void;
  labelOn?: string;
  labelOff?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2"
      role="switch"
      aria-checked={on}
      title={on ? "Visible on the public site" : "Hidden from the public site"}
    >
      <span className={`relative h-5 w-10 shrink-0 rounded-full transition-colors duration-300 ${on ? "bg-[var(--amber)]" : "bg-[var(--line)]"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
      <span className={`font-mono text-[9.5px] tracking-[0.18em] uppercase ${on ? "text-[var(--amber)]" : "text-[var(--dim)]"}`}>
        {on ? labelOn : labelOff}
      </span>
    </button>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [arm, setArm] = useState(false);
  useEffect(() => {
    if (!arm) return;
    const t = window.setTimeout(() => setArm(false), 2600);
    return () => window.clearTimeout(t);
  }, [arm]);
  return (
    <button
      onClick={() => {
        if (arm) {
          onConfirm();
          setArm(false);
        } else setArm(true);
      }}
      className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase transition-all duration-200 ${
        arm
          ? "border-[var(--ember)] bg-[var(--ember)] text-white"
          : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--ember)] hover:text-[var(--ember)]"
      }`}
    >
      <IconTrash width={13} height={13} /> {arm ? "Sure?" : "Delete"}
    </button>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="border border-[var(--line)] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
    >
      Edit
    </button>
  );
}

function Row({ children, dimmed = false }: { children: ReactNode; dimmed?: boolean }) {
  return (
    <div
      className={`panel flex flex-col gap-3 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--line)] md:flex-row md:items-center md:gap-4 ${
        dimmed ? "opacity-55" : ""
      }`}
    >
      {children}
    </div>
  );
}

function PanelShell({
  title,
  count,
  liveCount,
  formOpen,
  onToggleForm,
  formTitle,
  children,
}: {
  title: string;
  count: number;
  liveCount: number;
  formOpen: boolean;
  onToggleForm: () => void;
  formTitle: string;
  children: ReactNode;
}) {
  return (
    <div className="fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-[var(--ink)]">{title}</h2>
          <p className="mt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
            {count} total · <span className="text-[var(--amber)]">{liveCount} live on site</span>
          </p>
        </div>
        <button onClick={onToggleForm} className={formOpen ? "btn-ghost !py-2.5" : "btn-solid !py-2.5"}>
          {formOpen ? (
            <>
              <IconX width={15} height={15} /> Close form
            </>
          ) : (
            <>+ Add {formTitle}</>
          )}
        </button>
      </div>
      {formOpen && <div className="panel pop-in mb-6 p-6">{children}</div>}
    </div>
  );
}

function FormActions({ label, onCancel }: { label: string; onCancel: () => void }) {
  return (
    <>
      <button type="submit" className="btn-solid !py-2.5">
        <IconCheck width={15} height={15} /> {label}
      </button>
      <button type="button" onClick={onCancel} className="btn-ghost !py-2.5">
        Cancel
      </button>
    </>
  );
}

/* Downscale to ≤1100px JPEG so uploads stay small enough for browser storage. */
const shrink = (dataUrl: string) =>
  new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const MAX = 1100;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas unavailable");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch {
        reject();
      }
    };
    img.onerror = () => reject();
    img.src = dataUrl;
  });

export function UploadField({
  value,
  onFile,
  onClear,
  label = "Upload an image",
  folder = "photos",
}: {
  value: string;
  onFile: (url: string) => void;
  onClear: () => void;
  label?: string;
  folder?: PhotoFolder;
}) {
  const { toast } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const warnedLocal = useRef(false);

  const readFile = (file: File | null | undefined) => {
    if (!file) return;
    setErr("");
    setBusy(true);
    storeImage(file, folder)
      .then(({ url, source }) => {
        if (source === "local" && supabaseConfigured && !warnedLocal.current) {
          warnedLocal.current = true;
          toast("Saved in-browser — run the Storage SQL once so uploads live in Supabase.", "err");
        }
        onFile(url);
        setBusy(false);
      })
      .catch((e: Error) => {
        setErr(e.message || "Couldn't process that file — try another.");
        setBusy(false);
      });
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          readFile(e.dataTransfer.files?.[0]);
        }}
        className={`cursor-pointer border border-dashed px-3 py-3 text-center transition-all duration-200 ${
          drag
            ? "border-[var(--amber)] bg-[rgba(13,127,194,0.07)] scale-[1.01]"
            : "border-[var(--line)] hover:border-[var(--amber)] hover:bg-[rgba(13,127,194,0.03)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            readFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {busy ? (
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--amber)]">Developing…</span>
        ) : (
          <>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)]">⇪ {label}</span>
            <span className="mt-1 block font-mono text-[9px] tracking-[0.1em] text-[var(--dim)]">
              click or drag &amp; drop · compressed · {supabaseConfigured ? "saved to Supabase Storage" : "saved in-browser"} · max 6 MB
            </span>
          </>
        )}
      </div>
      {err && <p className="mt-1.5 text-[11px] text-[var(--ember)]">{err}</p>}
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="mt-1.5 font-mono text-[9.5px] tracking-[0.18em] uppercase text-[var(--dim)] underline decoration-dotted underline-offset-4 transition-colors hover:text-[var(--ember)]"
        >
          ✕ Remove image
        </button>
      )}
    </div>
  );
}

/* ——————————————————— REVIEWS ——————————————————— */
const EMPTY_REVIEW = { quote: "", name: "", meta: "", published: true };

export function ReviewsPanel() {
  const { reviews, addReview, updateReview, removeReview, toggleReview, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_REVIEW);

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY_REVIEW);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.quote.trim() || !form.name.trim()) {
      toast("Quote and name are required.", "err");
      return;
    }
    if (editing) {
      updateReview(editing, form);
      toast("Review updated.");
    } else {
      addReview(form);
      toast("Review added to the wall of kind words.");
    }
    close();
  };

  return (
    <>
      <PanelShell
        title="Reviews & testimonials"
        count={reviews.length}
        liveCount={reviews.filter((r) => r.published).length}
        formOpen={open}
        onToggleForm={() => (open ? close() : (setEditing(null), setForm(EMPTY_REVIEW), setOpen(true)))}
        formTitle="review"
      >
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <Field label="Quote">
            <textarea
              className="input resize-none"
              rows={3}
              value={form.quote}
              placeholder="They shot our wedding like a film crew…"
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
            />
          </Field>
          <div className="grid gap-4">
            <Field label="Client name">
              <input className="input" value={form.name} placeholder="Maya Lindqvist" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Session · package">
              <input className="input" value={form.meta} placeholder="Wedding · The Archive" onChange={(e) => setForm({ ...form, meta: e.target.value })} />
            </Field>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Toggle on={form.published} onToggle={() => setForm({ ...form, published: !form.published })} />
              <FormActions label={editing ? "Save changes" : "Publish review"} onCancel={close} />
            </div>
          </div>
        </form>
      </PanelShell>

      <div className="grid gap-3">
        {reviews.length === 0 && <p className="panel p-8 text-center text-sm text-[var(--muted)]">No reviews yet — add the first kind word.</p>}
        {reviews.map((r) => (
          <Row key={r.id} dimmed={!r.published}>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[15px] leading-snug text-[var(--ink)]">“{r.quote}”</p>
              <p className="mt-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">
                {r.name} · {r.meta || "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Toggle on={r.published} onToggle={() => toggleReview(r.id)} />
              <EditButton
                onClick={() => {
                  setEditing(r.id);
                  setForm({ quote: r.quote, name: r.name, meta: r.meta, published: r.published });
                  setOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
              <DeleteButton
                onConfirm={() => {
                  removeReview(r.id);
                  toast("Review removed.", "err");
                }}
              />
            </div>
          </Row>
        ))}
      </div>
    </>
  );
}

/* ——————————————————— TEAM ——————————————————— */
const EMPTY_MEMBER = { name: "", role: "", bio: "", gear: "", hue: "sky" as TeamHue, photo: "", published: true };
const HUE_SWATCHES: { id: TeamHue; bg: string }[] = [
  { id: "deep", bg: "linear-gradient(155deg,#0d7fc2,#0b3557)" },
  { id: "sky", bg: "linear-gradient(155deg,#7ab8e6,#2f83bd)" },
  { id: "ice", bg: "linear-gradient(155deg,#eef7fd,#b3d7f0)" },
  { id: "steel", bg: "linear-gradient(155deg,#5e7f9e,#25405a)" },
];
const HUE_BG: Record<TeamHue, string> = {
  deep: HUE_SWATCHES[0].bg,
  sky: HUE_SWATCHES[1].bg,
  ice: HUE_SWATCHES[2].bg,
  steel: HUE_SWATCHES[3].bg,
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join("") || "??";

export function TeamPanel() {
  const { team, addMember, updateMember, removeMember, toggleMember, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_MEMBER);

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY_MEMBER);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      toast("Name and role are required.", "err");
      return;
    }
    if (editing) {
      updateMember(editing, form);
      toast("Team member updated.");
    } else {
      addMember(form);
      toast(`${form.name} joined the crew.`);
    }
    close();
  };

  return (
    <>
      <PanelShell
        title="Team roster"
        count={team.length}
        liveCount={team.filter((m) => m.published).length}
        formOpen={open}
        onToggleForm={() => (open ? close() : (setEditing(null), setForm(EMPTY_MEMBER), setOpen(true)))}
        formTitle="member"
      >
        <form onSubmit={submit} className="grid gap-5 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-3">
            {form.photo.trim() ? (
              <img src={form.photo.trim()} alt="Member preview" className="h-28 w-28 border border-[var(--line)] object-cover" />
            ) : (
              <div
                className="flex h-28 w-28 items-center justify-center"
                style={{ background: HUE_BG[form.hue], color: form.hue === "ice" ? "#122a3e" : "#f2f9fe" }}
              >
                <span className="font-display text-5xl italic">{initialsOf(form.name)}</span>
              </div>
            )}
            <Field label="Tile tone">
              <div className="flex gap-2">
                {HUE_SWATCHES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setForm({ ...form, hue: h.id })}
                    aria-label={`Tone ${h.id}`}
                    className={`h-8 w-8 border-2 transition-transform hover:scale-110 ${form.hue === h.id ? "border-[var(--ink)]" : "border-transparent"}`}
                    style={{ background: h.bg }}
                  />
                ))}
              </div>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input className="input" value={form.name} placeholder="Mara Ellison" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Role">
              <input className="input" value={form.role} placeholder="Second shooter" onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </Field>
            <Field label="Photo URL (optional — monogram tile used if empty)" className="sm:col-span-2">
              <input
                className="input font-mono !text-xs"
                value={form.photo.startsWith("data:") ? "" : form.photo}
                placeholder={form.photo.startsWith("data:") ? "Uploaded file attached below ✓" : "https://…/portrait.jpg"}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <UploadField
                value={form.photo}
                label="Upload a portrait"
                folder="team"
                onFile={(url) => setForm({ ...form, photo: url })}
                onClear={() => setForm({ ...form, photo: "" })}
              />
            </div>
            <Field label="Short bio" className="sm:col-span-2">
              <textarea className="input resize-none" rows={2} value={form.bio} placeholder="Runs the pit at concerts…" onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </Field>
            <Field label="Always in the bag">
              <input className="input" value={form.gear} placeholder="Nikon FM2 · HP5 Plus" onChange={(e) => setForm({ ...form, gear: e.target.value })} />
            </Field>
            <div className="flex flex-wrap items-center gap-4 pt-6">
              <Toggle on={form.published} onToggle={() => setForm({ ...form, published: !form.published })} labelOn="On site" labelOff="Off site" />
              <FormActions label={editing ? "Save changes" : "Add to crew"} onCancel={close} />
            </div>
          </div>
        </form>
      </PanelShell>

      <div className="grid gap-3">
        {team.length === 0 && <p className="panel p-8 text-center text-sm text-[var(--muted)]">The roster is empty — add the first crew member.</p>}
        {team.map((m) => (
          <Row key={m.id} dimmed={!m.published}>
            {m.photo ? (
              <SafeImg src={m.photo} alt={m.name} className="h-14 w-14 shrink-0 border border-[var(--line)] object-cover" />
            ) : (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center"
                style={{ background: HUE_BG[m.hue], color: m.hue === "ice" ? "#122a3e" : "#f2f9fe" }}
              >
                <span className="font-display text-2xl italic">{initialsOf(m.name)}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-display text-xl text-[var(--ink)]">{m.name}</div>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">{m.role}</div>
              {m.gear && <div className="mt-1 text-xs text-[var(--amber)]">{m.gear}</div>}
            </div>
            <div className="flex items-center gap-3">
              <Toggle on={m.published} onToggle={() => toggleMember(m.id)} labelOn="On site" labelOff="Off site" />
              <EditButton
                onClick={() => {
                  setEditing(m.id);
                  setForm({ name: m.name, role: m.role, bio: m.bio, gear: m.gear, hue: m.hue, photo: m.photo ?? "", published: m.published });
                  setOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
              <DeleteButton
                onConfirm={() => {
                  removeMember(m.id);
                  toast(`${m.name} left the roster.`, "err");
                }}
              />
            </div>
          </Row>
        ))}
      </div>
    </>
  );
}

/* ——————————————————— GALLERY ——————————————————— */
const EMPTY_FRAME = { title: "", cat: "Portrait" as GalleryFrame["cat"], img: "", exif: "", published: true };

export function GalleryPanel() {
  const { frames, addFrame, updateFrame, removeFrame, toggleFrame, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FRAME);
  const urlRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY_FRAME);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const img = form.img.trim();
    const imgOk = /^https?:\/\/.+/.test(img) || img.startsWith("data:image/");
    if (!form.title.trim() || !imgOk) {
      toast("A title and an image (paste a URL or upload a file) are required.", "err");
      urlRef.current?.focus();
      return;
    }
    const clean = { ...form, exif: form.exif.trim() || "— · — · —" };
    if (editing) {
      updateFrame(editing, clean);
      toast("Frame updated.");
    } else {
      addFrame(clean);
      toast(`“${clean.title}” added to the archive.`);
    }
    close();
  };

  return (
    <>
      <PanelShell
        title="Gallery archive"
        count={frames.length}
        liveCount={frames.filter((f) => f.published).length}
        formOpen={open}
        onToggleForm={() => (open ? close() : (setEditing(null), setForm(EMPTY_FRAME), setOpen(true)))}
        formTitle="frame"
      >
        <form onSubmit={submit} className="grid gap-5 md:grid-cols-[170px_1fr]">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-[170px] w-full items-center justify-center overflow-hidden border border-[var(--line)] bg-[var(--bg2)]">
              {form.img ? (
                <img src={form.img} alt="Frame preview" className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")} />
              ) : (
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--dim)]">Preview</span>
              )}
            </div>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">Portrait crops work best</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input className="input" value={form.title} placeholder="Vows at Dunmore" onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Category">
              <select className="input" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value as GalleryFrame["cat"] })}>
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Image URL" className="sm:col-span-2">
              <input
                ref={urlRef}
                className="input font-mono !text-xs"
                value={form.img.startsWith("data:") ? "" : form.img}
                placeholder={form.img.startsWith("data:") ? "Uploaded file attached below ✓" : "https://…/frame.jpg"}
                onChange={(e) => setForm({ ...form, img: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <UploadField
                value={form.img}
                label="Upload a frame"
                folder="gallery"
                onFile={(url) => setForm({ ...form, img: url })}
                onClear={() => setForm({ ...form, img: "" })}
              />
            </div>
            <Field label="EXIF line (optional)">
              <input className="input font-mono !text-xs" value={form.exif} placeholder="85MM · f/1.8 · 1/250 · ISO 200" onChange={(e) => setForm({ ...form, exif: e.target.value })} />
            </Field>
            <div className="flex flex-wrap items-center gap-4 pt-6">
              <Toggle on={form.published} onToggle={() => setForm({ ...form, published: !form.published })} labelOn="In archive" labelOff="Pulled" />
              <FormActions label={editing ? "Save changes" : "Hang the frame"} onCancel={close} />
            </div>
          </div>
        </form>
      </PanelShell>

      <div className="grid gap-3">
        {frames.length === 0 && <p className="panel p-8 text-center text-sm text-[var(--muted)]">The archive walls are bare — hang the first frame.</p>}
        {frames.map((f) => (
          <Row key={f.id} dimmed={!f.published}>
            <SafeImg src={f.img} alt={f.title} className="h-16 w-16 shrink-0 border border-[var(--line)] object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xl text-[var(--ink)]">{f.title}</span>
                <span className="chip">{f.cat}</span>
              </div>
              <div className="mt-1 truncate font-mono text-[10px] tracking-[0.16em] text-[var(--dim)]">{f.exif}</div>
            </div>
            <div className="flex items-center gap-3">
              <Toggle on={f.published} onToggle={() => toggleFrame(f.id)} labelOn="In archive" labelOff="Pulled" />
              <EditButton
                onClick={() => {
                  setEditing(f.id);
                  setForm({ title: f.title, cat: f.cat, img: f.img, exif: f.exif, published: f.published });
                  setOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
              <DeleteButton
                onConfirm={() => {
                  removeFrame(f.id);
                  toast(`“${f.title}” taken down.`, "err");
                }}
              />
            </div>
          </Row>
        ))}
      </div>
    </>
  );
}

/* ——————————————————— SITE PHOTOS ——————————————————— */
const PHOTO_SLOTS: { key: SitePhotoKey; label: string; where: string }[] = [
  { key: "hero", label: "Hero frame", where: "The large photo on the opening screen" },
  { key: "studio", label: "Studio photo", where: "The “About the studio” section photo" },
  { key: "login", label: "Login backdrop", where: "Left panel of the staff sign-in page" },
];

function SlotCard({ slotKey, label, where }: { slotKey: SitePhotoKey; label: string; where: string }) {
  const { sitePhotos, setSitePhoto, toast } = useStore();
  const current = sitePhotos[slotKey];
  const [draft, setDraft] = useState(current);
  const isDefault = current === DEFAULT_SITE_PHOTOS[slotKey];

  /* if the live value changes elsewhere (e.g. restore), keep the draft in step */
  useEffect(() => {
    setDraft(current);
  }, [current]);

  const save = () => {
    if (!draft.trim()) {
      toast("Paste an image URL or upload a file first.", "err");
      return;
    }
    setSitePhoto(slotKey, draft.trim());
    toast(`${label} updated — live on the site now.`);
  };

  return (
    <div className="panel flex flex-col overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden border-b border-[var(--line-soft)] bg-[var(--bg2)]">
        <img
          src={current}
          alt={`${label} preview`}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 border border-white/25 bg-[rgba(18,42,62,0.5)] px-2 py-1 font-mono text-[9px] tracking-[0.22em] uppercase text-white backdrop-blur-sm">
          {label}
        </span>
        {isDefault ? (
          <span className="absolute right-3 top-3 chip !border-white/25 bg-[rgba(18,42,62,0.5)] !text-[var(--photo-ink)] backdrop-blur-sm">Default</span>
        ) : (
          <span className="absolute right-3 top-3 chip !border-white/25 bg-[rgba(13,127,194,0.75)] !text-white backdrop-blur-sm">Custom</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="font-display text-2xl text-[var(--ink)]">{label}</div>
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--dim)]">{where}</div>
        </div>

        <Field label="Image URL">
          <input
            className="input font-mono !text-xs"
            value={draft.startsWith("data:") ? "" : draft}
            placeholder={draft.startsWith("data:") ? "Uploaded file attached below ✓" : "https://…/photo.jpg"}
            onChange={(e) => setDraft(e.target.value)}
          />
        </Field>

        <UploadField value={draft} label="Upload a photo" onFile={(url) => setDraft(url)} onClear={() => setDraft("")} />

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
          <button onClick={save} className="btn-solid !py-2.5">
            <IconCheck width={15} height={15} /> Save
          </button>
          {!isDefault && (
            <button
              onClick={() => {
                setSitePhoto(slotKey, DEFAULT_SITE_PHOTOS[slotKey]);
                toast(`${label} restored to the default photo.`);
              }}
              className="btn-ghost !py-2.5"
            >
              Restore default
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PhotosPanel() {
  const { frames, team } = useStore();
  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="font-display text-3xl text-[var(--ink)]">Site photos</h2>
        <p className="mt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
          The big frames across the public site · team &amp; work photos live in their own tabs ({team.filter((m) => m.published).length} crew · {frames.filter((f) => f.published).length} frames live)
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {PHOTO_SLOTS.map((s) => (
          <SlotCard key={s.key} slotKey={s.key} label={s.label} where={s.where} />
        ))}
      </div>

      <p className="mt-6 border border-[var(--line-soft)] bg-white p-4 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-[var(--dim)]">
        TIP — team member portraits and gallery (work) frames have their own tabs with per-item photo upload. Changes here
        publish instantly to every visitor.
      </p>
    </div>
  );
}

/* ——————————————————— SITE CONTENT ——————————————————— */
const CONTENT_SECTIONS = [
  { id: "hero", label: "Opening" },
  { id: "about", label: "Studio" },
  { id: "services", label: "Services" },
  { id: "packages", label: "Packages" },
  { id: "faqs", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;
type CSec = (typeof CONTENT_SECTIONS)[number]["id"];

const SECTION_TITLES: Record<CSec, string> = {
  hero: "Opening headline",
  about: "The studio story",
  services: "Services list",
  packages: "Packages & pricing",
  faqs: "Questions & answers",
  contact: "Contact & hours",
};

function SaveBar({ onSave, label = "Publish changes", onRestore }: { onSave: () => void; label?: string; onRestore?: () => void }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[var(--line-soft)] pt-4">
      <button type="button" onClick={onSave} className="btn-solid !py-2.5">
        <IconCheck width={15} height={15} /> {label}
      </button>
      {onRestore && (
        <button onClick={onRestore} className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-[var(--dim)] underline-offset-4 transition-colors hover:text-[var(--ember)] hover:underline">
          Restore default
        </button>
      )}
      <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--dim)]">Goes live on the public site instantly</span>
    </div>
  );
}

function HeroForm() {
  const { content, updateContent, toast } = useStore();
  const [d, setD] = useState<HeroContent>({ ...content.hero });
  return (
    <div className="panel p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Eyebrow line (above the headline)">
          <input className="input" value={d.eyebrow} onChange={(e) => setD({ ...d, eyebrow: e.target.value })} />
        </Field>
        <Field label="Headline · line 1">
          <input className="input" value={d.l1} onChange={(e) => setD({ ...d, l1: e.target.value })} />
        </Field>
        <Field label="Headline · line 2">
          <input className="input" value={d.l2} onChange={(e) => setD({ ...d, l2: e.target.value })} />
        </Field>
        <Field label="Headline · line 3">
          <input className="input" value={d.l3} onChange={(e) => setD({ ...d, l3: e.target.value })} />
        </Field>
        <Field label="Intro paragraph" className="md:col-span-2">
          <textarea className="input resize-none" rows={3} value={d.blurb} onChange={(e) => setD({ ...d, blurb: e.target.value })} />
        </Field>
      </div>
      <p className="mt-3 font-mono text-[9.5px] leading-relaxed tracking-[0.12em] text-[var(--dim)]">
        Tip — wrap a word in asterisks to render it in italic amber: <span className="text-[var(--amber)]">with *light*</span>
      </p>
      <SaveBar
        onSave={() => {
          updateContent("hero", d);
          toast("Opening copy published.");
        }}
        onRestore={() => {
          setD({ ...DEFAULT_SITE_CONTENT.hero });
          updateContent("hero", DEFAULT_SITE_CONTENT.hero);
          toast("Opening copy restored to default.");
        }}
      />
    </div>
  );
}

function AboutForm() {
  const { content, updateContent, toast } = useStore();
  const [d, setD] = useState<AboutContent>({ ...content.about, stats: content.about.stats.map((s) => ({ ...s })), process: content.about.process.map((p) => ({ ...p })) });
  return (
    <div className="panel p-6">
      <div className="grid gap-4">
        <Field label="Section title">
          <input className="input" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} />
        </Field>
        <Field label="Paragraph one">
          <textarea className="input resize-none" rows={3} value={d.p1} onChange={(e) => setD({ ...d, p1: e.target.value })} />
        </Field>
        <Field label="Paragraph two">
          <textarea className="input resize-none" rows={2} value={d.p2} onChange={(e) => setD({ ...d, p2: e.target.value })} />
        </Field>
      </div>

      <div className="mt-6">
        <div className="label">Stats (animated counters)</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {d.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[72px_64px_1fr] gap-2">
              <input className="input font-mono !text-xs" value={String(s.v)} onChange={(e) => setD({ ...d, stats: d.stats.map((x, j) => (j === i ? { ...x, v: Number(e.target.value) || 0 } : x)) })} aria-label="Stat value" />
              <input className="input font-mono !text-xs" value={s.suffix} onChange={(e) => setD({ ...d, stats: d.stats.map((x, j) => (j === i ? { ...x, suffix: e.target.value } : x)) })} aria-label="Stat suffix" />
              <input className="input" value={s.label} onChange={(e) => setD({ ...d, stats: d.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} aria-label="Stat label" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="label !mb-0">Process steps</span>
          <button type="button" onClick={() => setD({ ...d, process: [...d.process, { t: "New step", d: "Describe it here." }] })} className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-[var(--amber)] hover:underline">
            + Add step
          </button>
        </div>
        <div className="grid gap-3">
          {d.process.map((p, i) => (
            <div key={i} className="grid gap-2 border border-[var(--line-soft)] p-3 sm:grid-cols-[180px_1fr_auto]">
              <input className="input" value={p.t} onChange={(e) => setD({ ...d, process: d.process.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)) })} aria-label="Step title" />
              <input className="input" value={p.d} onChange={(e) => setD({ ...d, process: d.process.map((x, j) => (j === i ? { ...x, d: e.target.value } : x)) })} aria-label="Step description" />
              <button type="button" onClick={() => setD({ ...d, process: d.process.filter((_, j) => j !== i) })} disabled={d.process.length <= 1} className="self-center text-[var(--dim)] transition-colors hover:text-[var(--ember)] disabled:opacity-30" aria-label="Remove step">
                <IconTrash width={15} height={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <SaveBar
        onSave={() => {
          updateContent("about", d);
          toast("Studio story published.");
        }}
        onRestore={() => {
          setD({ ...DEFAULT_SITE_CONTENT.about, stats: DEFAULT_SITE_CONTENT.about.stats.map((s) => ({ ...s })), process: DEFAULT_SITE_CONTENT.about.process.map((p) => ({ ...p })) });
          updateContent("about", DEFAULT_SITE_CONTENT.about);
          toast("Studio story restored to default.");
        }}
      />
    </div>
  );
}

function ContactForm() {
  const { content, updateContent, toast } = useStore();
  const [d, setD] = useState<ContactContent>({ ...content.contact, hours: content.contact.hours.map((h) => [...h] as [string, string]) });
  return (
    <div className="panel p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Street address">
          <input className="input" value={d.address} onChange={(e) => setD({ ...d, address: e.target.value })} />
        </Field>
        <Field label="City / postcode line">
          <input className="input" value={d.city} onChange={(e) => setD({ ...d, city: e.target.value })} />
        </Field>
        <Field label="Phone">
          <input className="input" value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} />
        </Field>
        <Field label="Email">
          <input className="input" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} />
        </Field>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="label !mb-0">Opening hours</span>
          <button type="button" onClick={() => setD({ ...d, hours: [...d.hours, ["New days", "—"]] })} className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-[var(--amber)] hover:underline">
            + Add row
          </button>
        </div>
        <div className="grid gap-3">
          {d.hours.map((h, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input className="input" value={h[0]} onChange={(e) => setD({ ...d, hours: d.hours.map((x, j) => (j === i ? ([e.target.value, x[1]] as [string, string]) : x)) })} aria-label="Days" />
              <input className="input" value={h[1]} onChange={(e) => setD({ ...d, hours: d.hours.map((x, j) => (j === i ? ([x[0], e.target.value] as [string, string]) : x)) })} aria-label="Hours" />
              <button type="button" onClick={() => setD({ ...d, hours: d.hours.filter((_, j) => j !== i) })} disabled={d.hours.length <= 1} className="self-center text-[var(--dim)] transition-colors hover:text-[var(--ember)] disabled:opacity-30" aria-label="Remove row">
                <IconTrash width={15} height={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <SaveBar
        onSave={() => {
          updateContent("contact", d);
          toast("Contact details published.");
        }}
        onRestore={() => {
          setD({ ...DEFAULT_SITE_CONTENT.contact, hours: DEFAULT_SITE_CONTENT.contact.hours.map((h) => [...h] as [string, string]) });
          updateContent("contact", DEFAULT_SITE_CONTENT.contact);
          toast("Contact details restored to default.");
        }}
      />
    </div>
  );
}

const ICON_OPTIONS: { id: Service["icon"]; label: string }[] = [
  { id: "lens", label: "Lens" },
  { id: "rings", label: "Rings" },
  { id: "prism", label: "Prism" },
  { id: "hanger", label: "Hanger" },
  { id: "sprout", label: "Sprout" },
  { id: "stage", label: "Stage light" },
];
const EMPTY_SERVICE: Service = { id: "", icon: "lens", title: "", desc: "", from: 100, duration: "1 hr", includes: [] };

function ServicesManager() {
  const { content, updateContent, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [f, setF] = useState<Service>(EMPTY_SERVICE);
  const [includesText, setIncludesText] = useState("");

  const close = () => {
    setOpen(false);
    setEditing(null);
    setF(EMPTY_SERVICE);
    setIncludesText("");
  };

  const save = () => {
    if (!f.title.trim()) {
      toast("Give the service a title.", "err");
      return;
    }
    const includes = includesText.split("\n").map((s) => s.trim()).filter(Boolean);
    const clean = { ...f, title: f.title.trim(), includes };
    if (editing) {
      updateContent("services", content.services.map((s) => (s.id === editing ? clean : s)));
      toast("Service updated.");
    } else {
      updateContent("services", [...content.services, { ...clean, id: `svc-${Date.now().toString(36)}` }]);
      toast("Service added — it's already bookable.");
    }
    close();
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">{content.services.length} services · titles feed the booking form too</p>
        <button onClick={() => (open ? close() : (setEditing(null), setF(EMPTY_SERVICE), setIncludesText(""), setOpen(true)))} className={open ? "btn-ghost !py-2.5" : "btn-solid !py-2.5"}>
          {open ? "Close form" : "+ Add service"}
        </button>
      </div>

      {open && (
        <div className="panel pop-in mb-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input className="input" value={f.title} placeholder="Portrait Sessions" onChange={(e) => setF({ ...f, title: e.target.value })} />
            </Field>
            <Field label="Icon">
              <select className="input" value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value as Service["icon"] })}>
                {ICON_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Starting price (USD)">
              <input className="input font-mono !text-xs" type="number" min={0} value={String(f.from)} onChange={(e) => setF({ ...f, from: Number(e.target.value) || 0 })} />
            </Field>
            <Field label="Duration line">
              <input className="input" value={f.duration} placeholder="1–2 hrs" onChange={(e) => setF({ ...f, duration: e.target.value })} />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea className="input resize-none" rows={2} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} />
            </Field>
            <Field label="What's included (one per line)" className="sm:col-span-2">
              <textarea className="input resize-none" rows={3} value={includesText} placeholder={"2 lighting setups\nWardrobe consult"} onChange={(e) => setIncludesText(e.target.value)} />
            </Field>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={save} className="btn-solid !py-2.5"><IconCheck width={15} height={15} /> {editing ? "Save changes" : "Add service"}</button>
            <button onClick={close} className="btn-ghost !py-2.5">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {content.services.map((s) => (
          <Row key={s.id}>
            <div className="min-w-0 flex-1">
              <div className="font-display text-xl text-[var(--ink)]">{s.title}</div>
              <div className="mt-0.5 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--dim)]">
                from ${s.from} · {s.duration} · {s.includes.length} included
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditing(s.id);
                  setF(s);
                  setIncludesText(s.includes.join("\n"));
                  setOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border border-[var(--line)] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
              >
                Edit
              </button>
              <DeleteButton
                onConfirm={() => {
                  updateContent("services", content.services.filter((x) => x.id !== s.id));
                  toast(`“${s.title}” removed.`, "err");
                }}
              />
            </div>
          </Row>
        ))}
      </div>
    </>
  );
}

const EMPTY_PKG: Pkg = { id: "", name: "", tagline: "", price: 100, hours: "1 hour", features: [] };

function PackagesManager() {
  const { content, updateContent, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [f, setF] = useState<Pkg>(EMPTY_PKG);
  const [featuresText, setFeaturesText] = useState("");

  const close = () => {
    setOpen(false);
    setEditing(null);
    setF(EMPTY_PKG);
    setFeaturesText("");
  };

  const save = () => {
    if (!f.name.trim()) {
      toast("Give the package a name.", "err");
      return;
    }
    const features = featuresText.split("\n").map((s) => s.trim()).filter(Boolean);
    const clean = { ...f, name: f.name.trim(), features };
    const newId = editing ?? `pkg-${Date.now().toString(36)}`;
    let next = editing ? content.packages.map((p) => (p.id === editing ? { ...clean, id: p.id } : p)) : [...content.packages, { ...clean, id: newId }];
    if (clean.featured) next = next.map((p) => ({ ...p, featured: p.id === newId }));
    updateContent("packages", next);
    toast(editing ? "Package updated." : "Package added — it's bookable immediately.");
    close();
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">{content.packages.length} packages · prices drive the booking estimate</p>
        <button onClick={() => (open ? close() : (setEditing(null), setF(EMPTY_PKG), setFeaturesText(""), setOpen(true)))} className={open ? "btn-ghost !py-2.5" : "btn-solid !py-2.5"}>
          {open ? "Close form" : "+ Add package"}
        </button>
      </div>

      {open && (
        <div className="panel pop-in mb-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input className="input" value={f.name} placeholder="The Contact Sheet" onChange={(e) => setF({ ...f, name: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <input className="input" value={f.tagline} placeholder="The session most clients book." onChange={(e) => setF({ ...f, tagline: e.target.value })} />
            </Field>
            <Field label="Price (USD)">
              <input className="input font-mono !text-xs" type="number" min={0} value={String(f.price)} onChange={(e) => setF({ ...f, price: Number(e.target.value) || 0 })} />
            </Field>
            <Field label="Hours line">
              <input className="input" value={f.hours} placeholder="3 hours · studio + location" onChange={(e) => setF({ ...f, hours: e.target.value })} />
            </Field>
            <Field label="Stripe Payment Link (optional — clients pay the 30% deposit up front)" className="sm:col-span-2">
              <input className="input font-mono !text-xs" value={f.stripeLink ?? ""} placeholder="https://buy.stripe.com/…" onChange={(e) => setF({ ...f, stripeLink: e.target.value.trim() || undefined })} />
            </Field>
            <Field label="Features (one per line)" className="sm:col-span-2">
              <textarea className="input resize-none" rows={4} value={featuresText} placeholder={"Up to 3 outfits\n60 retouched frames"} onChange={(e) => setFeaturesText(e.target.value)} />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Toggle on={Boolean(f.featured)} onToggle={() => setF({ ...f, featured: !f.featured })} labelOn="Featured" labelOff="Standard" />
            <button onClick={save} className="btn-solid !py-2.5"><IconCheck width={15} height={15} /> {editing ? "Save changes" : "Add package"}</button>
            <button onClick={close} className="btn-ghost !py-2.5">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {content.packages.map((p) => (
          <Row key={p.id}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xl text-[var(--ink)]">{p.name}</span>
                {p.featured && <span className="chip !border-[var(--amber)] !text-[var(--amber)]">Featured</span>}
                {p.stripeLink && <span className="chip !border-[var(--sage)]/60 !text-[var(--sage)]">Stripe linked</span>}
              </div>
              <div className="mt-0.5 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--dim)]">
                ${p.price} · {p.hours} · {p.features.length} features
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditing(p.id);
                  setF(p);
                  setFeaturesText(p.features.join("\n"));
                  setOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border border-[var(--line)] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
              >
                Edit
              </button>
              <DeleteButton
                onConfirm={() => {
                  updateContent("packages", content.packages.filter((x) => x.id !== p.id));
                  toast(`“${p.name}” removed.`, "err");
                }}
              />
            </div>
          </Row>
        ))}
      </div>
    </>
  );
}

function FaqManager() {
  const { content, updateContent, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [f, setF] = useState<Faq>({ q: "", a: "" });

  const close = () => {
    setOpen(false);
    setEditing(null);
    setF({ q: "", a: "" });
  };

  const save = () => {
    if (!f.q.trim() || !f.a.trim()) {
      toast("Both question and answer are required.", "err");
      return;
    }
    const clean = { q: f.q.trim(), a: f.a.trim() };
    if (editing) {
      updateContent("faqs", content.faqs.map((x) => (x.id === editing ? { ...x, ...clean } : x)));
      toast("Answer updated.");
    } else {
      updateContent("faqs", [...content.faqs, { ...clean, id: `faq-${Date.now().toString(36)}` }]);
      toast("Question published.");
    }
    close();
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">{content.faqs.length} questions on the wall</p>
        <button onClick={() => (open ? close() : (setEditing(null), setF({ q: "", a: "" }), setOpen(true)))} className={open ? "btn-ghost !py-2.5" : "btn-solid !py-2.5"}>
          {open ? "Close form" : "+ Add question"}
        </button>
      </div>

      {open && (
        <div className="panel pop-in mb-5 p-6">
          <Field label="Question">
            <input className="input" value={f.q} placeholder="How do deposits work?" onChange={(e) => setF({ ...f, q: e.target.value })} />
          </Field>
          <div className="mt-4">
            <Field label="Answer">
              <textarea className="input resize-none" rows={3} value={f.a} onChange={(e) => setF({ ...f, a: e.target.value })} />
            </Field>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={save} className="btn-solid !py-2.5"><IconCheck width={15} height={15} /> {editing ? "Save changes" : "Publish"}</button>
            <button onClick={close} className="btn-ghost !py-2.5">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {content.faqs.length === 0 && <p className="panel p-8 text-center text-sm text-[var(--muted)]">No questions yet — add the first one.</p>}
        {content.faqs.map((q, qi) => (
          <Row key={q.id ?? `faq-${qi}`}>
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg text-[var(--ink)]">{q.q}</div>
              <div className="mt-0.5 line-clamp-1 text-xs text-[var(--muted)]">{q.a}</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditing(q.id ?? null);
                  setF({ q: q.q, a: q.a });
                  setOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border border-[var(--line)] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
              >
                Edit
              </button>
              <DeleteButton
                onConfirm={() => {
                  updateContent("faqs", content.faqs.filter((x) => x.id !== q.id));
                  toast("Question removed.", "err");
                }}
              />
            </div>
          </Row>
        ))}
      </div>
    </>
  );
}

export function ContentPanel() {
  const { updateContent, toast } = useStore();
  const [sec, setSec] = useState<CSec>("hero");
  return (
    <div className="fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-[var(--ink)]">Website content</h2>
          <p className="mt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">
            Editing <span className="text-[var(--amber)]">{SECTION_TITLES[sec]}</span> · publishes to every visitor instantly
          </p>
        </div>
        <button
          onClick={() => {
            (Object.keys(DEFAULT_SITE_CONTENT) as (keyof typeof DEFAULT_SITE_CONTENT)[]).forEach((k) => updateContent(k, DEFAULT_SITE_CONTENT[k]));
            toast("All content restored to the shipped copy.");
          }}
          className="btn-ghost !py-2.5"
        >
          Restore everything
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CONTENT_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSec(s.id)}
            className={`border px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-300 ${
              sec === s.id ? "border-[var(--amber)] bg-[var(--amber)] text-white" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {sec === "hero" && <HeroForm />}
      {sec === "about" && <AboutForm />}
      {sec === "services" && <ServicesManager />}
      {sec === "packages" && <PackagesManager />}
      {sec === "faqs" && <FaqManager />}
      {sec === "contact" && <ContactForm />}
    </div>
  );
}

/* ——————————————————— CLIENT DELIVERIES ——————————————————— */
const deliveryLink = (id: string) => `${window.location.origin}${window.location.pathname}#/delivery/${id}`;

export function DeliveriesPanel() {
  const { deliveries, addDelivery, updateDelivery, removeDelivery, toggleDelivery, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Delivery | null>(null);
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [password, setPassword] = useState("");
  const [downloads, setDownloads] = useState(true);
  const [photos, setPhotos] = useState<DeliveryPhoto[]>([]);

  const close = () => {
    setOpen(false);
    setEditing(null);
    setTitle("");
    setClientName("");
    setClientEmail("");
    setPassword("");
    setDownloads(true);
    setPhotos([]);
  };

  const startEdit = (d: Delivery) => {
    setEditing(d);
    setTitle(d.title);
    setClientName(d.clientName);
    setClientEmail(d.clientEmail);
    setPassword("");
    setDownloads(d.downloads);
    setPhotos(d.photos.map((p) => ({ ...p })));
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async () => {
    if (!title.trim() || !clientName.trim()) {
      toast("Title and client name are required.", "err");
      return;
    }
    if (!editing && password.length < 4) {
      toast("Set a gallery key (at least 4 characters).", "err");
      return;
    }
    if (photos.length === 0) {
      toast("Add at least one frame before delivering.", "err");
      return;
    }
    const passHash = password ? await hashText(password) : editing?.passHash ?? "";
    const payload = {
      title: title.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      passHash,
      photos,
      downloads,
      published: editing?.published ?? true,
    };
    if (editing) {
      updateDelivery(editing.id, payload);
      toast("Gallery updated.");
    } else {
      addDelivery(payload);
      toast(`“${payload.title}” delivered — copy its private link below.`);
    }
    close();
  };

  return (
    <>
      <PanelShell
        title="Client delivery galleries"
        count={deliveries.length}
        liveCount={deliveries.filter((d) => d.published).length}
        formOpen={open}
        onToggleForm={() => (open ? close() : (setEditing(null), setOpen(true)))}
        formTitle="gallery"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gallery title">
            <input className="input" value={title} placeholder="Lindqvist Wedding — Dunmore Hall" onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Client name">
            <input className="input" value={clientName} placeholder="Maya Lindqvist" onChange={(e) => setClientName(e.target.value)} />
          </Field>
          <Field label="Client email (shown as contact on the page)">
            <input className="input" value={clientEmail} placeholder="maya@…" onChange={(e) => setClientEmail(e.target.value)} />
          </Field>
          <Field label={editing ? "Gallery key (leave blank to keep current)" : "Gallery key (min 4 chars)"}>
            <input className="input font-mono !text-xs" value={password} placeholder="sunflower-42" onChange={(e) => setPassword(e.target.value)} />
          </Field>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <Toggle on={downloads} onToggle={() => setDownloads(!downloads)} labelOn="Downloads on" labelOff="View only" />
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--dim)]">Lets the client save full-size frames</span>
        </div>

        <div className="mt-6">
          <div className="label">Frames ({photos.length})</div>
          {photos.length > 0 && (
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((p, i) => (
                <div key={i} className="flex items-center gap-3 border border-[var(--line-soft)] p-2.5">
                  <img src={p.url} alt="" className="h-14 w-14 shrink-0 border border-[var(--line)] object-cover" />
                  <input className="input !py-1.5 text-xs" value={p.caption} placeholder="Caption (optional)" onChange={(e) => setPhotos(photos.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} />
                  <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="shrink-0 text-[var(--dim)] transition-colors hover:text-[var(--ember)]" aria-label="Remove frame">
                    <IconTrash width={15} height={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <UploadField value="" label="Add frames to the delivery" folder="deliveries" onFile={(url) => setPhotos((p) => [...p, { url, caption: "" }])} onClear={() => undefined} />
        </div>

        <div className="mt-5 flex gap-3 border-t border-[var(--line-soft)] pt-4">
          <button type="button" onClick={() => void save()} className="btn-solid !py-2.5">
            <IconCheck width={15} height={15} /> {editing ? "Save changes" : "Create gallery"}
          </button>
          <button type="button" onClick={close} className="btn-ghost !py-2.5">Cancel</button>
        </div>
      </PanelShell>

      <div className="mt-6 grid gap-3">
        {deliveries.length === 0 && (
          <p className="panel p-8 text-center text-sm text-[var(--muted)]">
            No deliveries yet. When a job is completed, build its private gallery here and send the client the link + key.
          </p>
        )}
        {deliveries.map((d) => (
          <Row key={d.id} dimmed={!d.published}>
            {d.photos[0] ? (
              <img src={d.photos[0].url} alt="" className="h-16 w-16 shrink-0 border border-[var(--line)] object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--bg2)] text-[var(--dim)]">—</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-display text-xl text-[var(--ink)]">{d.title}</div>
              <div className="mt-0.5 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--dim)]">
                {d.clientName} · {d.photos.length} frames · {fmtLongDate(d.createdAt)}
                {d.downloads ? " · downloads on" : " · view only"}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  void navigator.clipboard?.writeText(deliveryLink(d.id)).then(
                    () => toast("Private link copied — send it with the gallery key."),
                    () => toast(deliveryLink(d.id))
                  );
                }}
                className="border border-[var(--amber)] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-[var(--amber)] transition-colors hover:bg-[var(--amber)] hover:text-white"
              >
                Copy link
              </button>
              <Toggle on={d.published} onToggle={() => toggleDelivery(d.id)} labelOn="Live" labelOff="Hidden" />
              <button
                onClick={() => startEdit(d)}
                className="border border-[var(--line)] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
              >
                Edit
              </button>
              <DeleteButton onConfirm={() => { removeDelivery(d.id); toast(`“${d.title}” taken down.`, "err"); }} />
            </div>
          </Row>
        ))}
      </div>
    </>
  );
}

/* ——————————————————— JOURNAL ——————————————————— */
const EMPTY_POST = { title: "", tag: "Behind the scenes", excerpt: "", cover: "", body: "" };
const POST_TAGS = ["Behind the scenes", "Weddings", "Tips & posing", "Film & darkroom", "Studio news"];

export function JournalPanel() {
  const { posts, addPost, updatePost, removePost, togglePost, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [f, setF] = useState(EMPTY_POST);
  const [published, setPublished] = useState(true);

  const close = () => {
    setOpen(false);
    setEditing(null);
    setF(EMPTY_POST);
    setPublished(true);
  };

  const startEdit = (p: Post) => {
    setEditing(p);
    setF({ title: p.title, tag: p.tag, excerpt: p.excerpt, cover: p.cover, body: p.body });
    setPublished(p.published);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = () => {
    if (!f.title.trim()) {
      toast("Give the story a headline.", "err");
      return;
    }
    if (!f.body.trim()) {
      toast("The body needs at least a paragraph.", "err");
      return;
    }
    let slug = slugify(f.title);
    if (posts.some((p) => p.slug === slug && p.id !== editing?.id)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const payload = { ...f, title: f.title.trim(), slug, published };
    if (editing) {
      updatePost(editing.id, payload);
      toast("Story updated.");
    } else {
      addPost(payload);
      toast("Story published to the journal.");
    }
    close();
  };

  return (
    <>
      <PanelShell
        title="Journal & stories"
        count={posts.length}
        liveCount={posts.filter((p) => p.published).length}
        formOpen={open}
        onToggleForm={() => (open ? close() : (setEditing(null), setOpen(true)))}
        formTitle="story"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Headline">
            <input className="input" value={f.title} placeholder="Hello, daylight — rewiring the north window" onChange={(e) => setF({ ...f, title: e.target.value })} />
          </Field>
          <Field label="Tag">
            <select className="input" value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })}>
              {POST_TAGS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Excerpt (shows on cards & search results)" className="sm:col-span-2">
            <textarea className="input resize-none" rows={2} value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
          <div>
            <div className="label">Cover</div>
            {f.cover && <img src={f.cover} alt="" className="mb-3 h-28 w-full border border-[var(--line)] object-cover" />}
            <UploadField value={f.cover} label="Upload cover" folder="journal" onFile={(url) => setF({ ...f, cover: url })} onClear={() => setF({ ...f, cover: "" })} />
          </div>
          <Field label="Body — start a line with “## ” for a heading, “> ” for a pull-quote, blank line = new paragraph">
            <textarea className="input resize-y font-mono !text-xs leading-relaxed" rows={10} value={f.body} placeholder={"## The problem with pretty light\n\nFor nine years our portrait bay ran on tungsten…\n\n> Light is not something you add to a person."} onChange={(e) => setF({ ...f, body: e.target.value })} />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[var(--line-soft)] pt-4">
          <Toggle on={published} onToggle={() => setPublished(!published)} labelOn="Publish" labelOff="Draft" />
          <button type="button" onClick={save} className="btn-solid !py-2.5">
            <IconCheck width={15} height={15} /> {editing ? "Save changes" : "Publish story"}
          </button>
          <button type="button" onClick={close} className="btn-ghost !py-2.5">Cancel</button>
        </div>
      </PanelShell>

      <div className="mt-6 grid gap-3">
        {posts.length === 0 && (
          <p className="panel p-8 text-center text-sm text-[var(--muted)]">
            The press is cold — write the first story. Wedding recaps and lighting experiments perform best.
          </p>
        )}
        {posts.map((p) => (
          <Row key={p.id} dimmed={!p.published}>
            {p.cover ? (
              <img src={p.cover} alt="" className="h-16 w-20 shrink-0 border border-[var(--line)] object-cover" />
            ) : (
              <div className="flex h-16 w-20 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--bg2)] text-[var(--dim)]">—</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xl text-[var(--ink)]">{p.title}</span>
                <span className="chip">{p.tag}</span>
              </div>
              <div className="mt-0.5 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--dim)]">
                /{p.slug} · {fmtLongDate(p.createdAt)}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a href={`#/journal/${p.slug}`} className="border border-[var(--line)] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]">
                View
              </a>
              <Toggle on={p.published} onToggle={() => togglePost(p.id)} labelOn="Live" labelOff="Draft" />
              <button
                onClick={() => startEdit(p)}
                className="border border-[var(--line)] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
              >
                Edit
              </button>
              <DeleteButton onConfirm={() => { removePost(p.id); toast(`“${p.title}” unpublished & removed.`, "err"); }} />
            </div>
          </Row>
        ))}
      </div>
    </>
  );
}
