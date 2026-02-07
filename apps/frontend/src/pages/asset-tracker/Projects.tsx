import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Star,
  Globe,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  RefreshCw,
  Filter,
  X,
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
  category: string;
  created_at: string;
  updated_at: string;
};

const statusOptions = [
  "Idea / Backlog",
  "Planning",
  "In Build",
  "Pre-Launch QA",
  "Live – Needs Improving",
  "Live – Stable",
  "On Hold",
  "Archived",
];

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", domain: "", category: "general", status: "Idea / Backlog" });

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);

    // Demo data
    const demoProjects: Project[] = [
      { id: "1", name: "Main Website", domain: "example.com", status: "Live – Stable", health_score: 92, monthly_traffic: 45000, monthly_revenue: 2500, is_favourite: true, category: "business", created_at: "2024-01-15", updated_at: new Date().toISOString() },
      { id: "2", name: "E-Commerce Store", domain: "shop.example.com", status: "Live – Needs Improving", health_score: 68, monthly_traffic: 12000, monthly_revenue: 8500, is_favourite: true, category: "ecommerce", created_at: "2024-02-20", updated_at: new Date().toISOString() },
      { id: "3", name: "Blog Platform", domain: "blog.example.com", status: "In Build", health_score: null, monthly_traffic: 0, monthly_revenue: 0, is_favourite: false, category: "content", created_at: "2024-06-10", updated_at: new Date().toISOString() },
      { id: "4", name: "SaaS Dashboard", domain: "app.example.com", status: "Pre-Launch QA", health_score: 85, monthly_traffic: 0, monthly_revenue: 0, is_favourite: false, category: "saas", created_at: "2024-05-01", updated_at: new Date().toISOString() },
      { id: "5", name: "Landing Page", domain: "promo.example.com", status: "Planning", health_score: null, monthly_traffic: 0, monthly_revenue: 0, is_favourite: false, category: "marketing", created_at: "2024-07-01", updated_at: new Date().toISOString() },
    ];

    setProjects(demoProjects);
    setLoading(false);
  }

  function getStatusColor(status: string) {
    if (status === "Live – Stable") return "text-emerald-600 bg-emerald-500/20";
    if (status === "Live – Needs Improving") return "text-amber-600 bg-amber-500/20";
    if (status === "In Build" || status === "Pre-Launch QA") return "text-blue-600 bg-blue-500/20";
    if (status === "Planning" || status === "Idea / Backlog") return "text-purple-600 bg-purple-500/20";
    if (status === "On Hold" || status === "Archived") return "text-slate-400 bg-slate-500/20";
    return "text-slate-400 bg-slate-500/20";
  }

  function getHealthColor(score: number | null) {
    if (score === null) return "text-slate-500";
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  }

  function toggleFavourite(id: string) {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, is_favourite: !p.is_favourite } : p
    ));
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.domain.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesFavourite = !showFavouritesOnly || p.is_favourite;
    return matchesSearch && matchesStatus && matchesFavourite;
  });

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    const newProject: Project = {
      id: Date.now().toString(),
      name: formData.name,
      domain: formData.domain,
      status: formData.status,
      health_score: null,
      monthly_traffic: 0,
      monthly_revenue: 0,
      is_favourite: false,
      category: formData.category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProjects(prev => [newProject, ...prev]);
    setShowNewModal(false);
    setFormData({ name: "", domain: "", category: "general", status: "Idea / Backlog" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your website portfolio
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFavouritesOnly(!showFavouritesOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
            showFavouritesOnly
              ? "border-amber-500/50 bg-amber-500/20 text-amber-600"
              : "border-slate-200 text-slate-400 hover:bg-slate-100"
          }`}
        >
          <Star size={16} className={showFavouritesOnly ? "fill-amber-400" : ""} />
          Favourites
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Globe size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-4">No projects found</p>
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm"
          >
            <Plus size={16} />
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-200 transition-colors group"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavourite(project.id)}
                      className="text-slate-500 hover:text-amber-600 transition-colors"
                    >
                      <Star size={16} className={project.is_favourite ? "fill-amber-400 text-amber-600" : ""} />
                    </button>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <Link to={`/asset-tracker/projects/${project.id}`}>
                  <h3 className="font-semibold mb-1 hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <a
                    href={`https://${project.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-slate-400 hover:text-blue-600 flex items-center gap-1"
                  >
                    {project.domain}
                    <ExternalLink size={12} />
                  </a>
                </Link>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200">
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getHealthColor(project.health_score)}`}>
                      {project.health_score ?? "-"}
                    </div>
                    <div className="text-[10px] text-slate-500">Health</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {project.monthly_traffic ? `${(project.monthly_traffic / 1000).toFixed(1)}k` : "-"}
                    </div>
                    <div className="text-[10px] text-slate-500">Traffic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-emerald-600">
                      {project.monthly_revenue ? `$${(project.monthly_revenue / 1000).toFixed(1)}k` : "-"}
                    </div>
                    <div className="text-[10px] text-slate-500">Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNewModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
            <button
              onClick={() => setShowNewModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-6">New Project</h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Awesome Website"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="general">General</option>
                  <option value="business">Business</option>
                  <option value="ecommerce">E-Commerce</option>
                  <option value="saas">SaaS</option>
                  <option value="content">Content/Blog</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
