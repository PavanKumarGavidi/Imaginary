import { useStore } from "../store";
import type { TeamHue, TeamMember } from "../store";
import { Reveal, SafeImg, SectionHead } from "./ui";
import { IconAperture } from "./Icons";

const HUES: Record<TeamHue, { tile: string; ink: string; tag: string }> = {
  deep: { tile: "linear-gradient(155deg, #0d7fc2 0%, #0b3557 100%)", ink: "#f2f9fe", tag: "rgba(242,249,254,0.55)" },
  sky: { tile: "linear-gradient(155deg, #7ab8e6 0%, #2f83bd 100%)", ink: "#f6fbff", tag: "rgba(246,251,255,0.6)" },
  ice: { tile: "linear-gradient(155deg, #eef7fd 0%, #b3d7f0 100%)", ink: "#122a3e", tag: "rgba(18,42,62,0.55)" },
  steel: { tile: "linear-gradient(155deg, #5e7f9e 0%, #25405a 100%)", ink: "#f2f9fe", tag: "rgba(242,249,254,0.55)" },
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join("");

function Sprockets() {
  return (
    <div
      aria-hidden="true"
      className="h-3.5 opacity-90"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(242,249,254,0.75) 0 18px, transparent 18px 40px)",
        maskImage: "linear-gradient(90deg, transparent 0, black 3%, black 97%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0, black 3%, black 97%, transparent 100%)",
      }}
    />
  );
}

function CrewCard({ m, index }: { m: TeamMember; index: number }) {
  const hue = HUES[m.hue] ?? HUES.deep;
  const hasPhoto = Boolean(m.photo && m.photo.trim());
  const tile = hasPhoto ? "#10293e" : hue.tile;
  const ink = hasPhoto ? "#f2f9fe" : hue.ink;
  const tag = hasPhoto ? "rgba(242,249,254,0.78)" : hue.tag;
  return (
    <div className="w-[240px] shrink-0 snap-center [perspective:1200px] md:w-auto">
      <div className="group relative aspect-[4/5] cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] hover:[transform:rotateY(180deg)]">
        {/* front — the portrait tile */}
        <div
          className="absolute inset-0 flex flex-col justify-between overflow-hidden p-5 [backface-visibility:hidden]"
          style={{ background: tile, color: ink }}
        >
          {hasPhoto && (
            <>
              <SafeImg src={m.photo} alt={m.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,26,41,0.85)_4%,rgba(8,26,41,0.08)_58%)]" />
            </>
          )}
          <div className="relative flex items-start justify-between font-mono text-[9px] tracking-[0.26em]" style={{ color: tag }}>
            <span>CREW {String(index + 1).padStart(2, "0")}</span>
            <IconAperture width={16} height={16} />
          </div>
          {!hasPhoto && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-10 select-none font-display text-[11rem] italic leading-none opacity-[0.13]"
              >
                {initials(m.name)}
              </div>
              <div className="font-display text-7xl italic leading-none">{initials(m.name)}</div>
            </>
          )}
          <div className="relative mt-auto">
            <div className="border-t pt-3" style={{ borderColor: tag }}>
              <div className="font-display text-2xl leading-tight">{m.name}</div>
              <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em]" style={{ color: tag }}>
                {m.role}
              </div>
            </div>
          </div>
          <span className="absolute bottom-2 right-3 font-mono text-[8.5px] tracking-[0.22em]" style={{ color: tag }}>
            HOVER TO FLIP ⟲
          </span>
        </div>

        {/* back — the story */}
        <div className="absolute inset-0 flex flex-col border border-[var(--line)] bg-white p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="font-mono text-[9px] tracking-[0.26em] uppercase text-[var(--dim)]">
            Contact sheet · {m.name.split(" ")[0]}
          </div>
          <p className="mt-4 flex-1 text-[13.5px] leading-relaxed text-[var(--muted)]">{m.bio}</p>
          <div className="border-t border-[var(--line-soft)] pt-3">
            <div className="font-mono text-[9px] tracking-[0.24em] uppercase text-[var(--dim)]">Always in the bag</div>
            <div className="mt-1.5 text-sm font-medium text-[var(--amber)]">{m.gear}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamSection() {
  const { team } = useStore();
  const visible = team.filter((m) => m.published);

  return (
    <section id="team" className="relative border-t border-[var(--line-soft)] bg-[rgba(233,244,251,0.6)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          num="04"
          label="The crew"
          title={<>The hands behind the lens.</>}
          right={
            <span className="hidden font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)] sm:block">
              {visible.length} on the roster
            </span>
          }
        />

        {visible.length === 0 ? (
          <Reveal>
            <p className="panel p-10 text-center text-sm text-[var(--muted)]">The crew roster is being reprinted — check back shortly.</p>
          </Reveal>
        ) : (
          <>
            <Reveal>
              <div className="overflow-hidden border border-[#1d3a52] bg-[#10293e] px-4 py-4 shadow-[0_36px_70px_-38px_rgba(16,41,62,0.6)]">
                <Sprockets />
                <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0">
                  {visible.map((m, i) => (
                    <CrewCard key={m.id} m={m} index={i} />
                  ))}
                </div>
                <div className="mt-4">
                  <Sprockets />
                </div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                  Every delivery passes all four of us — Mara frames it, Jonah loads it, Suki grades it and Theo makes sure
                  it lands on time. <span className="text-[var(--ink)]">Four signatures on every contact sheet.</span>
                </p>
                <a href="#book" className="uline font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--amber)]">
                  Book a crew session
                </a>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}
