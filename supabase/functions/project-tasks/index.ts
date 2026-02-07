// Supabase Edge Function: Project Tasks CRUD
// Manages tasks for website projects

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

    // GET - List tasks for a project or all tasks
    if (req.method === "GET") {
      const url = new URL(req.url);
      const projectId = url.searchParams.get("project_id");
      const status = url.searchParams.get("status");
      const category = url.searchParams.get("category");

      let query = supabase
        .from("project_tasks")
        .select(`
          *,
          website_projects!inner(id, project_name, user_id)
        `)
        .eq("website_projects.user_id", user.id)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }
      if (status) {
        query = query.eq("status", status);
      }
      if (category) {
        query = query.eq("category", category);
      }

      const { data: tasks, error } = await query;

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      // Calculate summary
      const summary = {
        total: tasks?.length || 0,
        todo: tasks?.filter(t => t.status === "To Do").length || 0,
        inProgress: tasks?.filter(t => t.status === "In Progress").length || 0,
        done: tasks?.filter(t => t.status === "Done").length || 0,
        blocked: tasks?.filter(t => t.status === "Blocked").length || 0,
        overdue: tasks?.filter(t => {
          if (!t.due_date || t.status === "Done") return false;
          return new Date(t.due_date) < new Date();
        }).length || 0,
      };

      return corsResponse(req, { tasks, summary });
    }

    // POST - Create new task
    if (req.method === "POST") {
      const body = await req.json();
      const { project_id, title, description, status, category, due_date, assigned_to } = body;

      if (!project_id || !title) {
        return corsErrorResponse(req, "project_id and title are required", 400);
      }

      // Verify ownership
      if (!(await verifyProjectOwnership(project_id))) {
        return corsErrorResponse(req, "Project not found or access denied", 404);
      }

      const { data: task, error } = await supabase
        .from("project_tasks")
        .insert({
          project_id,
          title: title.trim(),
          description: description || null,
          status: status || "To Do",
          category: category || "Other",
          due_date: due_date || null,
          assigned_to: assigned_to || null,
        })
        .select()
        .single();

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, task, 201);
    }

    // PUT - Update task
    if (req.method === "PUT") {
      const body = await req.json();
      const { id, ...updates } = body;

      if (!id) {
        return corsErrorResponse(req, "Task ID is required", 400);
      }

      // Get task to verify ownership through project
      const { data: existingTask } = await supabase
        .from("project_tasks")
        .select("project_id")
        .eq("id", id)
        .single();

      if (!existingTask || !(await verifyProjectOwnership(existingTask.project_id))) {
        return corsErrorResponse(req, "Task not found or access denied", 404);
      }

      const { data: task, error } = await supabase
        .from("project_tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, task);
    }

    // DELETE - Delete task
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = body;

      if (!id) {
        return corsErrorResponse(req, "Task ID is required", 400);
      }

      // Get task to verify ownership
      const { data: existingTask } = await supabase
        .from("project_tasks")
        .select("project_id")
        .eq("id", id)
        .single();

      if (!existingTask || !(await verifyProjectOwnership(existingTask.project_id))) {
        return corsErrorResponse(req, "Task not found or access denied", 404);
      }

      const { error } = await supabase
        .from("project_tasks")
        .delete()
        .eq("id", id);

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
