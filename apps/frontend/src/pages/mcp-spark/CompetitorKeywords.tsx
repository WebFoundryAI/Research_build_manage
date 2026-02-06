import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Users, Loader2, Download, Search, TrendingUp, TrendingDown, Minus, Globe, Link as LinkIcon, ArrowRightLeft } from "lucide-react";

const LOCATION_OPTIONS = [
  { code: 2840, name: "United States" },
  { code: 2826, name: "United Kingdom" },
  { code: 2124, name: "Canada" },
  { code: 2036, name: "Australia" },
];

const LANGUAGE_OPTIONS = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
];

interface KeywordData {
  keyword: string;
  your_rank?: number;
  competitor_rank?: number;
  search_volume: number;
  your_url?: string;
  competitor_url?: string;
  rank_difference?: number;
}

interface BacklinksData {
  backlinks: number;
  referring_domains: number;
  referring_ips: number;
}

interface CompetitorData {
  your_domain: string;
  competitor_domain: string;
  keyword_gaps: KeywordData[];
  overlapping_keywords: KeywordData[];
  unique_keywords: KeywordData[];
  backlinks: {
    your_domain: BacklinksData;
    competitor_domain: BacklinksData;
  };
  summary: {
    your_total_keywords: number;
    competitor_total_keywords: number;
    keyword_gaps_count: number;
    overlapping_count: number;
    unique_to_you_count: number;
  };
}

