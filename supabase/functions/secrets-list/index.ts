import { errorResponse, getCorsHeaders, jsonResponse, requireUser, resolveError } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 204, headers: getCorsHeaders(req) });
  }

  try {
    const { supabase, user } = await requireUser(req);

    const { data, error } = await supabase
      .from("user_secrets")
      .select("key")
      .eq("user_id", user.id);

    if (error) {
      return errorResponse(req, error.message, 500);
    }

    return jsonResponse(req, { keys: data?.map((row) => row.key) ?? [] });
  } catch (error) {
    const resolved = resolveError(error);
    return errorResponse(req, resolved.message, resolved.status, resolved.details);
  }
});
