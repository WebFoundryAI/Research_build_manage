import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Loader2, Download, ChevronDown, ChevronUp } from "lucide-react";

export default function Extract() {
  const [urlsText, setUrlsText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [schema, setSchema] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRawJSON, setShowRawJSON] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const urls = urlsText.split("\n").filter((url) => url.trim());

      if (urls.length === 0) {
        throw new Error("Please enter at least one URL");
      }

      const body: any = { urls, prompt: prompt || undefined };

      if (schema) {
        try {
          body.schema = JSON.parse(schema);
        } catch (err) {
          throw new Error("Invalid JSON schema");
        }
      }

      const { data, error } = await supabase.functions.invoke("firecrawl-extract", {
        body,
      });

      if (error) throw error;

      setResults(data.data || data.results || []);
      showFeedback("success", `Extracted data from ${data.data?.length || data.results?.length || 0} URLs`);
    } catch (error) {
      console.error("Error extracting data:", error);
      showFeedback("error", error instanceof Error ? error.message : "Failed to extract data");
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Structured Data Extract</h1>

      {feedback && (
        <div className={`mb-4 p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {feedback.message}
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
        <form onSubmit={handleExtract} className="space-y-4">
          <div>
            <label htmlFor="urls" className="block text-sm font-medium text-slate-300 mb-2">URLs (one per line)</label>
            <textarea
              id="urls"
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              placeholder={"https://example.com/page1\nhttps://example.com/page2"}
              rows={4}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Extraction Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what data to extract, e.g., 'Extract all product names, prices, and descriptions'"
              rows={2}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300"
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="schema" className="block text-sm font-medium text-slate-300 mb-2">JSON Schema (optional)</label>
                  <textarea
                    id="schema"
                    value={schema}
                    onChange={(e) => setSchema(e.target.value)}
                    placeholder='{"type": "object", "properties": {"name": {"type": "string"}}}'
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">Define a JSON schema for structured extraction</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Extract Data
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Extracted Data ({results.length} results)</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRawJSON(!showRawJSON)}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-300"
              >
                {showRawJSON ? "Show Formatted" : "Show Raw JSON"}
              </button>
              <button onClick={exportResults} className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
                <Download className="h-4 w-4" />
                Export JSON
              </button>
            </div>
          </div>

          {showRawJSON ? (
            <pre className="bg-slate-800 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              <code className="text-slate-300">{JSON.stringify(results, null, 2)}</code>
            </pre>
          ) : (
            <div className="space-y-4">
              {results.map((result, idx) => (
                <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <h3 className="font-medium text-white mb-2">Result {idx + 1}</h3>
                  <pre className="bg-slate-800 p-3 rounded-lg overflow-auto text-sm">
                    <code className="text-slate-300">{JSON.stringify(result, null, 2)}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
