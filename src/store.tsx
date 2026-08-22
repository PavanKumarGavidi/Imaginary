import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FAQS, GALLERY, IMG, PACKAGES, QUOTES, SEED_BOOKINGS, SERVICES, STUDIO, TEAM_SEED } from "./data";
import type { Category, Faq, Pkg, Service } from "./data";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

/* ————— types ————— */
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  session: string;
  packageId: string;
  date: string;
  time: string;
  guests: number;
  notes: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  quote: string;
  name: string;
  meta: string;
  published: boolean;
}

export type TeamHue = "sky" | "deep" | "ice" | "steel";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  gear: string;
  hue: TeamHue;
  photo?: string;
  published: boolean;
}

export interface GalleryFrame {
  id: string;
  title: string;
  cat: Category;
  img: string;
  exif: string;
  published: boolean;
}

export type SitePhotoKey = "hero" | "studio" | "login";
export type SitePhotos = Record<SitePhotoKey, string>;

/** Original images shipped with the site — used by "restore default". */
export const DEFAULT_SITE_PHOTOS: SitePhotos = {
  hero: IMG.hero,
  studio: IMG.studio,
  login: IMG.fashion,
};

/* ————— editable site content ————— */
export interface HeroContent {
  eyebrow: string;
  l1: string;
  l2: string;
  l3: string;
  blurb: string;
}
export interface StatItem {
  v: number;
  suffix: string;
  label: string;
}
export interface ProcessItem {
  t: string;
  d: string;
}
export interface AboutContent {
  title: string;
  p1: string;
  p2: string;
  stats: StatItem[];
  process: ProcessItem[];
}
export interface ContactContent {
  address: string;
  city: string;
  phone: string;
  email: string;
  hours: [string, string][];
}
export interface SiteContent {
  hero: HeroContent;
  about: AboutContent;
  contact: ContactContent;
  services: Service[];
  packages: Pkg[];
  faqs: Faq[];
}
export type ContentKey = keyof SiteContent;

/** The copy the site shipped with — the Content tab can restore any section to this. */
export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    eyebrow: "Currently booking · Spring ’26",
    l1: "We write",
    l2: "with *light*",
    l3: "& *shadow*.",
    blurb:
      "Imagine is a full-service photography studio and working darkroom in Portland’s Pearl District — portraits, weddings, editorial and product work, lit slowly and retouched by hand under one roof.",
  },
  about: {
    title: "A darkroom with a day job.",
    p1: "We started Imagine in 2011 with two strobes, a borrowed Rollei and a stubborn belief: that a photograph should feel like the room did — the heat of the tungsten, the dust in the beam, the second before the laugh.",
    p2: "Fourteen years on, the Mercer Lane floor holds three seamless bays, a print press and a working darkroom. The belief hasn’t changed. Neither has the coffee.",
    stats: [
      { v: 14, suffix: "", label: "Years behind the lens" },
      { v: 2400, suffix: "+", label: "Sessions delivered" },
      { v: 38, suffix: "", label: "Awards & press features" },
      { v: 96, suffix: "%", label: "Clients who rebook" },
    ],
    process: [
      { t: "The brief", d: "A 15-minute call or studio coffee. We map mood, wardrobe and the frames that matter." },
      { t: "The shoot", d: "Unhurried, directed sessions — digital and, if you like, 35mm or 120 film on the side." },
      { t: "The darkroom", d: "Every select is colour-graded and retouched by hand. Film is developed and scanned in-house." },
      { t: "The handoff", d: "A private gallery, print-ready files, and archival pigment prints from our own press." },
    ],
  },
  contact: {
    address: STUDIO.addr,
    city: STUDIO.city,
    phone: STUDIO.phone,
    email: STUDIO.email,
    hours: STUDIO.hours,
  },
  services: SERVICES,
  packages: PACKAGES,
  faqs: FAQS,
};

export interface ToastMsg {
  id: number;
  msg: string;
  tone: "ok" | "err";
}

