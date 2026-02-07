// Supabase Edge Function: Projects CRUD
// Manages website projects portfolio - create, read, update, delete, archive

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
} from "../_shared/secrets.ts";

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  totalMonthlyVisitors: number;
  totalMonthlyLeads: number;
  totalMonthlyRevenue: number;
  totalEstimatedValue: number;
  openTasks: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    // GET - List all projects or get single project
    if (req.method === "GET") {
      const url = new URL(req.url);
      const projectId = url.searchParams.get("id");
      const includeDeleted = url.searchParams.get("include_deleted") === "true";

      if (projectId) {
        // Get single project with related data
        const { data: project, error } = await supabase
          .from("website_projects")
          .select(`
            *,
            project_tasks(id, title, status, category, due_date),
            project_health_snapshots(
              lighthouse_performance, lighthouse_seo,
              lighthouse_accessibility, lighthouse_best_practices,
              snapshot_date
            ),
            monthly_kpis(year, month, visitors, leads, revenue)
          `)
          .eq("id", projectId)
          .eq("user_id", user.id)
          .order("snapshot_date", { foreignTable: "project_health_snapshots", ascending: false })
          .limit(1, { foreignTable: "project_health_snapshots" })
          .order("year", { foreignTable: "monthly_kpis", ascending: false })
          .order("month", { foreignTable: "monthly_kpis", ascending: false })
          .limit(12, { foreignTable: "monthly_kpis" })
          .single();

        if (error) {
          return corsErrorResponse(req, "Project not found", 404);
        }
        return corsResponse(req, project);
      }

      // List all projects with summary
      let query = supabase
        .from("website_projects")
        .select(`
          *,
          project_tasks(id, status),
          project_health_snapshots(
            lighthouse_performance, lighthouse_seo,
            snapshot_date
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .order("snapshot_date", { foreignTable: "project_health_snapshots", ascending: false })
        .limit(1, { foreignTable: "project_health_snapshots" });

      if (!includeDeleted) {
        query = query.is("deleted_at", null);
      }

      const { data: projects, error } = await query;

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      // Calculate portfolio stats
      const activeStatuses = ["Live – Stable", "Live – Needs Improving", "In Build", "Pre-Launch QA"];
      const stats: ProjectStats = {
        totalProjects: projects?.length || 0,
        activeProjects: projects?.filter(p => activeStatuses.includes(p.status)).length || 0,
        totalMonthlyVisitors: projects?.reduce((sum, p) => sum + (p.current_month_visitors || 0), 0) || 0,
        totalMonthlyLeads: projects?.reduce((sum, p) => sum + (p.current_month_leads || 0), 0) || 0,
        totalMonthlyRevenue: projects?.reduce((sum, p) => sum + parseFloat(p.current_month_revenue || 0), 0) || 0,
        totalEstimatedValue: projects?.reduce((sum, p) => sum + parseFloat(p.estimated_asset_value || 0), 0) || 0,
        openTasks: projects?.reduce((sum, p) => {
          const openCount = p.project_tasks?.filter((t: { status: string }) => t.status !== "Done").length || 0;
          return sum + openCount;
        }, 0) || 0,
      };

      return corsResponse(req, { projects, stats });
    }

    // POST - Create new project
    if (req.method === "POST") {
      const body = await req.json();
      const {
        project_name,
        primary_domain,
        project_type,
        build_platform,
        status,
        priority,
        niche,
        notes,
        monetisation_type,
      } = body;

      if (!project_name || !primary_domain) {
        return corsErrorResponse(req, "project_name and primary_domain are required", 400);
      }

      // Normalize domain
      const normalizedDomain = primary_domain
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

      const { data: project, error } = await supabase
        .from("website_projects")
        .insert({
          user_id: user.id,
          project_name: project_name.trim(),
          primary_domain: normalizedDomain,
          project_type: project_type || "Local Lead Gen",
          build_platform: build_platform || ["Custom / Other"],
          status: status || "Idea / Backlog",
          priority: priority || "Medium",
          niche: niche || null,
          notes: notes || null,
          monetisation_type: monetisation_type || [],
        })
        .select()
        .single();

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, project, 201);
    }

    // PUT - Update project
    if (req.method === "PUT") {
      const body = await req.json();
      const { id, ...updates } = body;

      if (!id) {
        return corsErrorResponse(req, "Project ID is required", 400);
      }

      // Normalize domain if provided
      if (updates.primary_domain) {
        updates.primary_domain = updates.primary_domain
          .trim()
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");
      }

      const { data: project, error } = await supabase
        .from("website_projects")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, project);
    }

    // DELETE - Soft delete (archive) or hard delete project
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id, hard_delete } = body;

      if (!id) {
        return corsErrorResponse(req, "Project ID is required", 400);
      }

      if (hard_delete) {
        // Hard delete
        const { error } = await supabase
          .from("website_projects")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          return corsErrorResponse(req, error.message, 500);
        }
      } else {
        // Soft delete (archive)
        const { error } = await supabase
          .from("website_projects")
          .update({ deleted_at: new Date().toISOString(), status: "Archived" })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          return corsErrorResponse(req, error.message, 500);
        }
      }

      return corsResponse(req, { success: true, deleted_id: id });
    }

    return corsErrorResponse(req, "Method not allowed", 405);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
