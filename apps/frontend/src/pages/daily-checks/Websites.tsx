import React, { useState, useEffect } from "react";
import {
  Globe,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  X,
} from "lucide-react";

type Website = {
  id: number;
  name: string;
  url: string;
  category: string;
  last_status: number | null;
  seo_score: number | null;
  last_checked: string | null;
  created_at: string;
};

const categories = [
  { value: "general", label: "General" },
  { value: "drainage", label: "Drainage" },
  { value: "business", label: "Business" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "blog", label: "Blog" },
  { value: "portfolio", label: "Portfolio" },
  { value: "client", label: "Client" },
];

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [formData, setFormData] = useState({ name: "", url: "", category: "general" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWebsites();
  }, []);

  async function loadWebsites() {
    setLoading(true);
    // Demo data - replace with API call
    const demoWebsites: Website[] = [
      { id: 1, name: "Example Site", url: "https://example.com", category: "general", last_status: 1, seo_score: 85, last_checked: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: 2, name: "Test Blog", url: "https://blog.example.com", category: "blog", last_status: 1, seo_score: 72, last_checked: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: 3, name: "E-Commerce Store", url: "https://shop.example.com", category: "ecommerce", last_status: 0, seo_score: 45, last_checked: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: 4, name: "Client Portfolio", url: "https://portfolio.example.com", category: "client", last_status: 1, seo_score: 90, last_checked: new Date().toISOString(), created_at: new Date().toISOString() },
    ];
    setWebsites(demoWebsites);
    setLoading(false);
  }

  function openAddModal() {
    setEditingWebsite(null);
    setFormData({ name: "", url: "", category: "general" });
    setShowModal(true);
  }

  function openEditModal(website: Website) {
    setEditingWebsite(website);
    setFormData({ name: website.name, url: website.url, category: website.category });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));

    if (editingWebsite) {
      setWebsites(prev => prev.map(w =>
        w.id === editingWebsite.id
          ? { ...w, ...formData }
          : w
      ));
    } else {
      const newWebsite: Website = {
        id: Date.now(),
        ...formData,
        last_status: null,
        seo_score: null,
        last_checked: null,
        created_at: new Date().toISOString(),
      };
      setWebsites(prev => [...prev, newWebsite]);
    }

    setSaving(false);
    setShowModal(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this website and all its data?")) return;
    setWebsites(prev => prev.filter(w => w.id !== id));
  }

  const filteredWebsites = websites.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         w.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || w.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function getStatusBadge(status: number | null) {
    if (status === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-600">
          <CheckCircle size={12} /> Live
        </span>
      );
    }
    if (status === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-600">
          <XCircle size={12} /> Down
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
        <Clock size={12} /> Unknown
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Website Portfolio</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your monitored websites
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          Add Website
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search websites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Websites Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filteredWebsites.length === 0 ? (
        <div className="text-center py-12">
          <Globe size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-4">
            {searchQuery || categoryFilter ? "No websites match your filters" : "No websites yet"}
          </p>
          {!searchQuery && !categoryFilter && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
            >
              <Plus size={16} />
              Add your first website
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWebsites.map(website => (
            <div
              key={website.id}
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Globe size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{website.name}</h3>
                    <span className="text-xs text-slate-500 capitalize">{website.category}</span>
                  </div>
                </div>
                {getStatusBadge(website.last_status)}
              </div>

              <a
                href={website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-900 mb-4 truncate"
              >
                {website.url}
                <ExternalLink size={12} />
              </a>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>SEO: {website.seo_score ?? "-"}</span>
                <span>
                  {website.last_checked
                    ? `Checked ${new Date(website.last_checked).toLocaleDateString()}`
                    : "Never checked"}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(website)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm transition-colors"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(website.id)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 text-sm transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              {editingWebsite ? "Edit Website" : "Add Website"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Website"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-emerald-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
