import { corsHeaders, decryptValue, errorResponse, getSupabaseClient, jsonResponse, maskValue, requireUser } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();
    const user = await requireUser(req);
    const { key, reveal } = await req.json();

    if (!key) {
      return errorResponse("key is required", 400);
    }

    const { data, error } = await supabase
      .from("user_secrets")
      .select("value_encrypted")
      .eq("user_id", user.id)
      .eq("key", String(key))
      .maybeSingle();

    if (error) {
      return errorResponse(error.message, 500);
    }

    if (!data?.value_encrypted) {
      return jsonResponse({ found: false });
    }

    if (reveal) {
      const value = await decryptValue(data.value_encrypted);
      return jsonResponse({ found: true, value });
    }

    const value = await decryptValue(data.value_encrypted);
    return jsonResponse({ found: true, masked: maskValue(value) });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : String(error), 401);
  }
});
