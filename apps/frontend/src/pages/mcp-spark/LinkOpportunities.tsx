import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Unlink, Loader2, Search, Globe, ExternalLink, Star, TrendingUp } from "lucide-react";

interface LinkOpportunity {
  domain: string;
  url: string;
  domain_rank: number;
  traffic: number;
  link_type: string;
  relevance_score: number;
  contact_page?: string;
}

export default function LinkOpportunities() {
  const [domain, setDomain] = useState("");
  const [niche, setNiche] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<LinkOpportunity[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFind = async () => {
    if (!domain.trim()) {
      showFeedback("error", "Please enter your domain");
      return;
    }

    setIsLoading(true);
    setOpportunities([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("link-opportunities", {
        body: {
          domain: domain.trim(),
          niche: niche.trim() || undefined,
        },
      });

      if (error) throw error;

      if (data?.opportunities) {
        setOpportunities(data.opportunities);
        showFeedback("success", `Found ${data.opportunities.length} link opportunities`);
      }
    } catch (err: any) {
      console.error("Link opportunities error:", err);
      showFeedback("error", err.message || "Failed to find link opportunities");
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

  const getRelevanceBadge = (score: number) => {
    if (score >= 80) return <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">High</span>;
    if (score >= 50) return <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">Medium</span>;
    return <span className="px-2 py-0.5 text-xs bg-slate-200 text-slate-400 rounded">Low</span>;
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
          <Unlink className="h-6 w-6 text-blue-600" />
          Link Opportunities
        </h1>
        <p className="text-slate-400">Discover websites that might link to your content</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Find Link Prospects</h2>
          <p className="text-sm text-slate-400">Analyze competitors and find potential link building opportunities</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Your Domain</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  placeholder="yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Niche/Topic (Optional)</label>
              <input
                placeholder="e.g., digital marketing, fitness, tech"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleFind}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find Opportunities
              </>
            )}
          </button>
        </div>
      </div>

      {opportunities.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Link Opportunities ({opportunities.length})
            </h2>
            <p className="text-sm text-slate-400">Websites that might be interested in linking to your content</p>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Domain</th>
                  <th className="text-center p-3 text-slate-400 text-sm font-medium">Domain Rank</th>
                  <th className="text-right p-3 text-slate-400 text-sm font-medium">Traffic</th>
                  <th className="text-center p-3 text-slate-400 text-sm font-medium">Type</th>
                  <th className="text-center p-3 text-slate-400 text-sm font-medium">Relevance</th>
                  <th className="w-16 text-center p-3 text-slate-400 text-sm font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-white">{opp.domain}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-600">{opp.domain_rank || "N/A"}</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-600">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        {formatNumber(opp.traffic)}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-400">{opp.link_type}</span>
                    </td>
                    <td className="p-3 text-center">{getRelevanceBadge(opp.relevance_score)}</td>
                    <td className="p-3 text-center">
                      <a
                        href={opp.url}
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

      {opportunities.length === 0 && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="text-center space-y-4">
            <Unlink className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Find link building opportunities</p>
            <p className="text-sm text-slate-400">Enter your domain to discover potential link prospects</p>
          </div>
        </div>
      )}
    </div>
  );
}
