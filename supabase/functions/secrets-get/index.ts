import { corsErrorResponse, corsOptionsResponse, corsResponse, decryptValue, getSupabaseClient, maskValue, requireUser } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const supabase = getSupabaseClient();
    const user = await requireUser(req);
    const { key, reveal } = await req.json();

    if (!key) {
      return corsErrorResponse(req, "key is required", 400);
    }

    const { data, error } = await supabase
      .from("user_secrets")
      .select("value_encrypted")
      .eq("user_id", user.id)
      .eq("key", String(key))
      .maybeSingle();

    if (error) {
      return corsErrorResponse(req, error.message, 500);
    }

    if (!data?.value_encrypted) {
      return corsResponse(req, { found: false });
    }

    if (reveal) {
      const value = await decryptValue(data.value_encrypted);
      return corsResponse(req, { found: true, value });
    }

    const value = await decryptValue(data.value_encrypted);
    return corsResponse(req, { found: true, masked: maskValue(value) });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 401);
  }
});
