// Supabase Edge Function: Websites CRUD
// Manages website portfolio - create, read, update, delete operations

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
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const websiteId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

    // GET - List all websites or get single website
    if (req.method === "GET") {
      if (websiteId && websiteId !== "websites") {
        // Get single website with latest status and SEO health
        const { data: website, error } = await supabase
          .from("websites")
          .select(`
            *,
            status_checks(is_live, status_code, response_time_ms, checked_at),
            seo_health_checks(health_score, checked_at),
            keywords(id, keyword, location, is_active)
          `)
          .eq("id", websiteId)
          .eq("user_id", user.id)
          .order("checked_at", { foreignTable: "status_checks", ascending: false })
          .order("checked_at", { foreignTable: "seo_health_checks", ascending: false })
          .limit(1, { foreignTable: "status_checks" })
          .limit(1, { foreignTable: "seo_health_checks" })
          .single();

        if (error) {
          return corsErrorResponse(req, "Website not found", 404);
        }
        return corsResponse(req, website);
      }

      // List all websites with summary
      const { data: websites, error } = await supabase
        .from("websites")
        .select(`
          *,
          status_checks(is_live, status_code, response_time_ms, checked_at),
          seo_health_checks(health_score, checked_at)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .order("checked_at", { foreignTable: "status_checks", ascending: false })
        .order("checked_at", { foreignTable: "seo_health_checks", ascending: false })
        .limit(1, { foreignTable: "status_checks" })
        .limit(1, { foreignTable: "seo_health_checks" });

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      // Calculate summary
      const total = websites?.length || 0;
      const live = websites?.filter((w) => w.status_checks?.[0]?.is_live).length || 0;
      const down = total - live;
      const avgSeoScore = websites?.length
        ? Math.round(
            websites.reduce((sum, w) => sum + (w.seo_health_checks?.[0]?.health_score || 0), 0) /
              websites.length
          )
        : 0;

      return corsResponse(req, {
        websites,
        summary: { total, live, down, avgSeoScore },
      });
    }

    // POST - Create new website
    if (req.method === "POST") {
      const body = await req.json();
      const { name, url: websiteUrl, category } = body;

      if (!websiteUrl) {
        return corsErrorResponse(req, "URL is required", 400);
      }

      // Normalize URL
      const normalizedUrl = websiteUrl
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

      const { data: website, error } = await supabase
        .from("websites")
        .insert({
          user_id: user.id,
          name: name || normalizedUrl,
          url: normalizedUrl,
          category: category || "general",
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return corsErrorResponse(req, "Website already exists", 409);
        }
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, website, 201);
    }

    // PUT - Update website
    if (req.method === "PUT") {
      const body = await req.json();
      const { id, name, url: websiteUrl, category, is_active } = body;

      if (!id) {
        return corsErrorResponse(req, "Website ID is required", 400);
      }

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (name !== undefined) updateData.name = name;
      if (websiteUrl !== undefined) {
        updateData.url = websiteUrl.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
      }
      if (category !== undefined) updateData.category = category;
      if (is_active !== undefined) updateData.is_active = is_active;

      const { data: website, error } = await supabase
        .from("websites")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, website);
    }

    // DELETE - Delete website
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = body;

      if (!id) {
        return corsErrorResponse(req, "Website ID is required", 400);
      }

      const { error } = await supabase
        .from("websites")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

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
