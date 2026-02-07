import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Link2, Loader2, Search, Globe, ExternalLink, ArrowUpRight, Shield } from "lucide-react";

interface BacklinkData {
  source_url: string;
  source_domain: string;
  target_url: string;
  anchor_text: string;
  domain_rank: number;
  is_dofollow: boolean;
  first_seen: string;
}

interface BacklinkSummary {
  total_backlinks: number;
  referring_domains: number;
  referring_ips: number;
  dofollow_links: number;
  nofollow_links: number;
}

export default function Backlinks() {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<BacklinkSummary | null>(null);
  const [backlinks, setBacklinks] = useState<BacklinkData[]>([]);
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
    setSummary(null);
    setBacklinks([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("backlinks-analysis", {
        body: {
          domain: domain.trim(),
        },
      });

      if (error) throw error;

      if (data) {
        setSummary(data.summary || null);
        setBacklinks(data.backlinks || []);
        showFeedback("success", "Backlink analysis complete");
      }
    } catch (err: any) {
      console.error("Backlinks error:", err);
      showFeedback("error", err.message || "Failed to analyze backlinks");
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
        <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Link2 className="h-6 w-6 text-blue-600" />
          Backlink Analysis
        </h1>
        <p className="text-slate-400">Analyze backlinks and referring domains for any website</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Domain Backlinks</h2>
          <p className="text-sm text-slate-400">Enter a domain to analyze its backlink profile</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-600 mb-2 block">Domain</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                Analyze Backlinks
              </>
            )}
          </button>
        </div>
      </div>

      {summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(summary.total_backlinks)}</div>
              <p className="text-xs text-slate-400">Total Backlinks</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-white">{formatNumber(summary.referring_domains)}</div>
              <p className="text-xs text-slate-400">Referring Domains</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-white">{formatNumber(summary.referring_ips)}</div>
              <p className="text-xs text-slate-400">Referring IPs</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{formatNumber(summary.dofollow_links)}</div>
              <p className="text-xs text-slate-400">Dofollow Links</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{formatNumber(summary.nofollow_links)}</div>
              <p className="text-xs text-slate-400">Nofollow Links</p>
            </div>
          </div>

          {/* Backlinks Table */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5" />
                Top Backlinks
              </h2>
            </div>
            <div className="p-6 max-h-96 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 text-slate-400 text-sm font-medium">Source Domain</th>
                    <th className="text-left p-3 text-slate-400 text-sm font-medium">Anchor Text</th>
                    <th className="text-center p-3 text-slate-400 text-sm font-medium">Domain Rank</th>
                    <th className="text-center p-3 text-slate-400 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-slate-400 text-sm font-medium">First Seen</th>
                    <th className="w-16 text-center p-3 text-slate-400 text-sm font-medium">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {backlinks.slice(0, 50).map((link, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-500" />
                          <span className="font-medium text-white">{link.source_domain}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-600 line-clamp-1 max-w-xs">{link.anchor_text || "-"}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-600">{link.domain_rank || "N/A"}</span>
                      </td>
                      <td className="p-3 text-center">
                        {link.is_dofollow ? (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded flex items-center gap-1 justify-center">
                            <Shield className="h-3 w-3" />
                            Dofollow
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs bg-slate-200 text-slate-400 rounded">Nofollow</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-slate-500">
                        {link.first_seen ? new Date(link.first_seen).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <a
                          href={link.source_url}
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
              {backlinks.length === 0 && (
                <p className="text-center text-slate-400 py-8">No backlinks found</p>
              )}
            </div>
          </div>
        </>
      )}

      {!summary && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="text-center space-y-4">
            <Link2 className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Analyze backlink profile</p>
            <p className="text-sm text-slate-400">Enter a domain to see its backlinks and referring domains</p>
          </div>
        </div>
      )}
    </div>
  );
}
