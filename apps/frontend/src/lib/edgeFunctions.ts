import { getSupabase } from "./supabase";

export type EdgeFunctionResult = {
  ok: boolean;
  status: number;
  bodyText: string;
  json?: unknown;
};

function getFunctionsBaseUrl() {
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) return null;
  const origin = new URL(supabaseUrl).origin;
  return `${origin}/functions/v1`;
}

export async function callEdgeFunction(functionName: string, body?: unknown): Promise<EdgeFunctionResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, status: 500, bodyText: "Supabase client not initialized." };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    return { ok: false, status: 401, bodyText: sessionError.message };
  }
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    return { ok: false, status: 401, bodyText: "No active session. Please sign in." };
  }

  const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!anonKey) {
    return { ok: false, status: 500, bodyText: "Missing VITE_SUPABASE_ANON_KEY." };
  }

  const baseUrl = getFunctionsBaseUrl();
  if (!baseUrl) {
    return { ok: false, status: 500, bodyText: "Missing VITE_SUPABASE_URL." };
  }

  const response = await fetch(`${baseUrl}/${functionName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });

  const bodyText = await response.text();
  let json: unknown;
  if (bodyText) {
    try {
      json = JSON.parse(bodyText);
    } catch {
      json = undefined;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    bodyText: bodyText || response.statusText,
    ...(json !== undefined ? { json } : {}),
  };
}