export interface Prefill {
  session?: string;
  packageId?: string;
}

interface Store {
  bookings: Booking[];
  reviews: Review[];
  team: TeamMember[];
  frames: GalleryFrame[];
  isAdmin: boolean;
  cloud: boolean;
  ready: boolean;
  syncError: string | null;
  sitePhotos: SitePhotos;
  content: SiteContent;
  toasts: ToastMsg[];
  prefill: Prefill | null;
  /** Swap one of the site-wide photos (hero / studio / login). */
  setSitePhoto: (key: SitePhotoKey, url: string) => void;
  /** Replace one content section (hero / about / contact / services / packages / faqs). */
  updateContent: <K extends ContentKey>(key: K, value: SiteContent[K]) => void;
  /** Change the signed-in admin's password. Returns an error message, or null on success. */
  changePassword: (current: string, next: string) => Promise<string | null>;
  addBooking: (b: Omit<Booking, "id" | "ref" | "status" | "createdAt">) => Booking;
  setBookingStatus: (id: string, s: BookingStatus) => void;
  removeBooking: (id: string) => void;
  addReview: (r: Omit<Review, "id">) => void;
  updateReview: (id: string, r: Omit<Review, "id">) => void;
  removeReview: (id: string) => void;
  toggleReview: (id: string) => void;
  addMember: (m: Omit<TeamMember, "id">) => void;
  updateMember: (id: string, m: Omit<TeamMember, "id">) => void;
  removeMember: (id: string) => void;
  toggleMember: (id: string) => void;
  addFrame: (f: Omit<GalleryFrame, "id">) => void;
  updateFrame: (id: string, f: Omit<GalleryFrame, "id">) => void;
  removeFrame: (id: string) => void;
  toggleFrame: (id: string) => void;
  /** Returns an error message, or null on success. */
  login: (u: string, p: string) => Promise<string | null>;
  /** True while a password-recovery session is active (reset link was opened). */
  recovery: boolean;
  /** Sends a password-reset email. Returns an error message, or null on success. */
  requestReset: (email: string) => Promise<string | null>;
  /** Sets a new password using the recovery session. Returns an error message, or null on success. */
  setNewPassword: (password: string) => Promise<string | null>;
  logout: () => void;
  toast: (msg: string, tone?: "ok" | "err") => void;
  setPrefill: (p: Prefill | null) => void;
}

const Ctx = createContext<Store | null>(null);

const LS_BOOKINGS = "imagine_bookings_v1";
const LS_ADMIN = "imagine_admin_v1";
const LS_REVIEWS = "imagine_reviews_v1";
const LS_TEAM = "imagine_team_v1";
const LS_FRAMES = "imagine_frames_v1";
const LS_PHOTOS = "imagine_photos_v1";
const LS_CONTENT = "imagine_content_v1";

