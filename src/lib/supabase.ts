import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config";

export const isConfigured =
  SUPABASE_URL.startsWith("http") && !SUPABASE_ANON_KEY.startsWith("PASTE_");

// Safe placeholder so the app never crashes before the real values are pasted.
export const supabase: SupabaseClient = createClient(
  isConfigured ? SUPABASE_URL : "https://placeholder.supabase.co",
  isConfigured ? SUPABASE_ANON_KEY : "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  },
);
