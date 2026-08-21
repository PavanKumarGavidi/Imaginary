import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { GALLERY, QUOTES, SEED_BOOKINGS, TEAM_SEED } from "./data";
import type { Category } from "./data";

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
  toasts: ToastMsg[];
  prefill: Prefill | null;
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
  login: (u: string, p: string) => boolean;
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => load(LS_BOOKINGS, SEED_BOOKINGS));
  const [reviews, setReviews] = useState<Review[]>(() => load(LS_REVIEWS, seedReviews()));
  const [team, setTeam] = useState<TeamMember[]>(() => load(LS_TEAM, TEAM_SEED));
  const [frames, setFrames] = useState<GalleryFrame[]>(() => load(LS_FRAMES, seedFrames()));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => load(LS_ADMIN, false));
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const toastId = useRef(0);
  const quotaWarned = useRef(false);

  useEffect(() => {
    const save = (key: string, value: unknown) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        if (!quotaWarned.current) {
          quotaWarned.current = true;
          setToasts((t) => [
            ...t,
            { id: ++toastId.current, msg: "Browser storage is full — uploaded images may not survive a reload. Try smaller files.", tone: "err" },
          ]);
        }
      }
    };
    save(LS_BOOKINGS, bookings);
  }, [bookings]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews));
    } catch {
      /* non-image data is tiny; ignore */
    }
  }, [reviews]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_TEAM, JSON.stringify(team));
    } catch {
      /* quota — keep in-memory state */
    }
  }, [team]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_FRAMES, JSON.stringify(frames));
    } catch {
      /* quota — keep in-memory state */
    }
  }, [frames]);
  useEffect(() => {
    localStorage.setItem(LS_ADMIN, JSON.stringify(isAdmin));
  }, [isAdmin]);

  const toast = useCallback((msg: string, tone: "ok" | "err" = "ok") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const addBooking = useCallback((b: Omit<Booking, "id" | "ref" | "status" | "createdAt">) => {
    const booking: Booking = { ...b, id: uid(), ref: makeRef(), status: "pending", createdAt: new Date().toISOString() };
    setBookings((prev) => [booking, ...prev]);
    return booking;
  }, []);

  const setBookingStatus = useCallback((id: string, s: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: s } : b)));
  }, []);

  const removeBooking = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addReview = useCallback((r: Omit<Review, "id">) => setReviews((p) => [{ ...r, id: uid() }, ...p]), []);
  const updateReview = useCallback((id: string, r: Omit<Review, "id">) => {
    setReviews((p) => p.map((x) => (x.id === id ? { ...r, id } : x)));
  }, []);
  const removeReview = useCallback((id: string) => setReviews((p) => p.filter((x) => x.id !== id)), []);
  const toggleReview = useCallback(
    (id: string) => setReviews((p) => p.map((x) => (x.id === id ? { ...x, published: !x.published } : x))),
    []
  );

  const addMember = useCallback((m: Omit<TeamMember, "id">) => setTeam((p) => [...p, { ...m, id: uid() }]), []);
  const updateMember = useCallback((id: string, m: Omit<TeamMember, "id">) => {
    setTeam((p) => p.map((x) => (x.id === id ? { ...m, id } : x)));
  }, []);
  const removeMember = useCallback((id: string) => setTeam((p) => p.filter((x) => x.id !== id)), []);
  const toggleMember = useCallback(
    (id: string) => setTeam((p) => p.map((x) => (x.id === id ? { ...x, published: !x.published } : x))),
    []
  );

  const addFrame = useCallback((f: Omit<GalleryFrame, "id">) => setFrames((p) => [...p, { ...f, id: uid() }]), []);
  const updateFrame = useCallback((id: string, f: Omit<GalleryFrame, "id">) => {
    setFrames((p) => p.map((x) => (x.id === id ? { ...f, id } : x)));
  }, []);
  const removeFrame = useCallback((id: string) => setFrames((p) => p.filter((x) => x.id !== id)), []);
  const toggleFrame = useCallback(
    (id: string) => setFrames((p) => p.map((x) => (x.id === id ? { ...x, published: !x.published } : x))),
    []
  );

  const login = useCallback((u: string, p: string) => {
    const ok = u.trim().toLowerCase() === "admin" && p === "imagine24";
    if (ok) setIsAdmin(true);
    return ok;
  }, []);

  const logout = useCallback(() => setIsAdmin(false), []);

  const value = useMemo(
    () => ({
      bookings,
      reviews,
      team,
      frames,
      isAdmin,
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
      login,
      logout,
      toast,
      setPrefill,
    }),
    [bookings, reviews, team, frames, isAdmin, toasts, prefill, addBooking, setBookingStatus, removeBooking, addReview, updateReview, removeReview, toggleReview, addMember, updateMember, removeMember, toggleMember, addFrame, updateFrame, removeFrame, toggleFrame, login, logout, toast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
