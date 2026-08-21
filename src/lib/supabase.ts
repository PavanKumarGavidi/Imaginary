import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase wiring.
 *
 * Create a `.env.local` at the project root with:
 *
 *   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
 *   VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
 *
 * Then run `supabase/schema.sql` in the Supabase SQL editor and create your
 * admin user (Authentication → Users → Add user, email + password).
 *
 * When the env keys are absent the app runs in LOCAL DEMO MODE (in-browser
 * storage, admin / imagine24) so previews work without credentials.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey && /^https?:\/\//.test(url));

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
