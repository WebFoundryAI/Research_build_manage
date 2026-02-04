import { corsHeaders, errorResponse, getSupabaseClient, jsonResponse, requireUser } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();
    const user = await requireUser(req);

    const { data, error } = await supabase
      .from("user_secrets")
      .select("key")
      .eq("user_id", user.id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return jsonResponse({ keys: data?.map((row) => row.key) ?? [] });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : String(error), 401);
  }
});
