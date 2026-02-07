// Supabase Edge Function: Project KPIs
// Manages monthly KPI tracking for website projects

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

    // Helper to verify project ownership
    async function verifyProjectOwnership(projectId: string): Promise<boolean> {
      const { data } = await supabase
        .from("website_projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();
      return !!data;
    }

    // GET - Get KPIs for a project
    if (req.method === "GET") {
      const url = new URL(req.url);
      const projectId = url.searchParams.get("project_id");
      const year = url.searchParams.get("year");
      const limit = parseInt(url.searchParams.get("limit") || "12");

      if (!projectId) {
        return corsErrorResponse(req, "project_id is required", 400);
      }

      if (!(await verifyProjectOwnership(projectId))) {
        return corsErrorResponse(req, "Project not found or access denied", 404);
      }

      let query = supabase
        .from("monthly_kpis")
        .select("*")
        .eq("project_id", projectId)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(limit);

      if (year) {
        query = query.eq("year", parseInt(year));
      }

      const { data: kpis, error } = await query;

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      // Calculate trends
      const trends = {
        visitorsChange: 0,
        leadsChange: 0,
        revenueChange: 0,
      };

      if (kpis && kpis.length >= 2) {
        const current = kpis[0];
        const previous = kpis[1];

        if (previous.visitors > 0) {
          trends.visitorsChange = ((current.visitors - previous.visitors) / previous.visitors) * 100;
        }
        if (previous.leads > 0) {
          trends.leadsChange = ((current.leads - previous.leads) / previous.leads) * 100;
        }
        if (parseFloat(previous.revenue) > 0) {
          trends.revenueChange = ((parseFloat(current.revenue) - parseFloat(previous.revenue)) / parseFloat(previous.revenue)) * 100;
        }
      }

      return corsResponse(req, { kpis, trends });
    }

    // POST - Create or update KPI entry
    if (req.method === "POST") {
      const body = await req.json();
      const { project_id, year, month, visitors, leads, revenue, main_traffic_source_snapshot, notes } = body;

      if (!project_id || !year || !month) {
        return corsErrorResponse(req, "project_id, year, and month are required", 400);
      }

      if (!(await verifyProjectOwnership(project_id))) {
        return corsErrorResponse(req, "Project not found or access denied", 404);
      }

      // Upsert the KPI entry
      const { data: kpi, error } = await supabase
        .from("monthly_kpis")
        .upsert({
          project_id,
          year,
          month,
          visitors: visitors || 0,
          leads: leads || 0,
          revenue: revenue || 0,
          main_traffic_source_snapshot: main_traffic_source_snapshot || null,
          notes: notes || null,
        }, {
          onConflict: "project_id,year,month",
        })
        .select()
        .single();

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      // Also update the project's current month stats if this is the current month
      const now = new Date();
      if (year === now.getFullYear() && month === now.getMonth() + 1) {
        await supabase
          .from("website_projects")
          .update({
            current_month_visitors: visitors || 0,
            current_month_leads: leads || 0,
            current_month_revenue: revenue || 0,
          })
          .eq("id", project_id);
      }

      return corsResponse(req, kpi, 201);
    }

    // DELETE - Delete KPI entry
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id, project_id, year, month } = body;

      // Can delete by id or by project_id + year + month
      if (!id && (!project_id || !year || !month)) {
        return corsErrorResponse(req, "id or (project_id, year, month) are required", 400);
      }

      if (id) {
        const { data: kpi } = await supabase
          .from("monthly_kpis")
          .select("project_id")
          .eq("id", id)
          .single();

        if (!kpi || !(await verifyProjectOwnership(kpi.project_id))) {
          return corsErrorResponse(req, "KPI not found or access denied", 404);
        }

        await supabase.from("monthly_kpis").delete().eq("id", id);
      } else {
        if (!(await verifyProjectOwnership(project_id))) {
          return corsErrorResponse(req, "Project not found or access denied", 404);
        }

        await supabase
          .from("monthly_kpis")
          .delete()
          .eq("project_id", project_id)
          .eq("year", year)
          .eq("month", month);
      }

      return corsResponse(req, { success: true });
    }

    return corsErrorResponse(req, "Method not allowed", 405);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
