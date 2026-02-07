import { corsErrorResponse, corsOptionsResponse, corsResponse, getSupabaseClient, requireUser } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const supabase = getSupabaseClient();
    const user = await requireUser(req);

    const { data, error } = await supabase
      .from("user_secrets")
      .select("key")
      .eq("user_id", user.id);

    if (error) {
      return corsErrorResponse(req, error.message, 500);
    }

    return corsResponse(req, { keys: data?.map((row) => row.key) ?? [], count: data?.length ?? 0 });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 401);
  }
});