export default function CompetitorKeywords() {
  const [yourDomain, setYourDomain] = useState("");
  const [competitorDomain, setCompetitorDomain] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [languageCode, setLanguageCode] = useState("en");
  const [limit, setLimit] = useState(200);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CompetitorData | null>(null);
  const [activeTab, setActiveTab] = useState<"gaps" | "overlapping" | "unique">("gaps");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAnalyze = async () => {
    if (!yourDomain.trim() || !competitorDomain.trim()) {
      showFeedback("error", "Please enter both domains");
      return;
    }

    setIsLoading(true);
    setData(null);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data: result, error } = await supabase.functions.invoke("competitor-analyze", {
        body: {
          yourDomain: yourDomain.trim(),
          competitorDomain: competitorDomain.trim(),
          locationCode,
          languageCode,
          limit,
        },
      });

      if (error) throw error;

      if (result?.ok && result?.data) {
        setData(result.data);
        showFeedback("success", "Competitor analysis complete!");
      } else if (result?.error) {
        throw new Error(result.error.message || "Analysis failed");
      }
    } catch (err: any) {
      console.error("Competitor analysis error:", err);
      showFeedback("error", err.message || "Failed to analyze competitors");
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRankBadge = (rank: number | undefined) => {
    if (!rank) return <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-400">N/A</span>;
    if (rank <= 3) return <span className="px-2 py-0.5 text-xs bg-green-500/20 rounded text-green-400">{rank}</span>;
    if (rank <= 10) return <span className="px-2 py-0.5 text-xs bg-blue-500/20 rounded text-blue-600">{rank}</span>;
    if (rank <= 20) return <span className="px-2 py-0.5 text-xs bg-yellow-500/20 rounded text-yellow-400">{rank}</span>;
    return <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-400">{rank}</span>;
  };

  const getDifferenceBadge = (diff: number | undefined) => {
    if (diff === undefined) return null;
    if (diff > 0) return (
      <span className="px-2 py-0.5 text-xs bg-green-500/20 rounded text-green-400 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />+{diff}
      </span>
    );
    if (diff < 0) return (
      <span className="px-2 py-0.5 text-xs bg-red-500/20 rounded text-red-600 flex items-center gap-1">
        <TrendingDown className="h-3 w-3" />{diff}
      </span>
    );
    return <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-400"><Minus className="h-3 w-3" /></span>;
  };

  const handleExport = () => {
    if (!data) return;
    const allKeywords = [...data.keyword_gaps, ...data.overlapping_keywords, ...data.unique_keywords];
    const csv = [
      "Keyword,Your Rank,Competitor Rank,Search Volume,Difference",
      ...allKeywords.map((kw) => `"${kw.keyword}",${kw.your_rank || ""},${kw.competitor_rank || ""},${kw.search_volume},${kw.rank_difference || ""}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `competitor-analysis-${yourDomain}-vs-${competitorDomain}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback("success", "Export started");
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
          <Users className="h-6 w-6 text-blue-600" />
          Competitor Keywords
        </h1>
        <p className="text-slate-400">Compare keyword rankings between your domain and competitors</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Domain Comparison
          </h2>
          <p className="text-sm text-slate-400">Compare your domain against a competitor to find keyword gaps</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Your Domain</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  placeholder="yourdomain.com"
                  value={yourDomain}
                  onChange={(e) => setYourDomain(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Competitor Domain</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  placeholder="competitor.com"
                  value={competitorDomain}
                  onChange={(e) => setCompetitorDomain(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Location</label>
              <select
                value={locationCode}
                onChange={(e) => setLocationCode(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc.code} value={loc.code}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Language</label>
              <select
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Keyword Limit</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={100}>100 keywords</option>
                <option value={200}>200 keywords</option>
                <option value={300}>300 keywords</option>
                <option value={500}>500 keywords</option>
              </select>
            </div>
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
                <Search className="h-4 w-4" />
                Analyze Competitors
              </>
            )}
          </button>
        </div>
      </div>

      {data && (
        <>
          <div className="flex justify-end">
            <button onClick={handleExport} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1 transition-colors">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-white">{data.summary.your_total_keywords}</div>
              <p className="text-xs text-slate-400">Your Keywords</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-white">{data.summary.competitor_total_keywords}</div>
              <p className="text-xs text-slate-400">Competitor Keywords</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{data.summary.keyword_gaps_count}</div>
              <p className="text-xs text-slate-400">Keyword Gaps</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{data.summary.overlapping_count}</div>
              <p className="text-xs text-slate-400">Overlapping</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{data.summary.unique_to_you_count}</div>
              <p className="text-xs text-slate-400">Unique to You</p>
            </div>
          </div>

          {/* Backlinks Comparison */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Backlinks Comparison
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-2 text-white">{data.your_domain}</h4>
                <div className="space-y-1 text-sm">
                  <div className="text-slate-400">Backlinks: <span className="font-semibold text-white">{formatNumber(data.backlinks.your_domain.backlinks)}</span></div>
                  <div className="text-slate-400">Referring Domains: <span className="font-semibold text-white">{formatNumber(data.backlinks.your_domain.referring_domains)}</span></div>
                  <div className="text-slate-400">Referring IPs: <span className="font-semibold text-white">{formatNumber(data.backlinks.your_domain.referring_ips)}</span></div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-white">{data.competitor_domain}</h4>
                <div className="space-y-1 text-sm">
                  <div className="text-slate-400">Backlinks: <span className="font-semibold text-white">{formatNumber(data.backlinks.competitor_domain.backlinks)}</span></div>
                  <div className="text-slate-400">Referring Domains: <span className="font-semibold text-white">{formatNumber(data.backlinks.competitor_domain.referring_domains)}</span></div>
                  <div className="text-slate-400">Referring IPs: <span className="font-semibold text-white">{formatNumber(data.backlinks.competitor_domain.referring_ips)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords Table */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("gaps")}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === "gaps" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-100"}`}
                >
                  Keyword Gaps ({data.keyword_gaps.length})
                </button>
                <button
                  onClick={() => setActiveTab("overlapping")}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === "overlapping" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-100"}`}
                >
                  Overlapping ({data.overlapping_keywords.length})
                </button>
                <button
                  onClick={() => setActiveTab("unique")}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === "unique" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-100"}`}
                >
                  Unique to You ({data.unique_keywords.length})
                </button>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 text-slate-400 text-sm font-medium">Keyword</th>
                    {activeTab !== "gaps" && <th className="text-center p-3 text-slate-400 text-sm font-medium">Your Rank</th>}
                    {activeTab !== "unique" && <th className="text-center p-3 text-slate-400 text-sm font-medium">Competitor Rank</th>}
                    <th className="text-right p-3 text-slate-400 text-sm font-medium">Volume</th>
                    {activeTab === "overlapping" && <th className="text-center p-3 text-slate-400 text-sm font-medium">Difference</th>}
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === "gaps" ? data.keyword_gaps : activeTab === "overlapping" ? data.overlapping_keywords : data.unique_keywords).slice(0, 100).map((kw, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-3 text-white">{kw.keyword}</td>
                      {activeTab !== "gaps" && <td className="p-3 text-center">{getRankBadge(kw.your_rank)}</td>}
                      {activeTab !== "unique" && <td className="p-3 text-center">{getRankBadge(kw.competitor_rank)}</td>}
                      <td className="p-3 text-right text-slate-600">{formatNumber(kw.search_volume)}</td>
                      {activeTab === "overlapping" && <td className="p-3 text-center">{getDifferenceBadge(kw.rank_difference)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
