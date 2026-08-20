import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SEED_BOOKINGS } from "./data";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  session: string;
  packageId: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  guests: number;
  notes: string;
  status: BookingStatus;
  createdAt: string; // ISO
}

export type NewBooking = Omit<Booking, "id" | "ref" | "status" | "createdAt">;

export interface ToastMsg {
  id: number;
  msg: string;
  tone: "ok" | "warn";
}

interface Prefill {
  session?: string;
  packageId?: string;
  nonce: number;
}

interface StoreShape {
  bookings: Booking[];
  addBooking: (b: NewBooking) => Booking;
  setStatus: (id: string, s: BookingStatus) => void;
  removeBooking: (id: string) => void;
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  prefill: Prefill | null;
  setPrefill: (p: { session?: string; packageId?: string } | null) => void;
  toasts: ToastMsg[];
  toast: (msg: string, tone?: "ok" | "warn") => void;
}

const LS_BOOKINGS = "obscura_bookings_v1";
const LS_ADMIN = "obscura_admin_v1";

const genRef = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `OBS-${s}`;
};

const genId = () => `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(LS_BOOKINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Booking[];
    }
  } catch {
    /* corrupted storage — reseed */
  }
  return SEED_BOOKINGS;
}

const StoreCtx = createContext<StoreShape | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(loadBookings);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LS_ADMIN) === "1";
    } catch {
      return false;
    }
  });
  const [prefill, setPrefillState] = useState<Prefill | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_BOOKINGS, JSON.stringify(bookings));
    } catch {
      /* storage full/unavailable */
    }
  }, [bookings]);

  const toast = useCallback((msg: string, tone: "ok" | "warn" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const addBooking = useCallback((b: NewBooking): Booking => {
    const booking: Booking = {
      ...b,
      id: genId(),
      ref: genRef(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [booking, ...prev]);
    return booking;
  }, []);

  const setStatus = useCallback((id: string, s: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: s } : b)));
  }, []);

  const removeBooking = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const login = useCallback((user: string, pass: string) => {
    const ok = user.trim().toLowerCase() === "admin" && pass === "obscura24";
    if (ok) {
      setIsAdmin(true);
      try {
        localStorage.setItem(LS_ADMIN, "1");
      } catch {
        /* noop */
      }
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(LS_ADMIN);
    } catch {
      /* noop */
    }
  }, []);

  const setPrefill = useCallback((p: { session?: string; packageId?: string } | null) => {
    setPrefillState(p ? { ...p, nonce: Date.now() } : null);
  }, []);

  return (
    <StoreCtx.Provider
      value={{ bookings, addBooking, setStatus, removeBooking, isAdmin, login, logout, prefill, setPrefill, toasts, toast }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore(): StoreShape {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
