import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Loader2, Copy, Download, ExternalLink } from "lucide-react";

export default function MapTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleMap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUrls([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("firecrawl-map", {
        body: { url },
      });

      if (error) throw error;

      setUrls(data.links || data.urls || []);
      showFeedback("success", `Found ${data.links?.length || data.urls?.length || 0} URLs`);
    } catch (error) {
      console.error("Error mapping site:", error);
      showFeedback("error", error instanceof Error ? error.message : "Failed to map site");
    } finally {
      setLoading(false);
    }
  };

  const filteredUrls = urls.filter((u) =>
    u.toLowerCase().includes(filter.toLowerCase())
  );

  const copyURLs = () => {
    navigator.clipboard.writeText(filteredUrls.join("\n"));
    showFeedback("success", `${filteredUrls.length} URLs copied to clipboard`);
  };

  const exportCSV = () => {
    const csv = ["URL", ...filteredUrls].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "site-map.csv";
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">URL Map</h1>

      {feedback && (
        <div className={`mb-4 p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 mb-6">
        <form onSubmit={handleMap} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-600 mb-2">Website URL</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Map Site
          </button>
        </form>
      </div>

      {urls.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-white">
              Found {filteredUrls.length} URLs
              {filter && ` (filtered from ${urls.length})`}
            </h2>
            <div className="flex gap-2">
              <button onClick={copyURLs} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition-colors">
                <Copy className="h-4 w-4" />
                Copy URLs
              </button>
              <button onClick={exportCSV} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition-colors">
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Filter URLs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left p-2 text-slate-400 text-sm">#</th>
                  <th className="text-left p-2 text-slate-400 text-sm">URL</th>
                  <th className="text-right p-2 text-slate-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUrls.map((urlItem, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100">
                    <td className="p-2 text-slate-500">{idx + 1}</td>
                    <td className="p-2">
                      <a href={urlItem} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 break-all">
                        {urlItem}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(urlItem);
                          showFeedback("success", "URL copied to clipboard");
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
