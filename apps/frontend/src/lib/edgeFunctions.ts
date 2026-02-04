import { getSupabase } from "./supabase";

type EdgeFunctionError = {
  message: string;
  status?: number;
  body?: string;
};

type EdgeFunctionResult<T> = {
  data: T | null;
  error: EdgeFunctionError | null;
  status: number;
  bodyText: string;
};

function getFunctionsBaseUrl() {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  if (!url) return null;
  return `${url.replace(/\/$/, "")}/functions/v1`;
}

function parseJsonSafely(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function invokeEdgeFunction<T>(name: string, body: unknown): Promise<EdgeFunctionResult<T>> {
  const supabase = getSupabase();
  const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  const baseUrl = getFunctionsBaseUrl();

  if (!supabase || !anonKey || !baseUrl) {
    return {
      data: null,
      error: { message: "Supabase env vars missing." },
      status: 0,
      bodyText: "",
    };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    return {
      data: null,
      error: { message: sessionError.message, status: 401 },
      status: 401,
      bodyText: "",
    };
  }

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    return {
      data: null,
      error: { message: "No active session.", status: 401 },
      status: 401,
      bodyText: "",
    };
  }

  try {
    const response = await fetch(`${baseUrl}/${name}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
    });

    const bodyText = await response.text();
    const parsed = parseJsonSafely(bodyText);

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: parsed?.error ? String(parsed.error) : response.statusText,
          status: response.status,
          body: bodyText,
        },
        status: response.status,
        bodyText,
      };
    }

    return {
      data: (parsed ?? null) as T | null,
      error: null,
      status: response.status,
      bodyText,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : String(error),
        status: 0,
      },
      status: 0,
      bodyText: "",
    };
  }
}
