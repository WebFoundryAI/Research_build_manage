import { useState, useEffect, useCallback } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { callEdgeFunction } from "../lib/edgeFunctions";
import type { Website, WebsitesSummary } from "../lib/types";
import { RefreshCw, Globe, Activity, Shield, TrendingUp } from "lucide-react";
import EmptyState from "../components/EmptyState";

const COLORS = {
  live: "#22c55e",
  down: "#ef4444",
  unknown: "#94a3b8",
};

function Card({ title, value, sub, color }: { title: string; value: string | number; sub: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs opacity-70">{title}</div>
      <div className={`mt-2 text-2xl font-semibold ${color || ""}`}>{value}</div>
      <div className="mt-1 text-xs opacity-60">{sub}</div>
    </div>
  );
}

function StatusBadge({ isLive }: { isLive?: boolean }) {
  if (isLive === undefined) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-600">Unknown</span>;
  }
  if (isLive) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-600">Live</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-600">Down</span>;
}

function SeoScoreBadge({ score }: { score?: number }) {
  if (score === undefined) return <span className="text-slate-500">—</span>;
  const color = score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  return <span className={`font-semibold ${color}`}>{score}</span>;
}

export default function Dashboard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [summary, setSummary] = useState<WebsitesSummary>({ total: 0, live: 0, down: 0, avgSeoScore: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction("websites", {});
      if (result.ok && result.json) {
        const data = result.json as { websites: Website[]; summary: WebsitesSummary };
        setWebsites(data.websites || []);
        setSummary(data.summary || { total: 0, live: 0, down: 0, avgSeoScore: 0 });
      } else {
        setError(result.bodyText || "Failed to load data");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Prepare chart data
  const fleetStatusData = [
    { name: "Live", value: summary.live, color: COLORS.live },
    { name: "Down", value: summary.down, color: COLORS.down },
    { name: "Unknown", value: Math.max(0, summary.total - summary.live - summary.down), color: COLORS.unknown },
  ].filter(d => d.value > 0);

  // Get SEO score distribution
  const seoDistribution = websites.reduce((acc, w) => {
    const score = w.seo_health_checks?.[0]?.health_score;
    if (score === undefined) {
      acc.unchecked++;
    } else if (score >= 80) {
      acc.good++;
    } else if (score >= 50) {
      acc.medium++;
    } else {
      acc.poor++;
    }
    return acc;
  }, { good: 0, medium: 0, poor: 0, unchecked: 0 });

  const seoData = [
    { name: "Good (80+)", value: seoDistribution.good },
    { name: "Medium (50-79)", value: seoDistribution.medium },
    { name: "Poor (<50)", value: seoDistribution.poor },
  ];

  // Recent checks - last 5 websites checked
  const recentWebsites = [...websites]
    .filter(w => w.last_checked_at)
    .sort((a, b) => new Date(b.last_checked_at!).getTime() - new Date(a.last_checked_at!).getTime())
    .slice(0, 5);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-sm opacity-70">
            Unified monitoring for your website portfolio, SEO health, and performance.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-800 p-4 text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && summary.total === 0 && (
        <EmptyState />
      )}

      {/* Summary Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card title="Total Sites" value={summary.total} sub="in your portfolio" />
        <Card title="Live" value={summary.live} sub="passing uptime checks" color="text-emerald-600" />
        <Card title="Down" value={summary.down} sub="need attention" color="text-red-600" />
        <Card title="Avg SEO Score" value={summary.avgSeoScore || "—"} sub="across all sites" color="text-blue-600" />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Fleet Status Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold mb-4">Fleet Status</div>
          {summary.total === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500">
              No data yet. Connect APIs in Settings to begin.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {fleetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* SEO Score Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold mb-4">SEO Score Distribution</div>
          {summary.total === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500">
              No data yet. Connect APIs in Settings to begin.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seoData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Websites Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">Recent Activity</div>
          <a href="/websites" className="text-xs text-blue-600 hover:underline">View all websites →</a>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading...</div>
        ) : websites.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <Globe size={32} className="mx-auto mb-2 opacity-50" />
            <p>No websites monitored yet.</p>
            <a href="/websites" className="text-blue-600 hover:underline text-sm">Add your first website →</a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left opacity-70">
                <tr>
                  <th className="py-2 pr-4">Website</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">SEO</th>
                  <th className="py-2 pr-4">Response</th>
                  <th className="py-2 pr-4">Last Check</th>
                </tr>
              </thead>
              <tbody>
                {recentWebsites.map((website) => {
                  const latestStatus = website.status_checks?.[0];
                  const latestSeo = website.seo_health_checks?.[0];
                  return (
                    <tr key={website.id} className="border-t border-slate-200">
                      <td className="py-3 pr-4">
                        <a href="/websites" className="hover:text-blue-600">
                          <div className="font-medium">{website.name || website.url}</div>
                          {website.name && <div className="text-xs opacity-60">{website.url}</div>}
                        </a>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge isLive={latestStatus?.is_live} />
                      </td>
                      <td className="py-3 pr-4">
                        <SeoScoreBadge score={latestSeo?.health_score} />
                      </td>
                      <td className="py-3 pr-4 text-slate-400">
                        {latestStatus?.response_time_ms ? `${latestStatus.response_time_ms}ms` : "—"}
                      </td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">
                        {formatDate(website.last_checked_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <a
          href="/websites"
          className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Globe size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="font-medium">Website Monitor</div>
              <div className="text-xs opacity-60">Manage and check your websites</div>
            </div>
          </div>
        </a>
        <a
          href="/research"
          className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <div>
              <div className="font-medium">Research Tools</div>
              <div className="text-xs opacity-60">SEO audit & content generation</div>
            </div>
          </div>
        </a>
        <a
          href="/settings"
          className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Shield size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="font-medium">Settings</div>
              <div className="text-xs opacity-60">API keys & integrations</div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
