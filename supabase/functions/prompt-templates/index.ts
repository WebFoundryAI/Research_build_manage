// Supabase Edge Function: Prompt Templates CRUD
// Manages AI prompt templates

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

    // GET - List prompt templates
    if (req.method === "GET") {
      const url = new URL(req.url);
      const category = url.searchParams.get("category");
      const includeSystem = url.searchParams.get("include_system") !== "false";

      let query = supabase
        .from("prompt_templates")
        .select("*")
        .order("is_system", { ascending: false })
        .order("name", { ascending: true });

      // Filter to show system templates, public templates, and user's own
      if (includeSystem) {
        query = query.or(`is_system.eq.true,is_public.eq.true,user_id.eq.${user.id}`);
      } else {
        query = query.eq("user_id", user.id);
      }

      if (category) {
        query = query.eq("category", category);
      }

      const { data: templates, error } = await query;

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      // Group by category
      const categories = [...new Set(templates?.map(t => t.category) || [])];

      return corsResponse(req, { templates, categories });
    }

    // POST - Create new template
    if (req.method === "POST") {
      const body = await req.json();
      const { name, description, category, prompt_text, variables } = body;

      if (!name || !prompt_text) {
        return corsErrorResponse(req, "name and prompt_text are required", 400);
      }

      const { data: template, error } = await supabase
        .from("prompt_templates")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description || null,
          category: category || "general",
          prompt_text,
          variables: variables || [],
          is_system: false,
          is_public: false,
        })
        .select()
        .single();

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, template, 201);
    }

    // PUT - Update template
    if (req.method === "PUT") {
      const body = await req.json();
      const { id, ...updates } = body;

      if (!id) {
        return corsErrorResponse(req, "Template ID is required", 400);
      }

      // Can't update system templates
      const { data: existing } = await supabase
        .from("prompt_templates")
        .select("is_system, user_id")
        .eq("id", id)
        .single();

      if (existing?.is_system || existing?.user_id !== user.id) {
        return corsErrorResponse(req, "Cannot modify this template", 403);
      }

      // Remove protected fields
      delete updates.user_id;
      delete updates.is_system;

      const { data: template, error } = await supabase
        .from("prompt_templates")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, template);
    }

    // DELETE - Delete template
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = body;

      if (!id) {
        return corsErrorResponse(req, "Template ID is required", 400);
      }

      // Can't delete system templates
      const { data: existing } = await supabase
        .from("prompt_templates")
        .select("is_system")
        .eq("id", id)
        .single();

      if (existing?.is_system) {
        return corsErrorResponse(req, "Cannot delete system templates", 403);
      }

      const { error } = await supabase
        .from("prompt_templates")
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
