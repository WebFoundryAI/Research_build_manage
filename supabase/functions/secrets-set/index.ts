import { encryptValue, errorResponse, getCorsHeaders, jsonResponse, requireUser, resolveError } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 204, headers: getCorsHeaders(req) });
  }

  try {
    const { supabase, user } = await requireUser(req);
    const { key, value } = await req.json();

    if (!key || !value) {
      return errorResponse(req, "key and value are required", 400);
    }

    const encrypted = await encryptValue(String(value));
    const { error } = await supabase.from("user_secrets").upsert({
      user_id: user.id,
      key: String(key),
      value_encrypted: encrypted,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return errorResponse(req, error.message, 500);
    }

    return jsonResponse(req, { ok: true });
  } catch (error) {
    const resolved = resolveError(error);
    return errorResponse(req, resolved.message, resolved.status, resolved.details);
  }
});
