import { corsErrorResponse, corsOptionsResponse, corsResponse, encryptValue, getSupabaseClient, requireUser } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const supabase = getSupabaseClient();
    const user = await requireUser(req);
    const { key, value } = await req.json();

    if (!key || !value) {
      return corsErrorResponse(req, "key and value are required", 400);
    }

    const encrypted = await encryptValue(String(value));
    const { error } = await supabase.from("user_secrets").upsert({
      user_id: user.id,
      key: String(key),
      value_encrypted: encrypted,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return corsErrorResponse(req, error.message, 500);
    }

    return corsResponse(req, { ok: true });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 401);
  }
});
