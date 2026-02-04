import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://research-build-manage.pages.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = allowedOrigins.has(origin)
    ? origin
    : "https://research-build-manage.pages.dev";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

const encoder = new TextEncoder();

function requireEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function jsonResponse(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...getCorsHeaders(req) },
  });
}

export function errorResponse(req: Request, message: string, status = 400, details?: unknown) {
  const payload = details ? { error: message, details } : { error: message };
  return jsonResponse(req, payload, status);
}

class RequestError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function getSupabaseClient(req: Request) {
  const url = requireEnv("SUPABASE_URL");
  const anonKey = requireEnv("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization") ?? "";
  const apiKey = req.headers.get("apikey") ?? anonKey;

  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: authHeader,
        apikey: apiKey,
      },
    },
  });
}

export async function requireUser(req: Request) {
  const supabase = getSupabaseClient(req);
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new RequestError("Missing Authorization header", 401);
  }
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new RequestError("Unauthorized", 401, error?.message ?? "Invalid user token");
  }
  return { supabase, user: data.user };
}

export function resolveError(err: unknown) {
  if (err instanceof RequestError) {
    return { message: err.message, status: err.status, details: err.details };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { message, status: 500 };
}

async function getAesKey() {
  const secret = requireEnv("SUPABASE_FUNCTIONS_SECRET");
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(encoded: string) {
  return Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
}

export async function encryptValue(value: string) {
  const key = await getAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(value));
  return `${toBase64(iv)}.${toBase64(new Uint8Array(cipher))}`;
}

export async function decryptValue(payload: string) {
  const [ivPart, cipherPart] = payload.split(".");
  if (!ivPart || !cipherPart) {
    throw new Error("Invalid encrypted payload");
  }
  const key = await getAesKey();
  const iv = fromBase64(ivPart);
  const cipher = fromBase64(cipherPart);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new TextDecoder().decode(plain);
}

export function maskValue(value: string) {
  if (!value) return "••••";
  const last = value.slice(-4);
  return `••••${last}`;
}
