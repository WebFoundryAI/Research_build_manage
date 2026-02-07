import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnvDiagnostics, type SupabaseEnvDiagnostics } from "./env";

let client: SupabaseClient | null = null;
let initError: Error | null = null;

export function getSupabaseEnvStatus(): SupabaseEnvDiagnostics {
  return getSupabaseEnvDiagnostics();
}

export function getSupabase(): SupabaseClient | null {
  if (client || initError) return client;

  const diagnostics = getSupabaseEnvDiagnostics();
  const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (diagnostics.status === "error") {
    initError = new Error(diagnostics.errors.join(" "));
    return null;
  }

  try {
    client = createClient((url ?? "").trim(), (anon ?? "").trim());
    return client;
  } catch (e: any) {
    initError = e instanceof Error ? e : new Error(String(e));
    return null;
  }
}

export function getSupabaseInitError(): Error | null {
  return initError;
}
