// Supabase Edge Function: Keywords CRUD
// Manages target keywords for websites

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
} from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    // GET - List keywords for a website
    if (req.method === "GET") {
      const url = new URL(req.url);
      const websiteId = url.searchParams.get("website_id");

      if (!websiteId) {
        return corsErrorResponse(req, "website_id is required", 400);
      }

      // Verify user owns this website
      const { data: website, error: websiteError } = await supabase
        .from("websites")
        .select("id")
        .eq("id", websiteId)
        .eq("user_id", user.id)
        .single();

      if (websiteError || !website) {
        return corsErrorResponse(req, "Website not found or access denied", 404);
      }

      const { data: keywords, error } = await supabase
        .from("keywords")
        .select("*")
        .eq("website_id", websiteId)
        .order("created_at", { ascending: false });

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, { keywords });
    }

    // POST - Create new keyword
    if (req.method === "POST") {
      const body = await req.json();
      const { website_id, keyword, location } = body;

      if (!website_id || !keyword) {
        return corsErrorResponse(req, "website_id and keyword are required", 400);
      }

      // Verify user owns this website
      const { data: website, error: websiteError } = await supabase
        .from("websites")
        .select("id")
        .eq("id", website_id)
        .eq("user_id", user.id)
        .single();

      if (websiteError || !website) {
        return corsErrorResponse(req, "Website not found or access denied", 404);
      }

      const { data: newKeyword, error } = await supabase
        .from("keywords")
        .insert({
          website_id,
          keyword: keyword.trim(),
          location: location || "United Kingdom",
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return corsErrorResponse(req, "Keyword already exists for this website", 409);
        }
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, newKeyword, 201);
    }

    // PUT - Update keyword
    if (req.method === "PUT") {
      const body = await req.json();
      const { id, keyword, location, is_active } = body;

      if (!id) {
        return corsErrorResponse(req, "Keyword ID is required", 400);
      }

      // Verify user owns this keyword's website
      const { data: existingKeyword, error: keywordError } = await supabase
        .from("keywords")
        .select("website_id")
        .eq("id", id)
        .single();

      if (keywordError || !existingKeyword) {
        return corsErrorResponse(req, "Keyword not found", 404);
      }

      const { data: website, error: websiteError } = await supabase
        .from("websites")
        .select("id")
        .eq("id", existingKeyword.website_id)
        .eq("user_id", user.id)
        .single();

      if (websiteError || !website) {
        return corsErrorResponse(req, "Access denied", 403);
      }

      const updateData: Record<string, unknown> = {};
      if (keyword !== undefined) updateData.keyword = keyword.trim();
      if (location !== undefined) updateData.location = location;
      if (is_active !== undefined) updateData.is_active = is_active;

      const { data: updatedKeyword, error } = await supabase
        .from("keywords")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, updatedKeyword);
    }

    // DELETE - Delete keyword
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = body;

      if (!id) {
        return corsErrorResponse(req, "Keyword ID is required", 400);
      }

      // Verify user owns this keyword's website
      const { data: existingKeyword, error: keywordError } = await supabase
        .from("keywords")
        .select("website_id")
        .eq("id", id)
        .single();

      if (keywordError || !existingKeyword) {
        return corsErrorResponse(req, "Keyword not found", 404);
      }

      const { data: website, error: websiteError } = await supabase
        .from("websites")
        .select("id")
        .eq("id", existingKeyword.website_id)
        .eq("user_id", user.id)
        .single();

      if (websiteError || !website) {
        return corsErrorResponse(req, "Access denied", 403);
      }

      const { error } = await supabase.from("keywords").delete().eq("id", id);

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, { success: true, deleted_id: id });
    }

    return corsErrorResponse(req, "Method not allowed", 405);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