const cloud = isSupabaseConfigured;

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const makeRef = () => {
  const s = Array.from({ length: 4 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");
  return `IM-${s}`;
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* corrupted storage — fall back */
  }
  return fallback;
}

const seedReviews = (): Review[] => QUOTES.map((q, i) => ({ id: `rev-${i + 1}`, ...q, published: true }));
const seedFrames = (): GalleryFrame[] => GALLERY.map((g) => ({ ...g, published: true }));

/* ————— DB row ⇄ app model mappers ————— */
type BookingRow = Record<string, unknown>;
const bookingToRow = (b: Booking) => ({
  id: b.id,
  ref: b.ref,
  name: b.name,
  email: b.email,
  phone: b.phone,
  session: b.session,
  package_id: b.packageId,
  date: b.date,
  time: b.time,
  guests: b.guests,
  notes: b.notes,
  status: b.status,
  created_at: b.createdAt,
});
const rowToBooking = (r: BookingRow): Booking => ({
  id: String(r.id),
  ref: String(r.ref ?? ""),
  name: String(r.name ?? ""),
  email: String(r.email ?? ""),
  phone: String(r.phone ?? ""),
  session: String(r.session ?? ""),
  packageId: String(r.package_id ?? ""),
  date: String(r.date ?? ""),
  time: String(r.time ?? ""),
  guests: Number(r.guests ?? 1),
  notes: String(r.notes ?? ""),
  status: (r.status as BookingStatus) ?? "pending",
  createdAt: String(r.created_at ?? new Date().toISOString()),
});

const memberToRow = (m: TeamMember) => ({ id: m.id, name: m.name, role: m.role, bio: m.bio, gear: m.gear, hue: m.hue, photo: m.photo ?? "", published: m.published });
const reviewToRow = (r: Review) => ({ id: r.id, quote: r.quote, name: r.name, meta: r.meta, published: r.published });
const frameToRow = (f: GalleryFrame) => ({ id: f.id, title: f.title, cat: f.cat, img: f.img, exif: f.exif, published: f.published });

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => (cloud ? [] : load(LS_BOOKINGS, SEED_BOOKINGS)));
  const [reviews, setReviews] = useState<Review[]>(() => (cloud ? [] : load(LS_REVIEWS, seedReviews())));
  const [team, setTeam] = useState<TeamMember[]>(() => (cloud ? [] : load(LS_TEAM, TEAM_SEED)));
  const [frames, setFrames] = useState<GalleryFrame[]>(() => (cloud ? [] : seedFrames()));
  const [sitePhotos, setSitePhotos] = useState<SitePhotos>(() => ({ ...DEFAULT_SITE_PHOTOS, ...load(LS_PHOTOS, {} as Partial<SitePhotos>) }));
  const [content, setContentState] = useState<SiteContent>(() => ({ ...DEFAULT_SITE_CONTENT, ...load(LS_CONTENT, {} as Partial<SiteContent>) }));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => (cloud ? false : load(LS_ADMIN, false)));
  const [ready, setReady] = useState(!cloud);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const toastId = useRef(0);
  const warnedQuota = useRef(false);

  const toast = useCallback((msg: string, tone: "ok" | "err" = "ok") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  /* ————— hydrate from Supabase (cloud) ————— */
  useEffect(() => {
    if (!cloud || !supabase) return;
    let alive = true;
    (async () => {
      try {
        const [b, r, t, f, ph, cn, sess] = await Promise.all([
          supabase.from("bookings").select("*").order("created_at", { ascending: false }),
          supabase.from("reviews").select("*"),
          supabase.from("team_members").select("*"),
          supabase.from("gallery_frames").select("*"),
          supabase.from("site_photos").select("slot_key,img"),
          supabase.from("site_content").select("key,value"),
          supabase.auth.getSession(),
        ]);
        if (!alive) return;
        if (b.error || r.error || t.error || f.error)
          throw new Error(b.error?.message ?? r.error?.message ?? t.error?.message ?? f.error?.message);
        setBookings((b.data as BookingRow[]).map(rowToBooking));
        setReviews((r.data as Review[]) ?? []);
        setTeam((t.data as TeamMember[]) ?? []);
        setFrames((f.data as GalleryFrame[]) ?? []);
        /* optional tables (photos / content) — tolerated if missing on older projects */
        if (Array.isArray(ph.data) && ph.data.length) {
          setSitePhotos((prev) => {
            const next = { ...prev };
            for (const row of ph.data as { slot_key: string; img: string }[]) {
              if (row.slot_key in next) next[row.slot_key as SitePhotoKey] = row.img;
            }
            return next;
          });
        }
        if (Array.isArray(cn.data)) {
          if (cn.data.length) {
            setContentState((prev) => {
              const next: Record<string, unknown> = { ...prev };
              for (const row of cn.data as { key: string; value: unknown }[]) {
                if (row.key in next) next[row.key] = row.value;
              }
              return next as unknown as SiteContent;
            });
          } else if (sess.data.session) {
            /* first staff visit — seed the cloud with the shipped copy */
            void supabase
              .from("site_content")
              .upsert((Object.keys(DEFAULT_SITE_CONTENT) as ContentKey[]).map((k) => ({ key: k, value: DEFAULT_SITE_CONTENT[k] })))
              .then(() => undefined);
          }
        }
        setIsAdmin(Boolean(sess.data.session));
        setRecovery(Boolean((sess.data.session as { recovery?: boolean } | null)?.recovery));
        setSyncError(null);
      } catch (e) {
        if (!alive) return;
        setSyncError(e instanceof Error ? e.message : "Could not reach the cloud database.");
      } finally {
        if (alive) setReady(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setIsAdmin(Boolean(session));
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  /* ————— local persistence (demo mode only) ————— */
  useEffect(() => {
    if (cloud) return;
    try {
      localStorage.setItem(LS_BOOKINGS, JSON.stringify(bookings));
    } catch {
      if (!warnedQuota.current) {
        warnedQuota.current = true;
        toast("Browser storage is full — changes may not persist after reload.", "err");
      }
    }
  }, [bookings, toast]);
  useEffect(() => {
    if (cloud) return;
    try {
      localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews));
      localStorage.setItem(LS_TEAM, JSON.stringify(team));
      localStorage.setItem(LS_FRAMES, JSON.stringify(frames));
    } catch {
      /* non-fatal in demo mode */
    }
  }, [reviews, team, frames]);
  useEffect(() => {
    if (cloud) return;
    try {
      localStorage.setItem(LS_ADMIN, JSON.stringify(isAdmin));
    } catch {
      /* non-fatal */
    }
  }, [isAdmin]);

  useEffect(() => {
    if (cloud) return;
    try {
      localStorage.setItem(LS_PHOTOS, JSON.stringify(sitePhotos));
    } catch {
      if (!warnedQuota.current) {
        warnedQuota.current = true;
        toast("Browser storage is full — site photo changes may not persist after reload.", "err");
      }
    }
  }, [sitePhotos, toast]);

  useEffect(() => {
    if (cloud) return;
    try {
      localStorage.setItem(LS_CONTENT, JSON.stringify(content));
    } catch {
      if (!warnedQuota.current) {
        warnedQuota.current = true;
        toast("Browser storage is full — content changes may not persist after reload.", "err");
      }
    }
  }, [content, toast]);

  /* ————— cloud write-through helper ————— */
  const remote = useCallback(
    async (op: () => PromiseLike<{ error: { message: string } | null }>) => {
      if (!cloud || !supabase) return;
      try {
        const { error } = await op();
        if (error) throw new Error(error.message);
        setSyncError(null);
      } catch (e) {
        setSyncError(`Cloud sync failed (${e instanceof Error ? e.message : "network"}) — the change is kept on this device only.`);
      }
    },
    []
  );

  /* ————— bookings ————— */
  const addBooking = useCallback(
    (b: Omit<Booking, "id" | "ref" | "status" | "createdAt">) => {
      const booking: Booking = { ...b, id: uid(), ref: makeRef(), status: "pending", createdAt: new Date().toISOString() };
      setBookings((prev) => [booking, ...prev]);
      void remote(() => supabase!.from("bookings").insert(bookingToRow(booking)));
      return booking;
    },
    [remote]
  );

  const setBookingStatus = useCallback(
    (id: string, s: BookingStatus) => {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: s } : b)));
      void remote(() => supabase!.from("bookings").update({ status: s }).eq("id", id));
    },
    [remote]
  );

  const removeBooking = useCallback(
    (id: string) => {
      setBookings((prev) => prev.filter((b) => b.id !== id));
      void remote(() => supabase!.from("bookings").delete().eq("id", id));
    },
    [remote]
  );

  /* ————— reviews ————— */
  const addReview = useCallback(
    (r: Omit<Review, "id">) => {
      const row = { ...r, id: uid() };
      setReviews((p) => [row, ...p]);
      void remote(() => supabase!.from("reviews").insert(reviewToRow(row)));
    },
    [remote]
  );
  const updateReview = useCallback(
    (id: string, r: Omit<Review, "id">) => {
      setReviews((p) => p.map((x) => (x.id === id ? { ...r, id } : x)));
      void remote(() => supabase!.from("reviews").update(reviewToRow({ ...r, id } as Review)).eq("id", id));
    },
    [remote]
  );
  const removeReview = useCallback(
    (id: string) => {
      setReviews((p) => p.filter((x) => x.id !== id));
      void remote(() => supabase!.from("reviews").delete().eq("id", id));
    },
    [remote]
  );
  const toggleReview = useCallback(
    (id: string) => {
      let next = false;
      setReviews((p) =>
        p.map((x) => {
          if (x.id === id) {
            next = !x.published;
            return { ...x, published: next };
          }
          return x;
        })
      );
      void remote(() => supabase!.from("reviews").update({ published: next }).eq("id", id));
    },
    [remote]
  );

  /* ————— team ————— */
  const addMember = useCallback(
    (m: Omit<TeamMember, "id">) => {
      const row = { ...m, id: uid() };
      setTeam((p) => [...p, row]);
      void remote(() => supabase!.from("team_members").insert(memberToRow(row)));
    },
    [remote]
  );
  const updateMember = useCallback(
    (id: string, m: Omit<TeamMember, "id">) => {
      setTeam((p) => p.map((x) => (x.id === id ? { ...m, id } : x)));
      void remote(() => supabase!.from("team_members").update(memberToRow({ ...m, id } as TeamMember)).eq("id", id));
    },
    [remote]
  );
  const removeMember = useCallback(
    (id: string) => {
      setTeam((p) => p.filter((x) => x.id !== id));
      void remote(() => supabase!.from("team_members").delete().eq("id", id));
    },
    [remote]
  );
  const toggleMember = useCallback(
    (id: string) => {
      let next = false;
      setTeam((p) =>
        p.map((x) => {
          if (x.id === id) {
            next = !x.published;
            return { ...x, published: next };
          }
          return x;
        })
      );
      void remote(() => supabase!.from("team_members").update({ published: next }).eq("id", id));
    },
    [remote]
  );

  /* ————— frames ————— */
  const addFrame = useCallback(
    (f: Omit<GalleryFrame, "id">) => {
      const row = { ...f, id: uid() };
      setFrames((p) => [...p, row]);
      void remote(() => supabase!.from("gallery_frames").insert(frameToRow(row)));
    },
    [remote]
  );
  const updateFrame = useCallback(
    (id: string, f: Omit<GalleryFrame, "id">) => {
      setFrames((p) => p.map((x) => (x.id === id ? { ...f, id } : x)));
      void remote(() => supabase!.from("gallery_frames").update(frameToRow({ ...f, id } as GalleryFrame)).eq("id", id));
    },
    [remote]
  );
  const removeFrame = useCallback(
    (id: string) => {
      setFrames((p) => p.filter((x) => x.id !== id));
      void remote(() => supabase!.from("gallery_frames").delete().eq("id", id));
    },
    [remote]
  );
  const toggleFrame = useCallback(
    (id: string) => {
      let next = false;
      setFrames((p) =>
        p.map((x) => {
          if (x.id === id) {
            next = !x.published;
            return { ...x, published: next };
          }
          return x;
        })
      );
      void remote(() => supabase!.from("gallery_frames").update({ published: next }).eq("id", id));
    },
    [remote]
  );

  /* ————— site-wide photos (hero / studio / login backdrop) ————— */
  const setSitePhoto = useCallback(
    (key: SitePhotoKey, img: string) => {
      setSitePhotos((prev) => ({ ...prev, [key]: img }));
      void remote(() => supabase!.from("site_photos").upsert({ slot_key: key, img }));
    },
    [remote]
  );

  /* ————— site content ————— */
  const updateContent = useCallback(
    <K extends ContentKey>(key: K, value: SiteContent[K]) => {
      setContentState((prev) => ({ ...prev, [key]: value }));
      void remote(() => supabase!.from("site_content").upsert({ key, value: JSON.parse(JSON.stringify(value)) }));
    },
    [remote]
  );

  /* ————— auth ————— */
  const login = useCallback(async (u: string, p: string): Promise<string | null> => {
    if (cloud && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: u.trim(), password: p });
      if (error) return error.message === "Invalid login credentials" ? "Invalid email or password." : error.message;
      setIsAdmin(true);
      return null;
    }
    const ok = u.trim().toLowerCase() === "admin" && p === "imagine24";
    if (ok) setIsAdmin(true);
    return ok ? null : "Invalid credentials.";
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    if (cloud && supabase) void supabase.auth.signOut();
  }, []);

  const requestReset = useCallback(async (email: string): Promise<string | null> => {
    if (!cloud || !supabase) return "Password reset is only available in cloud mode.";
    const friendly = (msg: string) =>
      /rate limit/i.test(msg)
        ? "Supabase's free plan only allows a few auth emails per hour. Wait about an hour and try again — or set up custom SMTP in Supabase to remove the limit entirely."
        : msg;
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    let { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    /* If this page's URL isn't on the project's redirect allow-list yet,
       fall back to the Site URL configured in Supabase so the email still goes out. */
    if (error && /redirect/i.test(error.message)) {
      const retry = await supabase.auth.resetPasswordForEmail(email.trim());
      error = retry.error;
    }
    if (error) return friendly(error.message);
    return null;
  }, []);

  const changePassword = useCallback(async (current: string, next: string): Promise<string | null> => {
    if (!cloud || !supabase) return "Password changes are only available in cloud mode.";
    if (next.length < 8) return "Use at least 8 characters.";
    let { error } = await supabase.auth.updateUser({ password: next });
    /* some projects demand re-authentication before a password change — retry after signing in again */
    if (error && /reauth/i.test(error.message)) {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email) return error.message;
      const { error: reErr } = await supabase.auth.signInWithPassword({ email, password: current });
      if (reErr) return "Current password is incorrect.";
      error = (await supabase.auth.updateUser({ password: next })).error;
    }
    if (error) return error.message;
    return null;
  }, []);

  const setNewPassword = useCallback(async (password: string): Promise<string | null> => {
    if (!cloud || !supabase) return "Password reset is only available in cloud mode.";
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return error.message;
    setIsAdmin(true);
    setRecovery(false);
    /* strip the recovery token from the address bar */
    window.history.replaceState(null, "", window.location.pathname);
    return null;
  }, []);

  const value = useMemo(
    () => ({
      bookings,
      reviews,
      team,
      frames,
      isAdmin,
      cloud,
      ready,
      syncError,
      toasts,
      prefill,
      addBooking,
      setBookingStatus,
      removeBooking,
      addReview,
      updateReview,
      removeReview,
      toggleReview,
      addMember,
      updateMember,
      removeMember,
      toggleMember,
      addFrame,
      updateFrame,
      removeFrame,
      toggleFrame,
      sitePhotos,
      setSitePhoto,
      content,
      updateContent,
      login,
      recovery,
      requestReset,
      setNewPassword,
      changePassword,
      logout,
      toast,
      setPrefill,
    }),
    [bookings, reviews, team, frames, isAdmin, ready, syncError, sitePhotos, content, recovery, toasts, prefill, addBooking, setBookingStatus, removeBooking, addReview, updateReview, removeReview, toggleReview, addMember, updateMember, removeMember, toggleMember, addFrame, updateFrame, removeFrame, toggleFrame, setSitePhoto, updateContent, login, requestReset, setNewPassword, changePassword, logout, toast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
