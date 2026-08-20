import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { CATEGORIES } from "../data";
import { useStore } from "../store";
import type { GalleryFrame, Review, TeamHue, TeamMember } from "../store";
import { IconCheck, IconTrash, IconX } from "./Icons";

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
const EMPTY_MEMBER = { name: "", role: "", bio: "", gear: "", hue: "sky" as TeamHue, published: true };
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
            <div
              className="flex h-28 w-28 items-center justify-center"
              style={{ background: HUE_BG[form.hue], color: form.hue === "ice" ? "#122a3e" : "#f2f9fe" }}
            >
              <span className="font-display text-5xl italic">{initialsOf(form.name)}</span>
            </div>
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
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center"
              style={{ background: HUE_BG[m.hue], color: m.hue === "ice" ? "#122a3e" : "#f2f9fe" }}
            >
              <span className="font-display text-2xl italic">{initialsOf(m.name)}</span>
            </div>
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
                  setForm({ name: m.name, role: m.role, bio: m.bio, gear: m.gear, hue: m.hue, published: m.published });
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
    if (!form.title.trim() || !/^https?:\/\/.+/.test(form.img.trim())) {
      toast("A title and a valid image URL (https://…) are required.", "err");
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
              <input ref={urlRef} className="input font-mono !text-xs" value={form.img} placeholder="https://…/frame.jpg" onChange={(e) => setForm({ ...form, img: e.target.value })} />
            </Field>
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
            <img src={f.img} alt="" className="h-16 w-16 shrink-0 border border-[var(--line)] object-cover" />
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
