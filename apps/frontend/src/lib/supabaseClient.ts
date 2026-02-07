import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const rawAnon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabaseUrl = rawUrl?.trim() ?? "";
const supabaseAnonKey = rawAnon?.trim() ?? "";

if (import.meta.env.DEV) {
  console.info("[supabase] import.meta.env values", {
    VITE_SUPABASE_URL: rawUrl,
    VITE_SUPABASE_ANON_KEY: rawAnon,
  });
}

let initError: Error | null = null;
let supabaseClient: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  initError = new Error("Supabase env vars missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
  if (import.meta.env.DEV) {
    console.error("[supabase] Missing required env vars.", {
      VITE_SUPABASE_URL: supabaseUrl,
      VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
    });
  }
} else {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e: unknown) {
    initError = e instanceof Error ? e : new Error(String(e));
    if (import.meta.env.DEV) {
      console.error("[supabase] Failed to create client.", initError);
    }
  }
}

if (import.meta.env.DEV && initError) {
  throw initError;
}

export { supabaseClient };

export function getSupabaseInitError(): Error | null {
  return initError;
}
