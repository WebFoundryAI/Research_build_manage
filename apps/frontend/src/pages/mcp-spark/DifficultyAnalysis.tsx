import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Target, Loader2, Download, Search, AlertTriangle, CheckCircle } from "lucide-react";

interface DifficultyResult {
  keyword: string;
  difficulty: number | null;
  search_volume: number | null;
  cpc: number | null;
  recommendation: "easy" | "medium" | "hard" | "very_hard";
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];

export default function DifficultyAnalysis() {
  const [keywords, setKeywords] = useState("");
  const [country, setCountry] = useState("US");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DifficultyResult[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAnalyze = async () => {
    const keywordList = keywords.split("\n").map((k) => k.trim()).filter((k) => k.length > 0);

    if (keywordList.length === 0) {
      showFeedback("error", "Please enter at least one keyword");
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("keyword-difficulty", {
        body: {
          keywords: keywordList,
          country,
        },
      });

      if (error) throw error;

      const difficultyResults = data?.results || [];
      setResults(difficultyResults);
      showFeedback("success", `Analyzed ${difficultyResults.length} keywords`);
    } catch (error) {
      console.error("Analysis error:", error);
      showFeedback("error", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) return;
    const csv = [
      "Keyword,Difficulty,Search Volume,CPC,Recommendation",
      ...results.map((r) => `"${r.keyword}",${r.difficulty || ""},${r.search_volume || ""},${r.cpc || ""},${r.recommendation}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keyword-difficulty-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback("success", "Export started");
  };

  const getDifficultyColor = (difficulty: number | null) => {
    if (difficulty === null) return "bg-slate-200 text-slate-400";
    if (difficulty <= 30) return "bg-green-500/20 text-green-400";
    if (difficulty <= 50) return "bg-yellow-500/20 text-yellow-400";
    if (difficulty <= 70) return "bg-orange-500/20 text-orange-600";
    return "bg-red-500/20 text-red-600";
  };

  const getDifficultyLabel = (difficulty: number | null) => {
    if (difficulty === null) return "N/A";
    if (difficulty <= 30) return "Easy";
    if (difficulty <= 50) return "Medium";
    if (difficulty <= 70) return "Hard";
    return "Very Hard";
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return "-";
    return num.toLocaleString();
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {feedback && (
        <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Target className="h-6 w-6 text-blue-600" />
          Keyword Difficulty
        </h1>
        <p className="text-slate-400">Analyze how hard it is to rank for specific keywords</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Analyze Keywords</h2>
          <p className="text-sm text-slate-400">Enter keywords to check their ranking difficulty</p>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            placeholder={"best seo tools 2024\nkeyword research software\nbacklink checker free"}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
          <div className="flex gap-4 items-end">
            <div className="w-40">
              <label className="text-sm font-medium text-slate-600 mb-2 block">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Analyze Difficulty
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {keywords.split("\n").filter((k) => k.trim()).length} keywords entered
          </p>
        </div>
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Difficulty Results</h2>
              <p className="text-sm text-slate-400">{results.length} keywords analyzed</p>
            </div>
            <button onClick={handleExport} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1 transition-colors">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Keyword</th>
                  <th className="text-center p-3 text-slate-400 text-sm font-medium">Difficulty</th>
                  <th className="text-right p-3 text-slate-400 text-sm font-medium">Volume</th>
                  <th className="text-right p-3 text-slate-400 text-sm font-medium">CPC</th>
                  <th className="text-center p-3 text-slate-400 text-sm font-medium">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-slate-200">
                    <td className="p-3 text-white font-medium">{r.keyword}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${r.difficulty !== null && r.difficulty <= 30 ? "bg-green-500" : r.difficulty !== null && r.difficulty <= 50 ? "bg-yellow-500" : r.difficulty !== null && r.difficulty <= 70 ? "bg-orange-500" : "bg-red-500"}`}
                            style={{ width: `${r.difficulty || 0}%` }}
                          />
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded ${getDifficultyColor(r.difficulty)}`}>
                          {r.difficulty !== null ? r.difficulty : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-slate-600">{formatNumber(r.search_volume)}</td>
                    <td className="p-3 text-right text-slate-600">{r.cpc !== null ? `$${r.cpc.toFixed(2)}` : "-"}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${getDifficultyColor(r.difficulty)}`}>
                        {r.difficulty !== null && r.difficulty <= 50 ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {getDifficultyLabel(r.difficulty)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-medium text-white mb-3">Difficulty Scale</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Easy", range: "0-30", color: "bg-green-500" },
            { label: "Medium", range: "31-50", color: "bg-yellow-500" },
            { label: "Hard", range: "51-70", color: "bg-orange-500" },
            { label: "Very Hard", range: "71-100", color: "bg-red-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${item.color}`} />
              <span className="text-sm text-slate-400">{item.label} ({item.range})</span>
            </div>
          ))}
        </div>
      </div>

      {results.length === 0 && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="text-center space-y-4">
            <Target className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Analyze keyword difficulty</p>
            <p className="text-sm text-slate-400">Enter keywords to see how hard they are to rank for</p>
          </div>
        </div>
      )}
    </div>
  );
}
