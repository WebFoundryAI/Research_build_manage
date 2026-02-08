import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://research-build-manage.pages.dev",
  "http://localhost:5173",
]);

const encoder = new TextEncoder();

function requireEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message, status }, status);
}

export function getSupabaseClient() {
  const url = requireEnv("SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function requireUser(req: Request) {
  const supabase = getSupabaseClient();
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) {
    throw new Error("Missing Bearer token");
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error(error?.message ?? "Invalid user token");
  }
  return data.user;
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

export type SecretMetadata = {
  present: boolean;
  length: number;
  last4: string;
  status: "present" | "missing";
};

export function buildSecretMetadata(value: string | null): SecretMetadata {
  const present = Boolean(value);
  const last4 = value ? value.slice(-4) : "";
  return {
    present,
    length: value?.length ?? 0,
    last4,
    status: present ? "present" : "missing",
  };
}

export async function getSecretValue(userId: string, key: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("user_secrets")
    .select("value_encrypted")
    .eq("user_id", userId)
    .eq("key", String(key))
    .maybeSingle();

  if (error || !data?.value_encrypted) {
    return null;
  }

  return decryptValue(data.value_encrypted);
}

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-rbm-source",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

export function withCors(req: Request, response: Response) {
  const headers = new Headers(response.headers);
  const corsHeaders = getCorsHeaders(req);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

export function corsResponse(req: Request, data: unknown, status = 200) {
  return withCors(req, jsonResponse(data, status));
}

export function corsErrorResponse(req: Request, message: string, status = 400) {
  return corsResponse(req, { error: message, status }, status);
}

export function corsOptionsResponse(req: Request) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req) });
}
