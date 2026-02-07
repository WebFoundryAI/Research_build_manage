import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  CheckCircle,
  XCircle,
  TrendingUp,
  RefreshCw,
  Play,
  ShieldCheck,
  ExternalLink,
  Clock,
  AlertTriangle,
} from "lucide-react";

type Website = {
  id: number;
  name: string;
  url: string;
  category: string;
  last_status: number | null;
  seo_score: number | null;
  last_checked: string | null;
};

type StatusSummary = {
  total: number;
  live: number;
  down: number;
  avgSeoScore: number | null;
};

export default function DailyChecksDashboard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [summary, setSummary] = useState<StatusSummary>({ total: 0, live: 0, down: 0, avgSeoScore: null });
  const [loading, setLoading] = useState(true);
  const [runningChecks, setRunningChecks] = useState(false);
  const [runningSeoChecks, setRunningSeoChecks] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    // Demo data for now - replace with actual API calls
    const demoWebsites: Website[] = [
      { id: 1, name: "Example Site", url: "https://example.com", category: "general", last_status: 1, seo_score: 85, last_checked: new Date().toISOString() },
      { id: 2, name: "Test Blog", url: "https://blog.example.com", category: "blog", last_status: 1, seo_score: 72, last_checked: new Date().toISOString() },
      { id: 3, name: "E-Commerce", url: "https://shop.example.com", category: "ecommerce", last_status: 0, seo_score: 45, last_checked: new Date().toISOString() },
    ];

    setWebsites(demoWebsites);

    const live = demoWebsites.filter(w => w.last_status === 1).length;
    const down = demoWebsites.filter(w => w.last_status === 0).length;
    const withScores = demoWebsites.filter(w => w.seo_score !== null);
    const avgScore = withScores.length > 0
      ? Math.round(withScores.reduce((sum, w) => sum + (w.seo_score || 0), 0) / withScores.length)
      : null;

    setSummary({
      total: demoWebsites.length,
      live,
      down,
      avgSeoScore: avgScore,
    });
    setLoading(false);
  }

  async function runAllChecks() {
    setRunningChecks(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    await loadData();
    setRunningChecks(false);
  }

  async function runAllSeoChecks() {
    setRunningSeoChecks(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    await loadData();
    setRunningSeoChecks(false);
  }

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

  function getSeoScoreBadge(score: number | null) {
    if (score === null) return <span className="text-slate-500">-</span>;

    let colorClass = "bg-red-500/20 text-red-600";
    if (score >= 70) colorClass = "bg-emerald-500/20 text-emerald-600";
    else if (score >= 40) colorClass = "bg-amber-500/20 text-amber-600";

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {score}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Daily Checks Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor website availability, SEO health, and performance metrics
        </p>
      </div>

      {/* API Notice */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-600">Connect Your APIs</h3>
            <p className="text-sm text-slate-400 mt-1">
              Configure your Cloudflare Workers endpoint or Supabase Edge Functions in{" "}
              <Link to="/daily-checks/settings" className="text-amber-600 hover:underline">
                Settings
              </Link>{" "}
              to enable live monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <Globe size={18} className="text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{summary.total}</div>
              <div className="text-xs text-slate-500">Total Sites</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-emerald-600">{summary.live}</div>
              <div className="text-xs text-slate-500">Live</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle size={18} className="text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-red-600">{summary.down}</div>
              <div className="text-xs text-slate-500">Down</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <TrendingUp size={18} className="text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-indigo-600">
                {summary.avgSeoScore ?? "-"}
              </div>
              <div className="text-xs text-slate-500">Avg SEO Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={runAllChecks}
          disabled={runningChecks}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-60"
        >
          {runningChecks ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
          {runningChecks ? "Running..." : "Run All Checks"}
        </button>

        <button
          onClick={runAllSeoChecks}
          disabled={runningSeoChecks}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-white font-medium text-sm transition-colors disabled:opacity-60"
        >
          {runningSeoChecks ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          {runningSeoChecks ? "Running..." : "Run SEO Checks"}
        </button>

        <Link
          to="/daily-checks/websites"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-white font-medium text-sm transition-colors"
        >
          <Globe size={16} />
          Manage Websites
        </Link>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-white font-medium text-sm transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Websites Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold">Monitored Websites</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : websites.length === 0 ? (
          <div className="p-8 text-center">
            <Globe size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">No websites yet</p>
            <Link
              to="/daily-checks/websites"
              className="inline-flex items-center gap-2 mt-3 text-sm text-emerald-600 hover:underline"
            >
              Add your first website
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-3 font-medium text-slate-400">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-400">URL</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-400">SEO Score</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Last Checked</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {websites.map((site) => (
                  <tr key={site.id} className="border-b border-slate-200 hover:bg-slate-100/30">
                    <td className="px-4 py-3 font-medium">{site.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-900 flex items-center gap-1"
                      >
                        {site.url.substring(0, 30)}{site.url.length > 30 ? "..." : ""}
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(site.last_status)}</td>
                    <td className="px-4 py-3">{getSeoScoreBadge(site.seo_score)}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {site.last_checked ? new Date(site.last_checked).toLocaleString() : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                          Check
                        </button>
                        <button className="px-2 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                          SEO
                        </button>
                        <Link
                          to={`/daily-checks/websites/${site.id}`}
                          className="px-2 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/daily-checks/seo-health"
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-200 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <ShieldCheck size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-emerald-600 transition-colors">SEO Health</h3>
              <p className="text-xs text-slate-500">Robots.txt, sitemap, SSL checks</p>
            </div>
          </div>
        </Link>

        <Link
          to="/daily-checks/keywords"
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-200 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <TrendingUp size={18} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-indigo-600 transition-colors">Keywords</h3>
              <p className="text-xs text-slate-500">Track target keywords</p>
            </div>
          </div>
        </Link>

        <Link
          to="/daily-checks/rankings"
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-200 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <TrendingUp size={18} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-amber-600 transition-colors">GSC Rankings</h3>
              <p className="text-xs text-slate-500">Search Console performance</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
