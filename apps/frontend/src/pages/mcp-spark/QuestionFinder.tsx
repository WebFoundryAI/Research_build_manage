import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import {
  HelpCircle,
  Loader2,
  Copy,
  CheckCircle,
  MessageCircle,
  TrendingUp,
  Lightbulb,
  Search,
} from "lucide-react";

interface QuestionResult {
  topic: string;
  questions: {
    question: string;
    source: string;
    category: "what" | "how" | "why" | "when" | "where" | "who" | "which" | "other";
    popularity?: string;
  }[];
  categories: {
    category: string;
    count: number;
  }[];
  contentIdeas: string[];
  timestamp: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "what": return "?";
    case "how": return "#";
    case "why": return "!";
    case "when": return "@";
    case "where": return "&";
    case "who": return "*";
    case "which": return "~";
    default: return "+";
  }
};

export default function QuestionFinder() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QuestionResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"questions" | "ideas">("questions");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSearch = async () => {
    if (!topic.trim()) {
      showFeedback("error", "Please enter a topic to find questions");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("question-finder", {
        body: { topic },
      });

      if (error) throw error;

      if (data?.success && data?.result) {
        setResult(data.result);
        showFeedback("success", `Found ${data.result.questions?.length || 0} questions`);
      } else {
        throw new Error(data?.error || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      showFeedback("error", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (question: string, index: number) => {
    await navigator.clipboard.writeText(question);
    setCopiedIndex(index);
    showFeedback("success", "Copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredQuestions = result?.questions.filter(
    (q) => activeCategory === "all" || q.category === activeCategory
  ) || [];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {feedback && (
        <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <HelpCircle className="h-6 w-6 text-blue-600" />
          Question Finder
        </h1>
        <p className="text-slate-400">Discover questions people ask about any topic for content ideas</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Find Questions</h2>
          <p className="text-sm text-slate-400">Enter a topic to find related questions from the web</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              placeholder="e.g., React hooks, SEO basics, machine learning..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSearch()}
              className="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !topic.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Find Questions
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {["content marketing", "typescript best practices", "remote work tips"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setTopic(suggestion)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-slate-400">Searching for questions across the web...</p>
          </div>
        </div>
      )}

      {result && !isLoading && (
        <>
          {/* Category Stats */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${activeCategory === "all" ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
            >
              All ({result.questions.length})
            </button>
            {result.categories?.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${activeCategory === cat.category ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
              >
                {getCategoryIcon(cat.category)} {cat.category} ({cat.count})
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Questions about "{result.topic}"
              </h2>
              <p className="text-sm text-slate-400">{filteredQuestions.length} questions found</p>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-4 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`px-4 py-2 text-sm flex items-center gap-1 border-b-2 transition-colors ${activeTab === "questions" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  <HelpCircle className="h-4 w-4" />
                  Questions
                </button>
                <button
                  onClick={() => setActiveTab("ideas")}
                  className={`px-4 py-2 text-sm flex items-center gap-1 border-b-2 transition-colors ${activeTab === "ideas" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  <Lightbulb className="h-4 w-4" />
                  Content Ideas
                </button>
              </div>

              <div className="max-h-[450px] overflow-y-auto pr-2">
                {activeTab === "questions" && (
                  <div className="space-y-3">
                    {filteredQuestions.map((q, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-100 hover:bg-slate-100 transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{getCategoryIcon(q.category)}</span>
                            <span className="px-2 py-0.5 text-xs border border-slate-300 rounded text-slate-400 capitalize">{q.category}</span>
                            {q.popularity && (
                              <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-600 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {q.popularity}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-white">{q.question}</p>
                          {q.source && (
                            <p className="text-xs text-slate-500 mt-1">Source: {q.source}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopy(q.question, index)}
                          className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-900 transition-all"
                        >
                          {copiedIndex === index ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                    {filteredQuestions.length === 0 && (
                      <p className="text-slate-400 text-center py-8">No questions in this category</p>
                    )}
                  </div>
                )}

                {activeTab === "ideas" && (
                  <div className="space-y-3">
                    {result.contentIdeas?.map((idea, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                        <p className="text-sm font-medium text-slate-600">{idea}</p>
                      </div>
                    ))}
                    {(!result.contentIdeas || result.contentIdeas.length === 0) && (
                      <p className="text-slate-400 text-center py-8">No content ideas generated</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!result && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="text-center space-y-4">
            <HelpCircle className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Discover what people are asking</p>
            <p className="text-sm text-slate-400">Enter a topic to find questions for content inspiration</p>
          </div>
        </div>
      )}
    </div>
  );
}
