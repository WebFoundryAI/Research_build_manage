import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Loader2, Copy, Download } from "lucide-react";

type FirecrawlDoc = {
  markdown?: string;
  html?: string;
  metadata?: {
    sourceURL?: string;
    title?: string;
    description?: string;
  };
  json?: unknown;
};

export default function Scrape() {
  const [url, setUrl] = useState("");
  const [formats, setFormats] = useState({
    markdown: true,
    html: true,
    json: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FirecrawlDoc | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "html" | "json">("preview");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const selectedFormats = Object.entries(formats)
        .filter(([_, enabled]) => enabled)
        .map(([format]) => format);

      const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url, formats: selectedFormats },
      });

      if (error) throw error;

      setResult(data.data || data.doc || data);
      showFeedback("success", "URL scraped successfully");
    } catch (error) {
      console.error("Error scraping URL:", error);
      showFeedback("error", error instanceof Error ? error.message : "Failed to scrape URL");
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdown = () => {
    if (result?.markdown) {
      navigator.clipboard.writeText(result.markdown);
      showFeedback("success", "Markdown copied to clipboard");
    }
  };

  const downloadJSON = () => {
    if (result?.json) {
      const blob = new Blob([JSON.stringify(result.json, null, 2)], { type: "application/json" });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "scraped-data.json";
      a.click();
      URL.revokeObjectURL(downloadUrl);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Single URL Scrape</h1>

      {feedback && (
        <div className={`mb-4 p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 mb-6">
        <form onSubmit={handleScrape} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-600 mb-2">URL to Scrape</label>
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Formats</label>
            <div className="flex flex-wrap gap-4">
              {(["markdown", "html", "json"] as const).map((format) => (
                <label key={format} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formats[format]}
                    onChange={(e) => setFormats({ ...formats, [format]: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 bg-slate-100 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600 capitalize">{format}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Scrape URL
          </button>
        </form>
      </div>

      {result && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Results</h2>
            <div className="flex gap-2">
              {result.markdown && (
                <button onClick={copyMarkdown} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition-colors">
                  <Copy className="h-4 w-4" />
                  Copy Markdown
                </button>
              )}
              {result.json && (
                <button onClick={downloadJSON} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition-colors">
                  <Download className="h-4 w-4" />
                  Download JSON
                </button>
              )}
            </div>
          </div>

          {result.metadata && (
            <div className="mb-4 p-3 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-600">
                <strong>Title:</strong> {result.metadata.title || "N/A"}
              </p>
              <p className="text-sm text-slate-600">
                <strong>URL:</strong> {result.metadata.sourceURL || url}
              </p>
            </div>
          )}

          <div className="border-b border-slate-200 mb-4">
            <div className="flex gap-2">
              {result.markdown && (
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-4 py-2 border-b-2 transition-colors ${activeTab === "preview" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  Preview
                </button>
              )}
              {result.html && (
                <button
                  onClick={() => setActiveTab("html")}
                  className={`px-4 py-2 border-b-2 transition-colors ${activeTab === "html" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  HTML
                </button>
              )}
              {result.json && (
                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-4 py-2 border-b-2 transition-colors ${activeTab === "json" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  JSON
                </button>
              )}
            </div>
          </div>

          <div className="prose prose-sm prose-invert max-w-none">
            {activeTab === "preview" && result.markdown && (
              <div className="text-slate-600 whitespace-pre-wrap">{result.markdown}</div>
            )}
            {activeTab === "html" && result.html && (
              <pre className="bg-slate-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                <code className="text-slate-600">{result.html}</code>
              </pre>
            )}
            {activeTab === "json" && result.json && (
              <pre className="bg-slate-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                <code className="text-slate-600">{JSON.stringify(result.json, null, 2)}</code>
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
