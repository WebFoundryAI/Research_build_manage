// Supabase Edge Function: Articles CRUD
// Manages generated articles - list, read, update, delete

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

    // GET - List articles or get single article
    if (req.method === "GET") {
      const url = new URL(req.url);
      const articleId = url.searchParams.get("id");
      const projectId = url.searchParams.get("project_id");
      const status = url.searchParams.get("status");
      const limit = parseInt(url.searchParams.get("limit") || "50");

      if (articleId) {
        // Get single article
        const { data: article, error } = await supabase
          .from("generated_articles")
          .select("*")
          .eq("id", articleId)
          .eq("user_id", user.id)
          .single();

        if (error) {
          return corsErrorResponse(req, "Article not found", 404);
        }
        return corsResponse(req, article);
      }

      // List articles
      let query = supabase
        .from("generated_articles")
        .select("id, title, slug, keyword, status, seo_score, word_count, ai_provider, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (projectId) {
        query = query.eq("project_id", projectId);
      }
      if (status) {
        query = query.eq("status", status);
      }

      const { data: articles, error } = await query;

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      // Get summary
      const { data: allArticles } = await supabase
        .from("generated_articles")
        .select("status, seo_score")
        .eq("user_id", user.id);

      const summary = {
        total: allArticles?.length || 0,
        draft: allArticles?.filter(a => a.status === "draft").length || 0,
        review: allArticles?.filter(a => a.status === "review").length || 0,
        approved: allArticles?.filter(a => a.status === "approved").length || 0,
        published: allArticles?.filter(a => a.status === "published").length || 0,
        avgSeoScore: allArticles?.length
          ? Math.round(allArticles.reduce((sum, a) => sum + (a.seo_score || 0), 0) / allArticles.length)
          : 0,
      };

      return corsResponse(req, { articles, summary });
    }

    // PUT - Update article
    if (req.method === "PUT") {
      const body = await req.json();
      const { id, ...updates } = body;

      if (!id) {
        return corsErrorResponse(req, "Article ID is required", 400);
      }

      // Remove fields that shouldn't be updated directly
      delete updates.user_id;
      delete updates.generated_at;

      const { data: article, error } = await supabase
        .from("generated_articles")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, article);
    }

    // DELETE - Delete article
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = body;

      if (!id) {
        return corsErrorResponse(req, "Article ID is required", 400);
      }

      const { error } = await supabase
        .from("generated_articles")
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
