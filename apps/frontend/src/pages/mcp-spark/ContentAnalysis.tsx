import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import {
  FileText,
  Loader2,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart,
  Type,
} from "lucide-react";

interface ContentAnalysisResult {
  url: string;
  title: string;
  wordCount: number;
  readingTime: string;
  overallScore: number;
  seoScore: number;
  readabilityScore: number;
  summary: string;
  headings: { level: number; text: string }[];
  keywords: { word: string; count: number }[];
  improvements: string[];
  strengths: string[];
  issues: string[];
  timestamp: string;
}

export default function ContentAnalysis() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ContentAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "structure" | "keywords" | "issues">("summary");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      showFeedback("error", "Please enter a URL to analyze");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("content-analysis", {
        body: { url },
      });

      if (error) throw error;

      if (data?.success && data?.result) {
        setResult(data.result);
        showFeedback("success", "Analysis complete");
      } else {
        throw new Error(data?.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      showFeedback("error", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
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
          <FileText className="h-6 w-6 text-blue-400" />
          Content Analysis
        </h1>
        <p className="text-slate-400">Analyze any webpage for SEO, readability, and content quality</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Analyze URL</h2>
          <p className="text-sm text-slate-400">Enter a webpage URL to analyze its content</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleAnalyze()}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !url.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart className="h-4 w-4" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            <p className="text-slate-400">Scraping and analyzing content...</p>
          </div>
        </div>
      )}

      {result && !isLoading && (
        <>
          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Overall Score", score: result.overallScore },
              { label: "SEO Score", score: result.seoScore },
              { label: "Readability", score: result.readabilityScore },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">{item.label}</p>
                  <p className={`text-4xl font-bold ${getScoreColor(item.score)}`}>{item.score}</p>
                  <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${getScoreBg(item.score)}`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4">
            <span className="px-3 py-1.5 text-sm bg-slate-800 rounded-lg text-slate-300 flex items-center gap-1">
              <Type className="h-3 w-3" />
              {result.wordCount} words
            </span>
            <span className="px-3 py-1.5 text-sm bg-slate-800 rounded-lg text-slate-300">
              {result.readingTime} read
            </span>
            <span className="px-3 py-1.5 text-sm bg-slate-800 rounded-lg text-slate-300">
              {result.headings?.length || 0} headings
            </span>
          </div>

          {/* Detailed Analysis */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">{result.title}</h2>
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                {result.url.slice(0, 60)}... <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-4 border-b border-slate-700">
                {["summary", "structure", "keywords", "issues"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 text-sm capitalize border-b-2 transition-colors ${activeTab === tab ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-300"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="max-h-[350px] overflow-y-auto pr-2">
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <div className="text-slate-300 whitespace-pre-wrap">{result.summary}</div>
                    </div>

                    {result.strengths?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-4 w-4" /> Strengths
                        </h4>
                        <ul className="space-y-1">
                          {result.strengths.map((s, i) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-slate-300">
                              <span className="text-green-400">+</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.improvements?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2 text-yellow-400">
                          <AlertTriangle className="h-4 w-4" /> Improvements
                        </h4>
                        <ul className="space-y-1">
                          {result.improvements.map((imp, i) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-slate-300">
                              <span className="text-yellow-400">-</span> {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "structure" && (
                  <div className="space-y-2">
                    {result.headings?.map((heading, i) => (
                      <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}>
                        <span className="px-2 py-0.5 text-xs border border-slate-600 rounded text-slate-400">H{heading.level}</span>
                        <span className="text-sm text-slate-300">{heading.text}</span>
                      </div>
                    ))}
                    {(!result.headings || result.headings.length === 0) && (
                      <p className="text-slate-400 text-center py-8">No headings found</p>
                    )}
                  </div>
                )}

                {activeTab === "keywords" && (
                  <div className="flex flex-wrap gap-2">
                    {result.keywords?.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 text-sm bg-slate-800 rounded-lg text-slate-300">
                        {kw.word} ({kw.count})
                      </span>
                    ))}
                    {(!result.keywords || result.keywords.length === 0) && (
                      <p className="text-slate-400 text-center py-8 w-full">No keywords extracted</p>
                    )}
                  </div>
                )}

                {activeTab === "issues" && (
                  <div className="space-y-2">
                    {result.issues?.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10">
                        <XCircle className="h-4 w-4 text-red-400 mt-0.5" />
                        <span className="text-sm text-slate-300">{issue}</span>
                      </div>
                    ))}
                    {(!result.issues || result.issues.length === 0) && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-2" />
                        <p className="text-slate-400">No major issues found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!result && !isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Analyze any webpage</p>
            <p className="text-sm text-slate-400">Enter a URL to get detailed content analysis</p>
          </div>
        </div>
      )}
    </div>
  );
}
