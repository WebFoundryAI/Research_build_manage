import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Lightbulb, Loader2, Download, Search, Copy, CheckCircle } from "lucide-react";

interface KeywordIdea {
  keyword: string;
  search_volume: number | null;
  cpc: number | null;
  competition: number | null;
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];

export default function KeywordIdeas() {
  const [seedKeyword, setSeedKeyword] = useState("");
  const [country, setCountry] = useState("US");
  const [limit, setLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<KeywordIdea[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSearch = async () => {
    if (!seedKeyword.trim()) {
      showFeedback("error", "Please enter a seed keyword");
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("dataforseo", {
        body: {
          seedKeywords: [seedKeyword.trim()],
          country,
          language: "en",
          fetchKeywords: true,
          fetchSerp: false,
          keywordLimit: limit,
        },
      });

      if (error) throw error;

      const keywordResults = data?.keywords || [];
      const mapped: KeywordIdea[] = keywordResults.map((k: any) => ({
        keyword: k.keyword,
        search_volume: k.keyword_info?.search_volume ?? k.search_volume ?? null,
        cpc: k.keyword_info?.cpc ?? k.cpc ?? null,
        competition: k.keyword_info?.competition ?? k.competition ?? null,
      }));

      setResults(mapped);
      showFeedback("success", `Found ${mapped.length} keyword ideas`);
    } catch (error) {
      console.error("Search error:", error);
      showFeedback("error", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (keyword: string, index: number) => {
    await navigator.clipboard.writeText(keyword);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExport = () => {
    if (results.length === 0) return;
    const csv = [
      "Keyword,Search Volume,CPC,Competition",
      ...results.map((r) => `"${r.keyword}",${r.search_volume || ""},${r.cpc || ""},${r.competition || ""}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keyword-ideas-${seedKeyword}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback("success", "Export started");
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
          <Lightbulb className="h-6 w-6 text-yellow-400" />
          Keyword Ideas
        </h1>
        <p className="text-slate-400">Generate keyword suggestions from a seed keyword</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Generate Ideas</h2>
          <p className="text-sm text-slate-400">Enter a seed keyword to discover related terms</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-600 mb-2 block">Seed Keyword</label>
              <input
                placeholder="e.g., seo tools, digital marketing..."
                value={seedKeyword}
                onChange={(e) => setSeedKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSearch()}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
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
          </div>
          <div className="flex items-end gap-4">
            <div className="w-40">
              <label className="text-sm font-medium text-slate-600 mb-2 block">Max Results</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !seedKeyword.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4" />
                  Get Ideas
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {["seo software", "content marketing", "email automation"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSeedKeyword(suggestion)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Keyword Ideas</h2>
              <p className="text-sm text-slate-400">{results.length} suggestions for "{seedKeyword}"</p>
            </div>
            <button onClick={handleExport} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1 transition-colors">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
          <div className="p-6 max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Keyword</th>
                  <th className="text-right p-3 text-slate-400 text-sm font-medium">Volume</th>
                  <th className="text-right p-3 text-slate-400 text-sm font-medium">CPC</th>
                  <th className="text-right p-3 text-slate-400 text-sm font-medium">Competition</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-slate-200 hover:bg-slate-100 group">
                    <td className="p-3 text-white font-medium">{r.keyword}</td>
                    <td className="p-3 text-right text-slate-600">{formatNumber(r.search_volume)}</td>
                    <td className="p-3 text-right text-slate-600">{r.cpc !== null ? `$${r.cpc.toFixed(2)}` : "-"}</td>
                    <td className="p-3 text-right">
                      {r.competition !== null ? (
                        <span className={`px-2 py-0.5 text-xs rounded ${r.competition > 0.7 ? "bg-red-500/20 text-red-600" : r.competition > 0.3 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                          {(r.competition * 100).toFixed(0)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleCopy(r.keyword, i)}
                        className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-900 transition-all"
                      >
                        {copiedIndex === i ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length === 0 && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="text-center space-y-4">
            <Lightbulb className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Generate keyword ideas</p>
            <p className="text-sm text-slate-400">Enter a seed keyword to discover related terms</p>
          </div>
        </div>
      )}
    </div>
  );
}
