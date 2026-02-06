import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Loader2, Download, ExternalLink, X } from "lucide-react";

type FirecrawlDoc = {
  markdown?: string;
  metadata?: {
    sourceURL?: string;
    title?: string;
    description?: string;
  };
};

export default function SearchTool() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<FirecrawlDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<FirecrawlDoc | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDocs([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("firecrawl-search", {
        body: { query, limit },
      });

      if (error) throw error;

      setDocs(data.data || data.docs || []);
      showFeedback("success", `Found ${data.data?.length || data.docs?.length || 0} results`);
    } catch (error) {
      console.error("Error searching web:", error);
      showFeedback("error", error instanceof Error ? error.message : "Failed to search web");
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    const results = docs.map((doc, idx) => ({
      index: idx + 1,
      url: doc.metadata?.sourceURL,
      title: doc.metadata?.title,
      markdown: doc.markdown,
    }));
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "search-results.json";
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Web Search + Scrape</h1>

      {feedback && (
        <div className={`mb-4 p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-slate-600 mb-2">Search Query</label>
            <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              required
              className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-slate-600 mb-2">Max Results</label>
            <input
              id="limit"
              type="number"
              min={1}
              max={50}
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
              className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Search & Scrape
          </button>
        </form>
      </div>

      {docs.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Found {docs.length} Results</h2>
            <button onClick={exportResults} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition-colors">
              <Download className="h-4 w-4" />
              Export Results
            </button>
          </div>

          <div className="space-y-4">
            {docs.map((doc, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 bg-slate-100 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{doc.metadata?.title || "Untitled"}</h3>
                    <a href={doc.metadata?.sourceURL} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <span className="truncate">{doc.metadata?.sourceURL}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                    {doc.metadata?.description && (
                      <p className="text-sm text-slate-400 mt-2 line-clamp-2">{doc.metadata.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    View Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-white">{selectedDoc.metadata?.title || "Page Content"}</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
              <div className="prose prose-sm prose-invert max-w-none">
                {selectedDoc.markdown && (
                  <div className="text-slate-600 whitespace-pre-wrap">{selectedDoc.markdown}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
