import { useState, useMemo } from "react";
import { getSupabase } from "../../lib/supabase";
import {
  Search,
  Loader2,
  ExternalLink,
  Download,
  Copy,
  CheckCircle,
  FileText,
  Lightbulb,
  Globe,
  Zap,
  BookOpen,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
}

interface ResearchResult {
  query: string;
  summary: string;
  keyFindings: string[];
  sources: ResearchSource[];
}

const MIN_QUERY_LENGTH = 20;
const MAX_QUERY_LENGTH = 2000;

const researchModes = [
  { id: "quick", name: "Quick", description: "Fast overview with fewer sources" },
  { id: "standard", name: "Standard", description: "Balanced depth and speed" },
  { id: "deep", name: "Deep", description: "Comprehensive analysis with more sources" },
];

const maxSourcesOptions = [
  { value: 5, label: "5 sources" },
  { value: 10, label: "10 sources" },
  { value: 15, label: "15 sources" },
];

export default function DeepResearch() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<string>("standard");
  const [maxSources, setMaxSources] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "findings" | "sources">("summary");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const queryLength = query.length;
  const isQueryValid = queryLength >= MIN_QUERY_LENGTH && queryLength <= MAX_QUERY_LENGTH;
  const canSubmit = isQueryValid && !isLoading;

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleResearch = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    setResult(null);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("deep-research", {
        body: {
          query,
          mode,
          max_sources: maxSources,
        },
      });

      if (error) throw error;

      if (data?.success && data?.result) {
        setResult(data.result);
        showFeedback("success", `Found ${data.result.sources.length} sources`);
      } else {
        throw new Error(data?.error || "Research failed");
      }
    } catch (error) {
      console.error("Research error:", error);
      showFeedback("error", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      const content = `# ${result.query}\n\n## Summary\n${result.summary}\n\n## Key Findings\n${result.keyFindings.map((f, i) => `${i + 1}. ${f}`).join("\n")}\n\n## Sources\n${result.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")}`;
      await navigator.clipboard.writeText(content);
      setCopied(true);
      showFeedback("success", "Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showFeedback("error", "Failed to copy");
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const content = `# ${result.query}\n\n## Summary\n${result.summary}\n\n## Key Findings\n${result.keyFindings.map((f, i) => `${i + 1}. ${f}`).join("\n")}\n\n## Sources\n${result.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback("success", "Download started");
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
          <Sparkles className="h-6 w-6 text-blue-600" />
          Deep Research
        </h1>
        <p className="text-slate-400">
          AI-powered research that searches, scrapes, and synthesizes information from the web
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Research Query</h2>
          <p className="text-sm text-slate-400">Enter a topic or question to research across the web</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-600">Research Question</label>
              <span className={`text-xs ${queryLength < MIN_QUERY_LENGTH ? "text-amber-500" : queryLength > MAX_QUERY_LENGTH ? "text-red-500" : "text-slate-500"}`}>
                {queryLength}/{MAX_QUERY_LENGTH}
              </span>
            </div>
            <textarea
              placeholder="e.g., What are the latest developments in quantum computing and how are major tech companies approaching this technology?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={MAX_QUERY_LENGTH}
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
            />
            {queryLength > 0 && queryLength < MIN_QUERY_LENGTH && (
              <p className="text-xs text-amber-500">
                Minimum {MIN_QUERY_LENGTH} characters required ({MIN_QUERY_LENGTH - queryLength} more)
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-slate-600">Research Depth</label>
              <div className="flex gap-2 flex-wrap">
                {researchModes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-colors ${mode === m.id ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                  >
                    {m.id === "quick" && <Zap className="h-3 w-3" />}
                    {m.id === "standard" && <BookOpen className="h-3 w-3" />}
                    {m.id === "deep" && <Sparkles className="h-3 w-3" />}
                    {m.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                {researchModes.find((m) => m.id === mode)?.description}
              </p>
            </div>

            <div className="w-full md:w-48 space-y-2">
              <label className="text-sm font-medium text-slate-600">Max Sources</label>
              <select
                value={maxSources}
                onChange={(e) => setMaxSources(Number(e.target.value))}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {maxSourcesOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleResearch}
            disabled={!canSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Run Research
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="text-center">
              <p className="font-medium text-white">Researching...</p>
              <p className="text-sm text-slate-400">Searching web sources, extracting content, and synthesizing findings</p>
            </div>
          </div>
        </div>
      )}

      {result && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Research Results</h2>
              <p className="text-sm text-slate-400">Query: "{result.query}" - {result.sources.length} sources analyzed</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1 transition-colors">
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={handleDownload} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="flex gap-2 mb-4 border-b border-slate-200">
              {[
                { id: "summary", label: "Summary", icon: FileText },
                { id: "findings", label: "Key Findings", icon: Lightbulb },
                { id: "sources", label: `Sources (${result.sources.length})`, icon: Globe },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-sm flex items-center gap-1 border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2">
              {activeTab === "summary" && (
                <div className="prose prose-sm prose-invert max-w-none">
                  <div className="text-slate-600 whitespace-pre-wrap">{result.summary}</div>
                </div>
              )}

              {activeTab === "findings" && (
                <div className="space-y-3">
                  {result.keyFindings.map((finding, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-100">
                      <span className="px-2 py-0.5 text-xs border border-slate-300 rounded text-slate-400">{index + 1}</span>
                      <p className="text-sm text-slate-600">{finding}</p>
                    </div>
                  ))}
                  {result.keyFindings.length === 0 && (
                    <p className="text-slate-400 text-center py-8">No key findings extracted</p>
                  )}
                </div>
              )}

              {activeTab === "sources" && (
                <div className="space-y-4">
                  {result.sources.map((source, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 bg-slate-100 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{source.title}</h4>
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                            {source.url.slice(0, 60)}...
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <p className="text-sm text-slate-400 mt-2">{source.snippet}</p>
                        </div>
                        <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-400">{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!result && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-slate-600" />
            <div>
              <p className="font-medium text-white">Start your research</p>
              <p className="text-sm text-slate-400">Enter your research question to begin</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                "What are the latest developments in AI and machine learning in 2025?",
                "Compare the best React frameworks for enterprise applications",
                "What are the current SEO best practices for e-commerce websites?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-100 text-left whitespace-normal transition-colors"
                >
                  {suggestion.length > 50 ? suggestion.slice(0, 50) + "..." : suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
