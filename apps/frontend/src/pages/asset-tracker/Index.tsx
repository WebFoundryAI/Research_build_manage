import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  Plus,
  Star,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  domain: string;
  status: string;
  health_score: number | null;
  monthly_traffic: number | null;
  monthly_revenue: number | null;
  is_favourite: boolean;
  updated_at: string;
};

type Task = {
  id: string;
  title: string;
  project_name: string;
  status: string;
  priority: string;
  due_date: string | null;
};

type Stats = {
  totalProjects: number;
  liveProjects: number;
  totalTraffic: number;
  totalRevenue: number;
};

export default function AssetTrackerDashboard() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    liveProjects: 0,
    totalTraffic: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Demo data
    const demoProjects: Project[] = [
      { id: "1", name: "Main Website", domain: "example.com", status: "Live – Stable", health_score: 92, monthly_traffic: 45000, monthly_revenue: 2500, is_favourite: true, updated_at: new Date().toISOString() },
      { id: "2", name: "E-Commerce Store", domain: "shop.example.com", status: "Live – Needs Improving", health_score: 68, monthly_traffic: 12000, monthly_revenue: 8500, is_favourite: true, updated_at: new Date().toISOString() },
      { id: "3", name: "Blog Platform", domain: "blog.example.com", status: "In Build", health_score: null, monthly_traffic: 0, monthly_revenue: 0, is_favourite: false, updated_at: new Date().toISOString() },
      { id: "4", name: "SaaS Dashboard", domain: "app.example.com", status: "Pre-Launch QA", health_score: 85, monthly_traffic: 0, monthly_revenue: 0, is_favourite: false, updated_at: new Date().toISOString() },
    ];

    const demoTasks: Task[] = [
      { id: "1", title: "Fix mobile navigation", project_name: "E-Commerce Store", status: "In Progress", priority: "High", due_date: new Date(Date.now() + 86400000).toISOString() },
      { id: "2", title: "Update SSL certificate", project_name: "Main Website", status: "To Do", priority: "Critical", due_date: new Date(Date.now() + 172800000).toISOString() },
      { id: "3", title: "Optimize images", project_name: "Blog Platform", status: "To Do", priority: "Medium", due_date: null },
      { id: "4", title: "Add payment gateway", project_name: "SaaS Dashboard", status: "In Progress", priority: "High", due_date: new Date(Date.now() + 604800000).toISOString() },
    ];

    setProjects(demoProjects);
    setTasks(demoTasks);

    const liveProjects = demoProjects.filter(p => p.status.startsWith("Live"));
    setStats({
      totalProjects: demoProjects.length,
      liveProjects: liveProjects.length,
      totalTraffic: liveProjects.reduce((sum, p) => sum + (p.monthly_traffic || 0), 0),
      totalRevenue: liveProjects.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0),
    });

    setLoading(false);
  }

  function getStatusColor(status: string) {
    if (status === "Live – Stable") return "text-emerald-400 bg-emerald-500/20";
    if (status === "Live – Needs Improving") return "text-amber-400 bg-amber-500/20";
    if (status === "In Build" || status === "Pre-Launch QA") return "text-blue-400 bg-blue-500/20";
    if (status === "On Hold" || status === "Archived") return "text-slate-400 bg-slate-500/20";
    return "text-slate-400 bg-slate-500/20";
  }

  function getHealthColor(score: number | null) {
    if (score === null) return "text-slate-500";
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  }

  function getPriorityColor(priority: string) {
    if (priority === "Critical") return "text-red-400 bg-red-500/20";
    if (priority === "High") return "text-amber-400 bg-amber-500/20";
    if (priority === "Medium") return "text-blue-400 bg-blue-500/20";
    return "text-slate-400 bg-slate-500/20";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Asset Tracker Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your web portfolio and track performance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-medium text-sm transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link
            to="/asset-tracker/projects"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            New Project
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800/50">
              <Globe size={18} className="text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{stats.totalProjects}</div>
              <div className="text-xs text-slate-500">Total Projects</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-emerald-400">{stats.liveProjects}</div>
              <div className="text-xs text-slate-500">Live Sites</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Users size={18} className="text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-400">
                {stats.totalTraffic.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">Monthly Traffic</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <DollarSign size={18} className="text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-purple-400">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">Monthly Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Projects List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold">Projects</h2>
            <Link to="/asset-tracker/projects" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <Globe size={40} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">No projects yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  to={`/asset-tracker/projects/${project.id}`}
                  className="block px-4 py-3 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {project.is_favourite && (
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {project.name}
                          <ExternalLink size={12} className="text-slate-500" />
                        </div>
                        <div className="text-xs text-slate-500">{project.domain}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getHealthColor(project.health_score)}`}>
                        {project.health_score !== null ? `${project.health_score}%` : "-"}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                        {project.status.replace("Live – ", "")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold">Upcoming Tasks</h2>
            <Link to="/asset-tracker/tasks" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle size={40} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">No pending tasks</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="px-4 py-3 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{task.project_name}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link
          to="/asset-tracker/board"
          className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingUp size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-blue-400 transition-colors">Board View</h3>
              <p className="text-xs text-slate-500">Kanban workflow</p>
            </div>
          </div>
        </Link>

        <Link
          to="/asset-tracker/health"
          className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-emerald-400 transition-colors">Health Monitor</h3>
              <p className="text-xs text-slate-500">Site health checks</p>
            </div>
          </div>
        </Link>

        <Link
          to="/asset-tracker/reports"
          className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <TrendingUp size={18} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-purple-400 transition-colors">Reports</h3>
              <p className="text-xs text-slate-500">Analytics & insights</p>
            </div>
          </div>
        </Link>

        <Link
          to="/asset-tracker/ops-review"
          className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-amber-400 transition-colors">Ops Review</h3>
              <p className="text-xs text-slate-500">Operations overview</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
