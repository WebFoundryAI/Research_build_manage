import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { BarChart, Loader2, Search, Globe, TrendingUp, Target, Link2, Award } from "lucide-react";

const LOCATION_OPTIONS = [
  { code: 2840, name: "United States" },
  { code: 2826, name: "United Kingdom" },
  { code: 2124, name: "Canada" },
  { code: 2036, name: "Australia" },
];

interface DomainMetrics {
  domain: string;
  domain_rank: number;
  organic_traffic: number;
  organic_keywords: number;
  backlinks: number;
  referring_domains: number;
  top_keywords: Array<{
    keyword: string;
    position: number;
    search_volume: number;
    traffic_share: number;
  }>;
}

export default function DomainAnalytics() {
  const [domain, setDomain] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<DomainMetrics | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAnalyze = async () => {
    if (!domain.trim()) {
      showFeedback("error", "Please enter a domain");
      return;
    }

    setIsLoading(true);
    setMetrics(null);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("domain-analytics", {
        body: {
          domain: domain.trim(),
          locationCode,
        },
      });

      if (error) throw error;

      if (data?.metrics) {
        setMetrics(data.metrics);
        showFeedback("success", "Domain analysis complete");
      }
    } catch (err: any) {
      console.error("Domain analytics error:", err);
      showFeedback("error", err.message || "Failed to analyze domain");
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {feedback && (
        <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {feedback.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <BarChart className="h-6 w-6 text-blue-400" />
          Domain Analytics
        </h1>
        <p className="text-slate-400">Get comprehensive SEO metrics for any domain</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Domain Analysis</h2>
          <p className="text-sm text-slate-400">Analyze traffic, rankings, backlinks, and top keywords</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-300 mb-2 block">Domain</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Location</label>
              <select
                value={locationCode}
                onChange={(e) => setLocationCode(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc.code} value={loc.code}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Domain
              </>
            )}
          </button>
        </div>
      </div>

      {metrics && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-slate-400">Domain Rank</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatNumber(metrics.domain_rank)}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-slate-400">Organic Traffic</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatNumber(metrics.organic_traffic)}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-slate-400">Organic Keywords</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatNumber(metrics.organic_keywords)}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-slate-400">Backlinks</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatNumber(metrics.backlinks)}</div>
            </div>
          </div>

          {/* Top Keywords */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Top Ranking Keywords</h2>
              <p className="text-sm text-slate-400">Keywords driving the most traffic to this domain</p>
            </div>
            <div className="p-6 space-y-4">
              {metrics.top_keywords.slice(0, 10).map((kw, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className={`w-10 text-center px-2 py-0.5 text-xs rounded ${kw.position <= 3 ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"}`}>
                    {kw.position}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{kw.keyword}</div>
                    <div className="text-xs text-slate-500">
                      {formatNumber(kw.search_volume)} monthly searches
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-300">{kw.traffic_share.toFixed(1)}%</div>
                    <div className="w-20 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${Math.min(kw.traffic_share, 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {metrics.top_keywords.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No ranking keywords found</p>
              )}
            </div>
          </div>
        </>
      )}

      {!metrics && !isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12">
          <div className="text-center space-y-4">
            <BarChart className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Analyze any domain</p>
            <p className="text-sm text-slate-400">Enter a domain to get comprehensive SEO metrics</p>
          </div>
        </div>
      )}
    </div>
  );
}
