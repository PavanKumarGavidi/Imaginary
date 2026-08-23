import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { hasRecoveryInUrl } from "./lib/supabase";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import { About, Services } from "./components/Sections";
import Gallery from "./components/Gallery";
import TeamSection from "./components/Team";
import { Faq, Pricing, Testimonials } from "./components/Closing";
import BookingSection from "./components/Booking";
import Footer from "./components/Footer";
import { Dashboard, LoginPage } from "./components/Admin";
import { JournalListPage, JournalPostPage } from "./components/Journal";
import DeliveryPage from "./components/Delivery";
import { IconAperture } from "./components/Icons";
import { Toasts } from "./components/ui";

type View = "site" | "login" | "admin" | "journal" | "post" | "delivery";

interface Route {
  view: View;
  param: string | null;
}

/** Read the current route back out of the URL hash (survives refresh). */
const routeFromHash = (): Route => {
  if (typeof window === "undefined") return { view: "site", param: null };
  const h = window.location.hash;
  if (h.startsWith("#/desk")) return { view: "admin", param: null };
  if (h.startsWith("#/staff") || h.startsWith("#/login")) return { view: "login", param: null };
  if (h.startsWith("#/journal/")) return { view: "post", param: decodeURIComponent(h.slice("#/journal/".length)) };
  if (h.startsWith("#/journal")) return { view: "journal", param: null };
  if (h.startsWith("#/delivery/")) return { view: "delivery", param: decodeURIComponent(h.slice("#/delivery/".length)) };
  return { view: "site", param: null };
};

const hashFor = (view: View, param: string | null): string => {
  switch (view) {
    case "admin":
      return "#/desk";
    case "login":
      return "#/staff";
    case "journal":
      return "#/journal";
    case "post":
      return `#/journal/${param ?? ""}`;
    case "delivery":
      return `#/delivery/${param ?? ""}`;
    default:
      return "";
  }
};

function BootScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="pulse-dot absolute inset-0 rounded-full border border-[var(--line)]" />
        <IconAperture width={30} height={30} className="spin-slow text-[var(--amber)]" />
      </div>
      <div className="text-center">
        <div className="font-display text-3xl tracking-[0.06em]">IMAGINE</div>
        <div className="font-mono mt-2 text-[10px] tracking-[0.3em] uppercase text-[var(--muted)]">Opening the darkroom…</div>
      </div>
    </div>
  );
}

function Shell() {
  const { isAdmin, setPrefill, ready, recovery, posts, deliveries } = useStore();
  /* start from the URL hash so a refresh (or bookmark) restores the exact view */
  const initial = routeFromHash();
  const [view, setView] = useState<View>(initial.view);
  const [param, setParam] = useState<string | null>(initial.param);

  const navigate = (v: View, p: string | null = null) => {
    setView(v);
    setParam(p);
  };

  /* browser back/forward between views follows the hash too */
  useEffect(() => {
    const onHash = () => {
      const r = routeFromHash();
      setView(r.view);
      setParam(r.param);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  /* a password-reset link should land on the login screen, ready to set a new password */
  useEffect(() => {
    if (hasRecoveryInUrl()) navigate("login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* if Supabase confirms the recovery session a beat later (or the user lands mid-browse), route them to login */
  useEffect(() => {
    if (recovery && view !== "login") navigate("login");
  }, [recovery, view]);

  /* keep the URL hash in step with the view, so a refresh restores it.
     replaceState avoids littering the browser history on every view switch,
     and we never clobber a password-recovery link while it's being consumed. */
  useEffect(() => {
    if (hasRecoveryInUrl()) return;
    const target = hashFor(view, param);
    const { pathname, search } = window.location;
    const next = target ? `${pathname}${search}${target}` : `${pathname}${search}`;
    if (window.location.hash !== target) window.history.replaceState(null, "", next);
  }, [view, param]);

  /* per-view document titles — good for tabs, bookmarks and SEO */
  useEffect(() => {
    const base = "Imagine — Photography Studio & Darkroom";
    if (view === "admin") document.title = "Studio Desk — Imagine";
    else if (view === "login") document.title = "Staff — Imagine";
    else if (view === "journal") document.title = "Journal — Imagine";
    else if (view === "post") document.title = `${posts.find((p) => p.slug === param)?.title ?? "Journal"} — Imagine`;
    else if (view === "delivery") {
      const d = deliveries.find((x) => x.id === param);
      document.title = d ? `${d.title} — Private Gallery` : "Private Gallery — Imagine";
    } else document.title = base;
  }, [view, param, posts, deliveries]);

  const goAdmin = () => navigate(isAdmin ? "admin" : "login");

  /** Prefill the booking form (session / package) and glide to it. */
  const bookWith = (session?: string, packageId?: string) => {
    navigate("site");
    setPrefill({ session, packageId });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  if (!ready) return <BootScreen />;

  return (
    <div className="min-h-screen">
      <div className="grain" aria-hidden="true" />
      <Toasts />

      {view === "site" && (
        <>
          <Nav onAdmin={goAdmin} />
          <main>
            <Hero />
            <About />
            <Services onBookSession={(s) => bookWith(s)} />
            <Gallery />
            <TeamSection />
            <Pricing onChoose={(id) => bookWith(undefined, id)} />
            <Testimonials />
            <Faq />
            <BookingSection />
          </main>
          <Footer onAdmin={goAdmin} />
        </>
      )}

      {view === "login" && <LoginPage onBack={() => navigate("site")} onSuccess={() => navigate("admin")} />}

      {view === "admin" &&
        (isAdmin ? (
          <Dashboard onExit={() => navigate("site")} />
        ) : (
          <LoginPage onBack={() => navigate("site")} onSuccess={() => navigate("admin")} />
        ))}

      {view === "journal" && <JournalListPage />}
      {view === "post" && <JournalPostPage slug={param ?? ""} />}
      {view === "delivery" && <DeliveryPage id={param ?? ""} />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
