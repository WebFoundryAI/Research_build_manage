import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  ExternalLink,
  Search,
  Globe,
  AlertTriangle,
  CheckCircle,
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

type RankingData = {
  id: number;
  website_id: number;
  website_name: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
};

type GscStatus = {
  connected: boolean;
  lastSync: string | null;
};

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [gscStatus, setGscStatus] = useState<GscStatus>({ connected: false, lastSync: null });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState<number | "">("");
  const [websites, setWebsites] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Demo data
    const demoWebsites = [
      { id: 1, name: "Example Site" },
      { id: 2, name: "Test Blog" },
    ];

    const demoRankings: RankingData[] = [
      { id: 1, website_id: 1, website_name: "Example Site", query: "web development services", clicks: 125, impressions: 3400, ctr: 3.68, position: 4.2, date: new Date().toISOString() },
      { id: 2, website_id: 1, website_name: "Example Site", query: "react developer london", clicks: 87, impressions: 2100, ctr: 4.14, position: 6.8, date: new Date().toISOString() },
      { id: 3, website_id: 1, website_name: "Example Site", query: "custom software development", clicks: 56, impressions: 1800, ctr: 3.11, position: 8.5, date: new Date().toISOString() },
      { id: 4, website_id: 2, website_name: "Test Blog", query: "javascript tutorials", clicks: 234, impressions: 5600, ctr: 4.18, position: 3.1, date: new Date().toISOString() },
      { id: 5, website_id: 2, website_name: "Test Blog", query: "react hooks guide", clicks: 189, impressions: 4200, ctr: 4.5, position: 2.8, date: new Date().toISOString() },
      { id: 6, website_id: 2, website_name: "Test Blog", query: "typescript best practices", clicks: 145, impressions: 3800, ctr: 3.82, position: 5.4, date: new Date().toISOString() },
    ];

    setWebsites(demoWebsites);
    setRankings(demoRankings);
    setGscStatus({ connected: true, lastSync: new Date().toISOString() });
    setLoading(false);
  }

  async function syncGscData() {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    await loadData();
    setSyncing(false);
  }

  function getPositionBadge(position: number) {
    let colorClass = "bg-red-500/20 text-red-600";
    if (position <= 3) colorClass = "bg-emerald-500/20 text-emerald-600";
    else if (position <= 10) colorClass = "bg-amber-500/20 text-amber-600";
    else if (position <= 20) colorClass = "bg-orange-500/20 text-orange-600";

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {position.toFixed(1)}
      </span>
    );
  }

  const filteredRankings = rankings.filter(r => {
    const matchesSearch = r.query.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWebsite = websiteFilter === "" || r.website_id === websiteFilter;
    return matchesSearch && matchesWebsite;
  });

  // Aggregate by query for display
  const aggregatedRankings = filteredRankings.reduce((acc, r) => {
    const key = `${r.website_id}-${r.query}`;
    if (!acc[key]) {
      acc[key] = { ...r, totalClicks: 0, totalImpressions: 0, positions: [] };
    }
    acc[key].totalClicks += r.clicks;
    acc[key].totalImpressions += r.impressions;
    acc[key].positions.push(r.position);
    return acc;
  }, {} as Record<string, RankingData & { totalClicks: number; totalImpressions: number; positions: number[] }>);

  const sortedRankings = Object.values(aggregatedRankings)
    .sort((a, b) => b.totalClicks - a.totalClicks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">GSC Rankings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Google Search Console performance data
          </p>
        </div>
        <button
          onClick={syncGscData}
          disabled={syncing || !gscStatus.connected}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-60"
        >
          {syncing ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {syncing ? "Syncing..." : "Sync GSC Data"}
        </button>
      </div>

      {/* GSC Status Banner */}
      <div className={`rounded-xl p-4 flex items-center justify-between ${
        gscStatus.connected
          ? "bg-emerald-500/10 border border-emerald-500/20"
          : "bg-amber-500/10 border border-amber-500/20"
      }`}>
        <div className="flex items-center gap-3">
          {gscStatus.connected ? (
            <CheckCircle size={18} className="text-emerald-600" />
          ) : (
            <AlertTriangle size={18} className="text-amber-600" />
          )}
          <div>
            <div className={gscStatus.connected ? "text-emerald-600" : "text-amber-600"}>
              Google Search Console: {gscStatus.connected ? "Connected" : "Not Connected"}
            </div>
            {gscStatus.lastSync && (
              <div className="text-xs text-slate-500">
                Last sync: {new Date(gscStatus.lastSync).toLocaleString()}
              </div>
            )}
          </div>
        </div>
        {!gscStatus.connected && (
          <Link
            to="/daily-checks/settings"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium"
          >
            Connect GSC
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search queries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={websiteFilter}
          onChange={(e) => setWebsiteFilter(e.target.value ? Number(e.target.value) : "")}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Websites</option>
          {websites.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Position Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-400">Top 3</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-400">4-10</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-slate-400">11-20</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-400">20+</span>
        </div>
      </div>

      {/* Rankings Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : sortedRankings.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-2">No ranking data yet</p>
          <p className="text-sm text-slate-500">
            {gscStatus.connected
              ? "Click 'Sync GSC Data' to import your Search Console data"
              : "Connect Google Search Console to see ranking data"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-3 font-medium text-slate-400">Query</th>
                  <th className="px-4 py-3 font-medium text-slate-400">Website</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-right">Clicks</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-right">Impressions</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-right">CTR</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody>
                {sortedRankings.map((ranking, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100/30">
                    <td className="px-4 py-3 font-medium">{ranking.query}</td>
                    <td className="px-4 py-3 text-slate-400">{ranking.website_name}</td>
                    <td className="px-4 py-3 text-right font-medium">{ranking.totalClicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{ranking.totalImpressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{ranking.ctr.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right">{getPositionBadge(ranking.position)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {sortedRankings.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl font-semibold">
              {sortedRankings.reduce((sum, r) => sum + r.totalClicks, 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Total Clicks</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl font-semibold">
              {sortedRankings.reduce((sum, r) => sum + r.totalImpressions, 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Total Impressions</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl font-semibold">
              {(sortedRankings.reduce((sum, r) => sum + r.ctr, 0) / sortedRankings.length).toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">Avg CTR</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl font-semibold">
              {(sortedRankings.reduce((sum, r) => sum + r.position, 0) / sortedRankings.length).toFixed(1)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Avg Position</div>
          </div>
        </div>
      )}
    </div>
  );
}
