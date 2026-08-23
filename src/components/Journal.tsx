import { useStore } from "../store";
import type { Post } from "../store";
import { fmtLongDate } from "../lib/util";
import { IconAperture, IconArrow } from "./Icons";
import { Reveal, SafeImg, SectionHead } from "./ui";

function TopBar() {
  return (
    <div className="sticky top-0 z-[70] border-b border-[var(--line-soft)] bg-[rgba(255,255,255,0.92)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <a href="#top" className="flex items-center gap-3">
          <IconAperture width={22} height={22} className="text-[var(--amber)]" />
          <span className="font-display text-lg tracking-[0.12em] text-[var(--ink)]">IMAGINE</span>
        </a>
        <a href="#top" className="uline font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)] transition-colors hover:text-[var(--amber)]">
          ← Back to the studio
        </a>
      </div>
    </div>
  );
}

function TagChip({ tag }: { tag: string }) {
  return <span className="chip !border-[var(--amber)]/50 !text-[var(--amber)]">{tag}</span>;
}

/** Markdown-lite renderer: `## ` headings, `> ` pull-quotes, blank-line paragraphs. */
function Body({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        if (t.startsWith("## "))
          return (
            <h2 key={i} className="font-display mt-12 mb-4 text-3xl text-[var(--ink)] md:text-4xl">
              {t.slice(3)}
            </h2>
          );
        if (t.startsWith("> "))
          return (
            <blockquote key={i} className="font-display my-10 border-l-2 border-[var(--amber)] pl-6 text-2xl italic leading-snug text-[var(--ink)] md:text-3xl">
              {t.slice(2)}
            </blockquote>
          );
        return (
          <p key={i} className="my-5 text-[16px] leading-[1.9] text-[var(--muted)]">
            {t}
          </p>
        );
      })}
    </>
  );
}

