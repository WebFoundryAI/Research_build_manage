import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Clock,
  DollarSign,
  BarChart3,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Filter,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";

type Article = {
  id: string;
  title: string;
  slug: string;
  project: string;
  keyword: string;
  wordCount: number;
  readingTime: number;
  seoScore: number | null;
  cost: number | null;
  status: "published" | "in_review" | "generating" | "draft";
  createdAt: string;
};

export default function NexusOpenCopyArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    setLoading(true);
    setArticles([]);
    setLoading(false);
  }

  function getScoreColor(score: number | null) {
    if (score === null) return "text-slate-500";
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  }

  function getScoreBg(score: number | null) {
    if (score === null) return "bg-slate-100";
    if (score >= 80) return "bg-emerald-500/20";
    if (score >= 60) return "bg-amber-500/20";
    return "bg-red-500/20";
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      published: "bg-emerald-500/20 text-emerald-600",
      in_review: "bg-amber-500/20 text-amber-600",
      generating: "bg-blue-500/20 text-blue-600",
      draft: "bg-slate-200 text-slate-400",
    };
    const labels: Record<string, string> = {
      published: "Published",
      in_review: "In Review",
      generating: "Generating",
      draft: "Draft",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  }

  const filteredArticles = articles.filter((a) => {
    const matchesFilter = filter === "all" || a.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <FileText className="text-emerald-600" />
            Articles
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your generated articles
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {articles.length} total articles
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "published", label: "Published" },
            { id: "in_review", label: "In Review" },
            { id: "generating", label: "Generating" },
            { id: "draft", label: "Draft" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filter === f.id
                  ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading articles...</div>
      ) : filteredArticles.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/30">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Article</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">SEO Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Words</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Read Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Cost</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id} className="border-b border-slate-200 hover:bg-slate-100/20">
                  <td className="px-4 py-3">
                    <div className="font-medium">{article.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {article.project} • {article.keyword}
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(article.status)}</td>
                  <td className="px-4 py-3">
                    {article.seoScore !== null ? (
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-2 rounded-full ${getScoreBg(article.seoScore)}`}>
                          <div
                            className={`h-full rounded-full ${
                              article.seoScore >= 80
                                ? "bg-emerald-500"
                                : article.seoScore >= 60
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${article.seoScore}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getScoreColor(article.seoScore)}`}>
                          {article.seoScore}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <FileText size={12} />
                      {article.wordCount > 0 ? article.wordCount.toLocaleString() : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {article.readingTime > 0 ? `${article.readingTime} min` : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {article.cost !== null ? (
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <DollarSign size={12} />
                        {article.cost.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-emerald-600">
            {articles.filter((a) => a.status === "published").length}
          </div>
          <div className="text-xs text-slate-500">Published</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold">
            {articles.reduce((sum, a) => sum + a.wordCount, 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Total Words</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-amber-600">
            {Math.round(
              articles.filter((a) => a.seoScore).reduce((sum, a) => sum + (a.seoScore || 0), 0) /
                articles.filter((a) => a.seoScore).length || 0
            )}
          </div>
          <div className="text-xs text-slate-500">Avg SEO Score</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold">
            ${articles.reduce((sum, a) => sum + (a.cost || 0), 0).toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">Total Cost</div>
        </div>
      </div>
    </div>
  );
}
