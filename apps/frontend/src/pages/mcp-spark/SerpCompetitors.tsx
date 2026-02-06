import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Search, Loader2, Globe, ExternalLink, TrendingUp } from "lucide-react";

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

interface SerpCompetitor {
  domain: string;
  rank: number;
  title: string;
  url: string;
  snippet?: string;
  domain_rank?: number;
  organic_count?: number;
}

export default function SerpCompetitors() {
  const [keyword, setKeyword] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [languageCode, setLanguageCode] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [competitors, setCompetitors] = useState<SerpCompetitor[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      showFeedback("error", "Please enter a keyword");
      return;
    }

    setIsLoading(true);
    setCompetitors([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("serp-competitors", {
        body: {
          keyword: keyword.trim(),
          locationCode,
          languageCode,
        },
      });

      if (error) throw error;

      if (data?.competitors) {
        setCompetitors(data.competitors);
        showFeedback("success", `Found ${data.competitors.length} competitors`);
      }
    } catch (err: any) {
      console.error("SERP competitors error:", err);
      showFeedback("error", err.message || "Failed to fetch SERP competitors");
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
          <Search className="h-6 w-6 text-blue-600" />
          SERP Competitors
        </h1>
        <p className="text-slate-400">Analyze who ranks for your target keywords</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Keyword Analysis</h2>
          <p className="text-sm text-slate-400">Enter a keyword to see which domains are competing in the SERPs</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-600 mb-2 block">Target Keyword</label>
              <input
                placeholder="Enter your target keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
          </div>

          <button
            onClick={handleSearch}
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
                Find Competitors
              </>
            )}
          </button>
        </div>
      </div>

      {competitors.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              SERP Results for "{keyword}"
            </h2>
            <p className="text-sm text-slate-400">{competitors.length} domains competing for this keyword</p>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 w-16 text-slate-400 text-sm font-medium">Rank</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Domain</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Title</th>
                  <th className="text-right p-3 text-slate-400 text-sm font-medium">Domain Rank</th>
                  <th className="text-right p-3 text-slate-400 text-sm font-medium">Organic Keywords</th>
                  <th className="w-16 text-center p-3 text-slate-400 text-sm font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-xs rounded ${comp.rank <= 3 ? "bg-green-500/20 text-green-400" : comp.rank <= 10 ? "bg-blue-500/20 text-blue-600" : "bg-slate-200 text-slate-400"}`}>
                        {comp.rank}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-white">{comp.domain}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-600 line-clamp-1 max-w-xs">{comp.title}</span>
                    </td>
                    <td className="p-3 text-right text-slate-400">{formatNumber(comp.domain_rank)}</td>
                    <td className="p-3 text-right text-slate-400">{formatNumber(comp.organic_count)}</td>
                    <td className="p-3 text-center">
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {competitors.length === 0 && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="text-center space-y-4">
            <Search className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Discover SERP competitors</p>
            <p className="text-sm text-slate-400">Enter a keyword to see who is ranking for it</p>
          </div>
        </div>
      )}
    </div>
  );
}
