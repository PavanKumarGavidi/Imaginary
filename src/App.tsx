import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import { About, Services } from "./components/Sections";
import Gallery from "./components/Gallery";
import { Faq, Pricing, Testimonials } from "./components/Closing";
import BookingSection from "./components/Booking";
import Footer from "./components/Footer";
import { Dashboard, LoginPage } from "./components/Admin";
import { Toasts } from "./components/ui";

type View = "site" | "login" | "admin";

function Shell() {
  const { isAdmin, setPrefill } = useStore();
  const [view, setView] = useState<View>("site");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

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
