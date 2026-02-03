import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let initError: Error | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client || initError) return client;

  const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anon) {
    initError = new Error("Supabase env vars missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
    return null;
  }

  try {
    client = createClient(url, anon);
    return client;
  } catch (e: any) {
    initError = e instanceof Error ? e : new Error(String(e));
    return null;
  }
}

export function getSupabaseInitError(): Error | null {
  return initError;
}
