import { useState, useEffect, useCallback } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { callEdgeFunction } from "../lib/edgeFunctions";
import type { Website, WebsitesSummary } from "../lib/types";
import { RefreshCw, Globe, Activity, Shield, TrendingUp, ArrowRight, Zap } from "lucide-react";

const COLORS = {
  live: "#10b981",
  down: "#ef4444",
  unknown: "#64748b",
};

const CHART_COLORS = {
  primary: "#8b5cf6",
  secondary: "#06b6d4",
  accent: "#a78bfa",
};

function Card({ title, value, sub, icon: Icon, gradient }: {
  title: string;
  value: string | number;
  sub: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  gradient?: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-900 p-5 transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary-500/10 hover:border-neutral-300 dark:hover:border-primary-500/30 overflow-hidden">
      {/* Subtle gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.03] to-secondary-500/[0.03] dark:from-primary-500/[0.05] dark:to-secondary-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{title}</span>
          {Icon && (
            <div className={`p-2 rounded-lg ${gradient || 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 dark:from-primary-500/20 dark:to-secondary-500/20'}`}>
              <Icon size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">{value}</div>
        <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{sub}</div>
      </div>
    </div>
  );
}

function StatusBadge({ isLive }: { isLive?: boolean }) {
  if (isLive === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
        Unknown
      </span>
    );
  }
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Down
    </span>
  );
}

function SeoScoreBadge({ score }: { score?: number }) {
  if (score === undefined) return <span className="text-neutral-400 dark:text-neutral-500">—</span>;

  let colorClasses = "";
  if (score >= 80) {
    colorClasses = "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15";
  } else if (score >= 50) {
    colorClasses = "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15";
  } else {
    colorClasses = "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/15";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${colorClasses}`}>
      {score}
    </span>
  );
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
      } else if (!result.ok && result.status === 401) {
        setWebsites([]);
        setSummary({ total: 0, live: 0, down: 0, avgSeoScore: 0 });
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
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
            Unified monitoring for your website portfolio, SEO health, and performance metrics.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Total Sites"
          value={summary.total}
          sub="in your portfolio"
          icon={Globe}
        />
        <Card
          title="Live"
          value={summary.live}
          sub="passing uptime checks"
          icon={Activity}
          gradient="bg-emerald-100 dark:bg-emerald-500/20"
        />
        <Card
          title="Down"
          value={summary.down}
          sub="need attention"
          icon={Shield}
          gradient="bg-red-100 dark:bg-red-500/20"
        />
        <Card
          title="Avg SEO Score"
          value={summary.avgSeoScore || "—"}
          sub="across all sites"
          icon={TrendingUp}
          gradient="bg-secondary-100 dark:bg-secondary-500/20"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Fleet Status Pie Chart */}
        <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Fleet Status</h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{summary.total} total</span>
          </div>
          {summary.total === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
              <Globe size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No websites added yet</p>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* SEO Score Distribution */}
        <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">SEO Score Distribution</h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Health overview</span>
          </div>
          {summary.total === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
              <TrendingUp size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No SEO data yet</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seoData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Websites Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-white/[0.08]">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Recent Activity</h3>
          <a
            href="/websites"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            View all websites
            <ArrowRight size={12} />
          </a>
        </div>

        {loading ? (
          <div className="py-12 text-center text-neutral-400 dark:text-neutral-500">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin opacity-50" />
            <p className="text-sm">Loading...</p>
          </div>
        ) : websites.length === 0 ? (
          <div className="py-12 text-center">
            <Globe size={40} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
            <p className="text-neutral-500 dark:text-neutral-400 mb-2">No websites monitored yet.</p>
            <a
              href="/websites"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              Add your first website
              <ArrowRight size={14} />
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-850">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Website</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">SEO</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Response</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Last Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/[0.08]">
                {recentWebsites.map((website) => {
                  const latestStatus = website.status_checks?.[0];
                  const latestSeo = website.seo_health_checks?.[0];
                  return (
                    <tr key={website.id} className="hover:bg-neutral-50 dark:hover:bg-primary-500/[0.04] transition-colors">
                      <td className="px-5 py-4">
                        <a href="/websites" className="group">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {website.name || website.url}
                          </div>
                          {website.name && (
                            <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">{website.url}</div>
                          )}
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge isLive={latestStatus?.is_live} />
                      </td>
                      <td className="px-5 py-4">
                        <SeoScoreBadge score={latestSeo?.health_score} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {latestStatus?.response_time_ms ? `${latestStatus.response_time_ms}ms` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-neutral-500 dark:text-neutral-500">
                          {formatDate(website.last_checked_at)}
                        </span>
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
          className="group rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-900 p-5 hover:border-primary-300 dark:hover:border-primary-500/30 hover:shadow-lg dark:hover:shadow-primary-500/10 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-secondary-500/10 to-secondary-600/10 dark:from-secondary-500/20 dark:to-secondary-600/20 group-hover:from-secondary-500/20 group-hover:to-secondary-600/20 dark:group-hover:from-secondary-500/30 dark:group-hover:to-secondary-600/30 transition-colors">
              <Globe size={24} className="text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-neutral-900 dark:text-neutral-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Website Monitor</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Manage and check your websites</div>
            </div>
            <ArrowRight size={18} className="text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          </div>
        </a>
        <a
          href="/mcp-spark"
          className="group rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-900 p-5 hover:border-primary-300 dark:hover:border-primary-500/30 hover:shadow-lg dark:hover:shadow-primary-500/10 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 dark:from-primary-500/20 dark:to-primary-600/20 group-hover:from-primary-500/20 group-hover:to-primary-600/20 dark:group-hover:from-primary-500/30 dark:group-hover:to-primary-600/30 transition-colors">
              <Zap size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-neutral-900 dark:text-neutral-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">MCP Spark</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">27 SEO & scraping tools</div>
            </div>
            <ArrowRight size={18} className="text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          </div>
        </a>
        <a
          href="/settings"
          className="group rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-900 p-5 hover:border-primary-300 dark:hover:border-primary-500/30 hover:shadow-lg dark:hover:shadow-primary-500/10 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20 group-hover:from-emerald-500/20 group-hover:to-emerald-600/20 dark:group-hover:from-emerald-500/30 dark:group-hover:to-emerald-600/30 transition-colors">
              <Shield size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-neutral-900 dark:text-neutral-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Settings</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">API keys & integrations</div>
            </div>
            <ArrowRight size={18} className="text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          </div>
        </a>
      </div>
    </div>
  );
}
