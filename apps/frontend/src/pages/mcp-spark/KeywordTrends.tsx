import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { LineChart as LineChartIcon, Loader2, TrendingUp, TrendingDown, Minus, Search } from "lucide-react";

interface TrendData {
  keyword: string;
  trend: "rising" | "falling" | "stable";
  percentChange: number;
  currentVolume: number;
  history: { month: string; volume: number }[];
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];

export default function KeywordTrends() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("US");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TrendData[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      showFeedback("error", "Please enter a keyword to analyze");
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("keyword-trends", {
        body: {
          keyword: keyword.trim(),
          country,
        },
      });

      if (error) throw error;

      const trendResults = data?.trends || [];
      setResults(trendResults);

      showFeedback("success", `Found trend data for ${trendResults.length} keywords`);
    } catch (error) {
      console.error("Trends error:", error);
      showFeedback("error", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "rising") return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (trend === "falling") return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-slate-500" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "rising") return "text-green-400";
    if (trend === "falling") return "text-red-400";
    return "text-slate-400";
  };

  const getTrendBg = (trend: string) => {
    if (trend === "rising") return "bg-green-500/20";
    if (trend === "falling") return "bg-red-500/20";
    return "bg-slate-700";
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
          <LineChartIcon className="h-6 w-6 text-blue-400" />
          Keyword Trends
        </h1>
        <p className="text-slate-400">Analyze search volume trends over time</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Trend Analysis</h2>
          <p className="text-sm text-slate-400">Enter a keyword to see its search trend</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              placeholder="e.g., artificial intelligence"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSearch()}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-40 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {["chatgpt", "remote work", "electric vehicles", "sustainable fashion"].map((s) => (
              <button
                key={s}
                onClick={() => setKeyword(s)}
                className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            <p className="text-slate-400">Loading trend data...</p>
          </div>
        </div>
      )}

      {results.length > 0 && !isLoading && (
        <>
          {/* Trend Chart Placeholder */}
          {results[0].history && results[0].history.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-white">Search Volume Trend</h2>
                <p className="text-sm text-slate-400">Monthly search volume over the past year</p>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-end gap-2">
                  {results[0].history.map((h, i) => {
                    const maxVol = Math.max(...results[0].history.map((x) => x.volume));
                    const height = maxVol > 0 ? (h.volume / maxVol) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400"
                          style={{ height: `${height}%`, minHeight: h.volume > 0 ? "4px" : "0" }}
                          title={`${h.month}: ${h.volume.toLocaleString()}`}
                        />
                        <span className="text-xs text-slate-500 rotate-45 origin-left">{h.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Trend Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Trend Summary</h2>
            </div>
            <div className="p-6 max-h-[300px] overflow-y-auto space-y-4">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(r.trend)}
                    <div>
                      <p className="font-medium text-white">{r.keyword}</p>
                      <p className="text-sm text-slate-400">
                        Current: {r.currentVolume.toLocaleString()} monthly searches
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getTrendColor(r.trend)}`}>
                      {r.percentChange > 0 ? "+" : ""}{r.percentChange}%
                    </p>
                    <span className={`px-2 py-0.5 text-xs rounded ${getTrendBg(r.trend)} ${getTrendColor(r.trend)}`}>
                      {r.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {results.length === 0 && !isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12">
          <div className="text-center space-y-4">
            <LineChartIcon className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Discover keyword trends</p>
            <p className="text-sm text-slate-400">Enter a keyword to see how its search volume has changed over time</p>
          </div>
        </div>
      )}
    </div>
  );
}
