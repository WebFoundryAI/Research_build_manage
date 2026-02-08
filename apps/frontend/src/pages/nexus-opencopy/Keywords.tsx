import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Sparkles,
  BarChart3,
  Loader2,
  ExternalLink,
  Trash2,
  Filter,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";

type Keyword = {
  id: string;
  keyword: string;
  secondaryKeywords: string[];
  project: string;
  difficulty: "low" | "medium" | "high" | null;
  volume: "low" | "medium" | "high" | null;
  articlesCount: number;
  status: "idle" | "generating" | "queued";
};

export default function NexusOpenCopyKeywords() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState({ keyword: "", secondaryKeywords: "", project: "" });
  const [generatingIds, setGeneratingIds] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const projectOptions = Array.from(new Set(keywords.map((keyword) => keyword.project))).sort();

  useEffect(() => {
    loadKeywords();
  }, []);

  async function loadKeywords() {
    setLoading(true);
    setKeywords([]);
    setLoading(false);
  }

  function getDifficultyBars(difficulty: string | null) {
    if (!difficulty) return null;
    const levels = { low: 1, medium: 2, high: 3 };
    const colors = { low: "bg-emerald-500", medium: "bg-amber-500", high: "bg-red-500" };
    const level = levels[difficulty as keyof typeof levels];
    const color = colors[difficulty as keyof typeof colors];

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-sm ${i <= level ? color : "bg-slate-200"}`}
          />
        ))}
      </div>
    );
  }

  function getVolumeBars(volume: string | null) {
    if (!volume) return null;
    const levels = { low: 1, medium: 2, high: 3 };
    const level = levels[volume as keyof typeof levels];

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-sm ${i <= level ? "bg-blue-500" : "bg-slate-200"}`}
          />
        ))}
      </div>
    );
  }

  async function generateArticle(id: string) {
    setGeneratingIds((prev) => [...prev, id]);
    setKeywords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "generating" as const } : k))
    );

    await new Promise((r) => setTimeout(r, 3000));

    setKeywords((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, status: "idle" as const, articlesCount: k.articlesCount + 1 } : k
      )
    );
    setGeneratingIds((prev) => prev.filter((i) => i !== id));
  }

  async function analyzeKeywords() {
    const needsAnalysis = keywords.filter((k) => !k.difficulty || !k.volume);
    for (const kw of needsAnalysis) {
      await new Promise((r) => setTimeout(r, 500));
      setKeywords((prev) =>
        prev.map((k) =>
          k.id === kw.id
            ? { ...k, difficulty: "medium" as const, volume: "medium" as const }
            : k
        )
      );
    }
  }

  async function addKeyword() {
    if (!newKeyword.keyword || !newKeyword.project) return;
    setKeywords((prev) => [
      {
        id: Date.now().toString(),
        keyword: newKeyword.keyword,
        secondaryKeywords: newKeyword.secondaryKeywords.split(",").map((s) => s.trim()).filter(Boolean),
        project: newKeyword.project,
        difficulty: null,
        volume: null,
        articlesCount: 0,
        status: "idle",
      },
      ...prev,
    ]);
    setShowAddModal(false);
    setNewKeyword({ keyword: "", secondaryKeywords: "", project: "" });
  }

  const needsAnalysis = keywords.filter((k) => !k.difficulty || !k.volume);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <Search className="text-blue-600" />
            Keywords
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track and manage your target keywords
          </p>
        </div>
        <div className="flex gap-2">
          {needsAnalysis.length > 0 && (
            <button
              onClick={analyzeKeywords}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-sm transition-colors"
            >
              <BarChart3 size={16} />
              Analyze ({needsAnalysis.length})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            Add Keyword
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "All Keywords" },
          { id: "no-articles", label: "No Articles" },
          { id: "needs-analysis", label: "Needs Analysis" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === f.id
                ? "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Keywords Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading keywords...</div>
      ) : keywords.length === 0 ? (
        <EmptyState
          action={
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm"
            >
              <Plus size={16} />
              Add Keyword
            </button>
          }
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/30">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Keyword</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Project</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Difficulty</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Volume</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Articles</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keywords
                .filter((k) => {
                  if (filter === "no-articles") return k.articlesCount === 0;
                  if (filter === "needs-analysis") return !k.difficulty || !k.volume;
                  return true;
                })
                .map((keyword) => (
                  <tr key={keyword.id} className="border-b border-slate-200 hover:bg-slate-100/20">
                    <td className="px-4 py-3">
                      <div className="font-medium">{keyword.keyword}</div>
                      {keyword.secondaryKeywords.length > 0 && (
                        <div className="text-xs text-slate-500 mt-1">
                          +{keyword.secondaryKeywords.length} secondary
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{keyword.project}</td>
                    <td className="px-4 py-3">
                      {getDifficultyBars(keyword.difficulty) || (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getVolumeBars(keyword.volume) || (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{keyword.articlesCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => generateArticle(keyword.id)}
                          disabled={generatingIds.includes(keyword.id)}
                          className="p-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-600 transition-colors disabled:opacity-50"
                          title="Generate Article"
                        >
                          {generatingIds.includes(keyword.id) ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Sparkles size={16} />
                          )}
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Keyword Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Add Keyword</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Primary Keyword *
                </label>
                <input
                  type="text"
                  value={newKeyword.keyword}
                  onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                  placeholder="e.g., react hooks tutorial"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Secondary Keywords
                </label>
                <input
                  type="text"
                  value={newKeyword.secondaryKeywords}
                  onChange={(e) =>
                    setNewKeyword({ ...newKeyword, secondaryKeywords: e.target.value })
                  }
                  placeholder="Comma-separated: usestate, useeffect"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Project
                </label>
                <select
                  value={newKeyword.project}
                  onChange={(e) => setNewKeyword({ ...newKeyword, project: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled>
                    {projectOptions.length === 0 ? "No projects available" : "Select a project"}
                  </option>
                  {projectOptions.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addKeyword}
                disabled={!newKeyword.keyword || !newKeyword.project}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                Add Keyword
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
