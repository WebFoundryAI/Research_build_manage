import { decryptValue, errorResponse, getCorsHeaders, jsonResponse, maskValue, requireUser, resolveError } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 204, headers: getCorsHeaders(req) });
  }

  try {
    const { supabase, user } = await requireUser(req);
    const { key, reveal } = await req.json();

    if (!key) {
      return errorResponse(req, "key is required", 400);
    }

    const { data, error } = await supabase
      .from("user_secrets")
      .select("value_encrypted")
      .eq("user_id", user.id)
      .eq("key", String(key))
      .maybeSingle();

    if (error) {
      return errorResponse(req, error.message, 500);
    }

    if (!data?.value_encrypted) {
      return jsonResponse(req, { found: false });
    }

    if (reveal) {
      const value = await decryptValue(data.value_encrypted);
      return jsonResponse(req, { found: true, value });
    }

    const value = await decryptValue(data.value_encrypted);
    return jsonResponse(req, { found: true, masked: maskValue(value) });
  } catch (error) {
    const resolved = resolveError(error);
    return errorResponse(req, resolved.message, resolved.status, resolved.details);
  }
});
