import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabase";
import { Loader2, Download, ExternalLink, AlertTriangle, X } from "lucide-react";

type FirecrawlDoc = {
  markdown?: string;
  html?: string;
  metadata?: {
    sourceURL?: string;
    title?: string;
    description?: string;
  };
};

export default function Crawl() {
  const [url, setUrl] = useState("");
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<FirecrawlDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<FirecrawlDoc | null>(null);
  const [hasRecentCreditError, setHasRecentCreditError] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const lastCreditError = localStorage.getItem("firecrawl_last_402_error");
    if (lastCreditError) {
      const errorTime = parseInt(lastCreditError, 10);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - errorTime < twentyFourHours) {
        setHasRecentCreditError(true);
      }
    }
  }, []);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDocs([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("firecrawl-crawl", {
        body: { url, limit },
      });

      if (error) {
        if (error.message?.includes("402") || error.message?.includes("credit")) {
          localStorage.setItem("firecrawl_last_402_error", Date.now().toString());
          setHasRecentCreditError(true);
        }
        throw error;
      }

      setDocs(data.data || data.docs || []);
      showFeedback("success", `Crawled ${data.data?.length || data.docs?.length || 0} pages`);
    } catch (error) {
      console.error("Error crawling site:", error);
      showFeedback("error", error instanceof Error ? error.message : "Failed to crawl site");
    } finally {
      setLoading(false);
    }
  };

  const exportAll = () => {
    const allContent = docs.map((doc, idx) => ({
      index: idx + 1,
      url: doc.metadata?.sourceURL,
      title: doc.metadata?.title,
      markdown: doc.markdown,
    }));
    const blob = new Blob([JSON.stringify(allContent, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "crawl-results.json";
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Site Crawl</h1>

      {feedback && (
        <div className={`mb-4 p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {feedback.message}
        </div>
      )}

      {hasRecentCreditError && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
          <p className="text-red-300 text-sm">
            Your Firecrawl credits may be exhausted. Please check your Firecrawl account or add more credits.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
        <form onSubmit={handleCrawl} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-2">Website URL</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-slate-300 mb-2">Max Pages</label>
            <input
              id="limit"
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Crawl Site
          </button>
        </form>
      </div>

      {docs.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Crawled {docs.length} Pages</h2>
            <button onClick={exportAll} className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
              <Download className="h-4 w-4" />
              Export All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="text-left p-2 text-slate-400 text-sm">#</th>
                  <th className="text-left p-2 text-slate-400 text-sm">Title</th>
                  <th className="text-left p-2 text-slate-400 text-sm">URL</th>
                  <th className="text-right p-2 text-slate-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-2 text-slate-500">{idx + 1}</td>
                    <td className="p-2 text-slate-300 truncate max-w-xs">{doc.metadata?.title || "Untitled"}</td>
                    <td className="p-2">
                      <a href={doc.metadata?.sourceURL} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                        <span className="truncate max-w-xs">{doc.metadata?.sourceURL}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="p-2 text-right">
                      <button onClick={() => setSelectedDoc(doc)} className="px-3 py-1 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">{selectedDoc.metadata?.title || "Page Content"}</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
              <div className="prose prose-sm prose-invert max-w-none">
                {selectedDoc.markdown && (
                  <div className="text-slate-300 whitespace-pre-wrap">{selectedDoc.markdown}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
