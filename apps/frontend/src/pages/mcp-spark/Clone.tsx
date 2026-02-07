import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Loader2, Copy, Check, Globe } from "lucide-react";

export default function Clone() {
  const [url, setUrl] = useState("");
  const [limit, setLimit] = useState(12);
  const [isCloning, setIsCloning] = useState(false);
  const [result, setResult] = useState<{ url: string; pages: number; code: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; limit?: string }>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const validateForm = () => {
    const newErrors: { url?: string; limit?: string } = {};

    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else {
      try {
        new URL(url.trim());
      } catch {
        newErrors.url = "Please enter a valid URL";
      }
    }

    if (limit < 1 || limit > 40) {
      newErrors.limit = "Max pages must be between 1 and 40";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsCloning(true);
    setResult(null);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("open-lovable-clone", {
        body: {
          url: url.trim(),
          limit,
        },
      });

      if (error) throw error;

      setResult(data);
      showFeedback("success", `Successfully cloned ${data.pages} pages from ${data.url}`);
    } catch (error: any) {
      console.error("Error cloning site:", error);
      showFeedback("error", error.message || "Failed to clone site");
    } finally {
      setIsCloning(false);
    }
  };

  const handleCopyCode = async () => {
    if (!result?.code) return;

    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      showFeedback("success", "Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showFeedback("error", "Failed to copy code");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {feedback && (
        <div className={`mb-4 p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
          <Globe className="h-8 w-8" />
          Site Cloner
        </h1>
        <p className="text-slate-400">
          Use web crawling + AI to crawl any website and generate a React/Next.js code listing that recreates it
        </p>
      </div>

      <div className="grid gap-8">
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-white">Clone a Website</h2>
            <p className="text-sm text-slate-400">Enter a URL to crawl and generate code from</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="url" className="block text-sm font-medium text-slate-600">Source URL *</label>
                <input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setErrors({ ...errors, url: undefined });
                  }}
                  className={`w-full px-4 py-2 bg-slate-100 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.url ? "border-red-500" : "border-slate-200"}`}
                />
                {errors.url && (
                  <p className="text-sm text-red-600">{errors.url}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="limit" className="block text-sm font-medium text-slate-600">Max Pages (1-40)</label>
                <input
                  id="limit"
                  type="number"
                  min={1}
                  max={40}
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value) || 12);
                    setErrors({ ...errors, limit: undefined });
                  }}
                  className={`w-full px-4 py-2 bg-slate-100 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.limit ? "border-red-500" : "border-slate-200"}`}
                />
                {errors.limit && (
                  <p className="text-sm text-red-600">{errors.limit}</p>
                )}
                <p className="text-xs text-slate-500">
                  Number of pages to crawl and include in code generation (default: 12)
                </p>
              </div>

              <button
                type="submit"
                disabled={isCloning}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {isCloning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cloning Site...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Clone Site
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {result && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Generated Code</h2>
                <p className="text-sm text-slate-400">
                  Cloned from <span className="font-mono text-white">{result.url}</span> using{" "}
                  <span className="font-semibold">{result.pages}</span> crawled pages
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy All Code
                  </>
                )}
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
                <code className="text-sm font-mono text-slate-600">{result.code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
