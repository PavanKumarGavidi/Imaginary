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
import { IconAperture } from "./components/Icons";
import { Toasts } from "./components/ui";

type View = "site" | "login" | "admin";

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
  const { isAdmin, setPrefill, ready, recovery } = useStore();
  const [view, setView] = useState<View>("site");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  /* a password-reset link should land on the login screen, ready to set a new password */
  useEffect(() => {
    if (hasRecoveryInUrl()) setView("login");
  }, []);

  /* if Supabase confirms the recovery session a beat later (or the user lands mid-browse), route them to login */
  useEffect(() => {
    if (recovery && view !== "login") setView("login");
  }, [recovery, view]);

  const goAdmin = () => setView(isAdmin ? "admin" : "login");

  /** Prefill the booking form (session / package) and glide to it. */
  const bookWith = (session?: string, packageId?: string) => {
    setView("site");
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

      {view === "login" && <LoginPage onBack={() => setView("site")} onSuccess={() => setView("admin")} />}

      {view === "admin" &&
        (isAdmin ? (
          <Dashboard onExit={() => setView("site")} />
        ) : (
          <LoginPage onBack={() => setView("site")} onSuccess={() => setView("admin")} />
        ))}
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
