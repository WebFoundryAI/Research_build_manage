import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Layers, Loader2, Download, Sparkles, ChevronDown, ChevronRight } from "lucide-react";

interface Cluster {
  name: string;
  description: string;
  keywords: string[];
  contentOpportunity?: string;
  priority?: string;
  estimatedVolume?: number;
}

export default function KeywordClustering() {
  const [keywords, setKeywords] = useState("");
  const [seedKeyword, setSeedKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [openClusters, setOpenClusters] = useState<Set<number>>(new Set([0]));
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCluster = async () => {
    const keywordList = keywords.split("\n").map((k) => k.trim()).filter((k) => k.length > 0);

    if (keywordList.length < 5) {
      showFeedback("error", "Please enter at least 5 keywords for clustering");
      return;
    }

    setIsLoading(true);
    setClusters([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const formattedKeywords = keywordList.map((k) => ({
        keyword: k,
        search_volume: null,
      }));

      const { data, error } = await supabase.functions.invoke("cluster-keywords", {
        body: {
          keywords: formattedKeywords,
          seedKeyword: seedKeyword || keywordList[0],
        },
      });

      if (error) throw error;

      const clusterResults = data?.clusters || [];
      setClusters(clusterResults);
      setOpenClusters(new Set([0]));

      showFeedback("success", `Created ${clusterResults.length} clusters`);
    } catch (error) {
      console.error("Clustering error:", error);
      showFeedback("error", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (clusters.length === 0) return;

    const lines: string[] = ["# Keyword Clusters\n"];
    clusters.forEach((cluster, i) => {
      lines.push(`## ${i + 1}. ${cluster.name}`);
      lines.push(`${cluster.description}\n`);
      if (cluster.contentOpportunity) {
        lines.push(`**Content Opportunity:** ${cluster.contentOpportunity}`);
      }
      if (cluster.priority) {
        lines.push(`**Priority:** ${cluster.priority}`);
      }
      lines.push("\n**Keywords:**");
      cluster.keywords.forEach((k) => lines.push(`- ${k}`));
      lines.push("\n---\n");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keyword-clusters-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback("success", "Export started");
  };

  const toggleCluster = (index: number) => {
    const newOpen = new Set(openClusters);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenClusters(newOpen);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-slate-700 text-slate-400";
      default:
        return "bg-slate-700 text-slate-400";
    }
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
          <Layers className="h-6 w-6 text-blue-400" />
          Keyword Clustering
        </h1>
        <p className="text-slate-400">Group keywords into themed clusters for content planning</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Keywords to Cluster</h2>
          <p className="text-sm text-slate-400">Enter keywords (one per line, minimum 5)</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Seed Keyword (optional)</label>
            <input
              placeholder="Main topic (e.g., seo tools)"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            placeholder={"best seo tools\nseo software comparison\nfree keyword research\non page seo checker\nbacklink analysis tool"}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {keywords.split("\n").filter((k) => k.trim()).length} keywords entered
            </p>
            <button
              onClick={handleCluster}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Clustering...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Clusters
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {clusters.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Keyword Clusters</h2>
              <p className="text-sm text-slate-400">{clusters.length} clusters created</p>
            </div>
            <button onClick={handleExport} className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-1 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
          <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
            {clusters.map((cluster, index) => (
              <div key={index} className="rounded-lg border border-slate-700 overflow-hidden">
                <button
                  onClick={() => toggleCluster(index)}
                  className="w-full p-4 flex items-start justify-between hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {openClusters.has(index) ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    <div>
                      <h3 className="font-medium text-white">{cluster.name}</h3>
                      <p className="text-sm text-slate-400">{cluster.keywords.length} keywords</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {cluster.priority && (
                      <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(cluster.priority)}`}>
                        {cluster.priority}
                      </span>
                    )}
                    {cluster.estimatedVolume && (
                      <span className="px-2 py-0.5 text-xs bg-slate-700 rounded text-slate-400">
                        ~{cluster.estimatedVolume.toLocaleString()} vol
                      </span>
                    )}
                  </div>
                </button>

                {openClusters.has(index) && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-slate-400 mb-3">{cluster.description}</p>
                    {cluster.contentOpportunity && (
                      <div className="mb-3 p-3 rounded bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs font-medium text-blue-400 mb-1">Content Opportunity</p>
                        <p className="text-sm text-slate-300">{cluster.contentOpportunity}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {cluster.keywords.map((kw, ki) => (
                        <span key={ki} className="px-2 py-1 text-xs bg-slate-800 rounded text-slate-300">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {clusters.length === 0 && !isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12">
          <div className="text-center space-y-4">
            <Layers className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Group keywords into clusters</p>
            <p className="text-sm text-slate-400">Enter keywords to organize them by theme and intent</p>
          </div>
        </div>
      )}
    </div>
  );
}
