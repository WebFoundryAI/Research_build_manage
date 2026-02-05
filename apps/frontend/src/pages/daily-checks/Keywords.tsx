import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Trash2,
  Search,
  Globe,
  MapPin,
  X,
} from "lucide-react";

type Keyword = {
  id: number;
  website_id: number;
  website_name: string;
  keyword: string;
  location: string;
  created_at: string;
};

type Website = {
  id: number;
  name: string;
  url: string;
};

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState<number | "">("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ website_id: "", keyword: "", location: "United Kingdom" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Demo websites
    const demoWebsites: Website[] = [
      { id: 1, name: "Example Site", url: "https://example.com" },
      { id: 2, name: "Test Blog", url: "https://blog.example.com" },
      { id: 3, name: "E-Commerce Store", url: "https://shop.example.com" },
    ];

    // Demo keywords
    const demoKeywords: Keyword[] = [
      { id: 1, website_id: 1, website_name: "Example Site", keyword: "web development services", location: "United Kingdom", created_at: new Date().toISOString() },
      { id: 2, website_id: 1, website_name: "Example Site", keyword: "react developer london", location: "London, UK", created_at: new Date().toISOString() },
      { id: 3, website_id: 2, website_name: "Test Blog", keyword: "javascript tutorials", location: "United States", created_at: new Date().toISOString() },
      { id: 4, website_id: 3, website_name: "E-Commerce Store", keyword: "buy electronics online", location: "United Kingdom", created_at: new Date().toISOString() },
      { id: 5, website_id: 3, website_name: "E-Commerce Store", keyword: "best laptop deals", location: "United Kingdom", created_at: new Date().toISOString() },
    ];

    setWebsites(demoWebsites);
    setKeywords(demoKeywords);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.website_id) return;

    setSaving(true);
    await new Promise(r => setTimeout(r, 500));

    const website = websites.find(w => w.id === Number(formData.website_id));
    const newKeyword: Keyword = {
      id: Date.now(),
      website_id: Number(formData.website_id),
      website_name: website?.name || "",
      keyword: formData.keyword,
      location: formData.location,
      created_at: new Date().toISOString(),
    };

    setKeywords(prev => [...prev, newKeyword]);
    setSaving(false);
    setShowModal(false);
    setFormData({ website_id: "", keyword: "", location: "United Kingdom" });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this keyword?")) return;
    setKeywords(prev => prev.filter(k => k.id !== id));
  }

  const filteredKeywords = keywords.filter(k => {
    const matchesSearch = k.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWebsite = websiteFilter === "" || k.website_id === websiteFilter;
    return matchesSearch && matchesWebsite;
  });

  // Group keywords by website
  const groupedKeywords = filteredKeywords.reduce((acc, k) => {
    if (!acc[k.website_id]) {
      acc[k.website_id] = {
        website_name: k.website_name,
        keywords: [],
      };
    }
    acc[k.website_id].keywords.push(k);
    return acc;
  }, {} as Record<number, { website_name: string; keywords: Keyword[] }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Keywords</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track target keywords for your websites
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          Add Keyword
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={websiteFilter}
          onChange={(e) => setWebsiteFilter(e.target.value ? Number(e.target.value) : "")}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Websites</option>
          {websites.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Keywords List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : Object.keys(groupedKeywords).length === 0 ? (
        <div className="text-center py-12">
          <Key size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-4">
            {searchQuery || websiteFilter !== "" ? "No keywords match your filters" : "No keywords yet"}
          </p>
          {!searchQuery && websiteFilter === "" && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
            >
              <Plus size={16} />
              Add your first keyword
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedKeywords).map(([websiteId, data]) => (
            <div key={websiteId} className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                <Globe size={16} className="text-slate-400" />
                <h3 className="font-medium">{data.website_name}</h3>
                <span className="text-xs text-slate-500 ml-auto">{data.keywords.length} keywords</span>
              </div>
              <div className="divide-y divide-slate-800/50">
                {data.keywords.map(keyword => (
                  <div key={keyword.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-800/30">
                    <div className="flex-1">
                      <div className="font-medium">{keyword.keyword}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin size={12} />
                        {keyword.location}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(keyword.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Keywords</span>
          <span className="font-medium">{keywords.length}</span>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-6">Add Keyword</h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Website
                </label>
                <select
                  required
                  value={formData.website_id}
                  onChange={(e) => setFormData({ ...formData, website_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select a website</option>
                  {websites.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Keyword
                </label>
                <input
                  type="text"
                  required
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="drain unblocker london"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="United Kingdom"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {saving ? "Adding..." : "Add Keyword"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
