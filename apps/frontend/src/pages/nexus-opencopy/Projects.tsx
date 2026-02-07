import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  FileText,
  ExternalLink,
  Settings,
  MoreVertical,
  Globe,
  Calendar,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  domain: string;
  description: string;
  keywordsCount: number;
  articlesCount: number;
  avgSeoScore: number;
  createdAt: string;
  status: "active" | "paused";
};

export default function NexusOpenCopyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", domain: "", description: "" });

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setProjects([
      {
        id: "1",
        name: "Tech Blog",
        domain: "techblog.example.com",
        description: "Technology tutorials and guides",
        keywordsCount: 45,
        articlesCount: 128,
        avgSeoScore: 82,
        createdAt: "2024-06-15T00:00:00Z",
        status: "active",
      },
      {
        id: "2",
        name: "Marketing Site",
        domain: "marketing.example.com",
        description: "Digital marketing resources",
        keywordsCount: 32,
        articlesCount: 67,
        avgSeoScore: 78,
        createdAt: "2024-08-20T00:00:00Z",
        status: "active",
      },
      {
        id: "3",
        name: "E-Commerce Blog",
        domain: "shop.example.com/blog",
        description: "Product guides and reviews",
        keywordsCount: 28,
        articlesCount: 89,
        avgSeoScore: 75,
        createdAt: "2024-09-10T00:00:00Z",
        status: "active",
      },
      {
        id: "4",
        name: "Documentation",
        domain: "docs.example.com",
        description: "API and product documentation",
        keywordsCount: 15,
        articlesCount: 42,
        avgSeoScore: 88,
        createdAt: "2024-10-05T00:00:00Z",
        status: "paused",
      },
    ]);
    setLoading(false);
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-emerald-600 bg-emerald-500/20";
    if (score >= 60) return "text-amber-600 bg-amber-500/20";
    return "text-red-600 bg-red-500/20";
  }

  async function createProject() {
    if (!newProject.name) return;
    setProjects((prev) => [
      {
        id: Date.now().toString(),
        name: newProject.name,
        domain: newProject.domain,
        description: newProject.description,
        keywordsCount: 0,
        articlesCount: 0,
        avgSeoScore: 0,
        createdAt: new Date().toISOString(),
        status: "active",
      },
      ...prev,
    ]);
    setShowCreateModal(false);
    setNewProject({ name: "", domain: "", description: "" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <FolderKanban className="text-pink-600" />
            Projects
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your content projects
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <FolderKanban size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No projects yet</p>
          <p className="text-sm text-slate-500 mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/20">
                    <FolderKanban size={20} className="text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <a
                      href={`https://${project.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1"
                    >
                      <Globe size={10} />
                      {project.domain}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      project.status === "active"
                        ? "bg-emerald-500/20 text-emerald-600"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {project.status}
                  </span>
                  <button className="p-1 rounded hover:bg-slate-100 text-slate-500">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-2 rounded-lg bg-slate-100 text-center">
                  <div className="text-lg font-semibold">{project.keywordsCount}</div>
                  <div className="text-xs text-slate-500">Keywords</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 text-center">
                  <div className="text-lg font-semibold">{project.articlesCount}</div>
                  <div className="text-xs text-slate-500">Articles</div>
                </div>
                <div className={`p-2 rounded-lg text-center ${getScoreColor(project.avgSeoScore)}`}>
                  <div className="text-lg font-semibold">{project.avgSeoScore || "-"}</div>
                  <div className="text-xs opacity-75">Avg SEO</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar size={12} />
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                    <Search size={14} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                    <FileText size={14} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                    <Settings size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="My Blog"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  value={newProject.domain}
                  onChange={(e) => setNewProject({ ...newProject, domain: e.target.value })}
                  placeholder="blog.example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProject.name}
                className="flex-1 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