function PostCard({ p, delay = 0 }: { p: Post; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <a href={`#/journal/${p.slug}`} className="group block border border-[var(--line-soft)] bg-[var(--panel)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--amber)] hover:shadow-[0_26px_50px_-32px_rgba(16,41,62,0.5)]">
        <div className="overflow-hidden">
          {p.cover ? (
            <SafeImg src={p.cover} alt={p.title} className="aspect-[16/10] w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]" loading="lazy" fallbackClassName="aspect-[16/10] w-full" />
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center bg-[linear-gradient(155deg,#e9f4fb,#b3d7f0)]">
              <IconAperture width={34} height={34} className="text-[#2f83bd]" />
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <TagChip tag={p.tag} />
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">{fmtLongDate(p.createdAt)}</span>
          </div>
          <h3 className="font-display mt-3 text-2xl leading-tight text-[var(--ink)] transition-colors group-hover:text-[var(--amber)]">{p.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{p.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--amber)]">
            Read the story <IconArrow width={13} height={13} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </a>
    </Reveal>
  );
}

/* ——————————————————— list page ——————————————————— */
export function JournalListPage() {
  const { posts } = useStore();
  const live = posts.filter((p) => p.published);
  const [featured, ...rest] = live;

  return (
    <div className="min-h-screen pb-24">
      <TopBar />
      <main className="mx-auto max-w-7xl px-5 pt-16 md:px-8 md:pt-20">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4">
            <span className="kicker">The journal</span>
            <span className="h-px flex-1 bg-[var(--line-soft)]" />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--dim)]">{live.length} stor{live.length === 1 ? "y" : "ies"}</span>
          </div>
          <h1 className="font-display mt-6 text-[clamp(3rem,7vw,5.6rem)] leading-[0.95] text-[var(--ink)]">
            Notes from <em className="italic text-[var(--amber)]">the darkroom.</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
            Wedding stories, lighting experiments and the occasional confession — written between sittings by the people behind the lens.
          </p>
        </div>

        {live.length === 0 ? (
          <div className="panel mt-16 p-14 text-center">
            <IconAperture width={36} height={36} className="mx-auto text-[var(--amber)]" />
            <p className="font-display mt-5 text-3xl text-[var(--ink)]">The press is still warming up.</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Stories land here as soon as the ink dries. Meanwhile, the archive upstairs has forty thousand frames to keep you busy.
            </p>
            <a href="#work" className="btn-ghost mt-7">Browse the archive</a>
          </div>
        ) : (
          <>
            {featured && (
              <Reveal className="mt-14">
                <a href={`#/journal/${featured.slug}`} className="group grid overflow-hidden border border-[var(--line-soft)] bg-[var(--panel)] transition-all duration-300 hover:border-[var(--amber)] hover:shadow-[0_36px_70px_-40px_rgba(16,41,62,0.55)] lg:grid-cols-[1.15fr_1fr]">
                  <div className="overflow-hidden">
                    {featured.cover ? (
                      <SafeImg src={featured.cover} alt={featured.title} className="h-full min-h-[260px] w-full object-cover transition-transform duration-[1300ms] ease-out group-hover:scale-[1.05]" loading="eager" fallbackClassName="min-h-[260px] w-full" />
                    ) : (
                      <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-[linear-gradient(155deg,#e9f4fb,#b3d7f0)]">
                        <IconAperture width={44} height={44} className="text-[#2f83bd]" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-8 md:p-12">
                    <div className="flex items-center gap-3">
                      <span className="bg-[var(--amber)] px-2.5 py-1 font-mono text-[9px] tracking-[0.24em] uppercase text-white">Latest</span>
                      <TagChip tag={featured.tag} />
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">{fmtLongDate(featured.createdAt)}</span>
                    </div>
                    <h2 className="font-display mt-5 text-4xl leading-[1.02] text-[var(--ink)] transition-colors group-hover:text-[var(--amber)] md:text-5xl">
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">{featured.excerpt}</p>
                    <span className="mt-7 inline-flex w-fit items-center gap-2 border border-[var(--line)] px-5 py-2.5 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--ink)] transition-all duration-300 group-hover:border-[var(--amber)] group-hover:bg-[var(--amber)] group-hover:text-white">
                      Read the story <IconArrow width={13} height={13} />
                    </span>
                  </div>
                </a>
              </Reveal>
            )}

            {rest.length > 0 && (
              <>
                <div className="mt-20">
                  <SectionHead num="" label="Earlier entries" title={<>More from the bench.</>} />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p, i) => (
                    <PostCard key={p.id} p={p} delay={(i % 3) * 90} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ——————————————————— article page ——————————————————— */
export function JournalPostPage({ slug }: { slug: string }) {
  const { posts } = useStore();
  const post = posts.find((p) => p.slug === slug && p.published);

  if (!post) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="mx-auto flex max-w-2xl flex-col items-center px-5 pt-28 text-center">
          <IconAperture width={38} height={38} className="text-[var(--amber)]" />
          <h1 className="font-display mt-6 text-4xl text-[var(--ink)]">That page didn't develop.</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">The story may have been unpublished or moved. The journal index has everything that's on the wall.</p>
          <a href="#/journal" className="btn-solid mt-8">Back to the journal</a>
        </div>
      </div>
    );
  }

  const related = posts.filter((p) => p.published && p.id !== post.id).slice(0, 2);

  return (
    <div className="min-h-screen pb-24">
      <TopBar />
      <main className="mx-auto max-w-3xl px-5 pt-14 md:pt-20">
        <a href="#/journal" className="uline font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--muted)] transition-colors hover:text-[var(--amber)]">
          ← The journal
        </a>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <TagChip tag={post.tag} />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">{fmtLongDate(post.createdAt)}</span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--dim)]">· {Math.max(1, Math.round(post.body.split(/\s+/).length / 200))} min read</span>
        </div>
        <h1 className="font-display mt-5 text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.0] text-[var(--ink)]">{post.title}</h1>
        {post.excerpt && <p className="mt-5 text-lg italic leading-relaxed text-[var(--muted)]">{post.excerpt}</p>}

        {post.cover && (
          <div className="mt-10 overflow-hidden border border-[var(--line-soft)]">
            <SafeImg src={post.cover} alt={post.title} className="w-full object-cover" loading="eager" fallbackClassName="aspect-[16/9] w-full" />
          </div>
        )}

        <article className="mt-8">
          <Body text={post.body} />
        </article>

        <div className="mt-14 flex items-center gap-4 border-t border-[var(--line-soft)] pt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--amber)]">
            <IconAperture width={20} height={20} className="text-white" />
          </div>
          <div>
            <div className="font-display text-xl text-[var(--ink)]">The Imagine studio</div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--dim)]">Written between sittings · Portland, OR</div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <div className="mb-6 flex items-center gap-4">
              <span className="kicker">Keep reading</span>
              <span className="h-px flex-1 bg-[var(--line-soft)]" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {related.map((p) => (
                <PostCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        )}

        <div className="panel mt-16 flex flex-col items-start justify-between gap-5 p-8 sm:flex-row sm:items-center">
          <div>
            <div className="font-display text-2xl text-[var(--ink)]">Liked the story?</div>
            <p className="mt-1 text-sm text-[var(--muted)]">The best ones start with a booking.</p>
          </div>
          <a href="#book" className="btn-solid">Book a session <IconArrow width={15} height={15} /></a>
        </div>
      </main>
    </div>
  );
}
