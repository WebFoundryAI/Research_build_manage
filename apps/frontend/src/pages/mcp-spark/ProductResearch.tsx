import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import {
  ShoppingCart,
  Loader2,
  ExternalLink,
  Download,
  DollarSign,
  Star,
  TrendingUp,
  Package,
  Target,
} from "lucide-react";

interface ProductResult {
  query: string;
  overview: string;
  products: {
    name: string;
    url: string;
    price?: string;
    description: string;
    pros: string[];
    cons: string[];
  }[];
  marketInsights: string[];
  recommendations: string[];
  timestamp: string;
}

export default function ProductResearch() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "insights">("overview");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleResearch = async () => {
    if (!query.trim()) {
      showFeedback("error", "Please enter a product or category to research");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("product-research", {
        body: { query },
      });

      if (error) throw error;

      if (data?.success && data?.result) {
        setResult(data.result);
        showFeedback("success", `Found ${data.result.products?.length || 0} products`);
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

  const handleDownload = () => {
    if (!result) return;
    const content = `# Product Research: ${result.query}\n\n## Overview\n${result.overview}\n\n## Products\n${result.products.map((p, i) => `### ${i + 1}. ${p.name}\n${p.description}\n\n**Pros:** ${p.pros.join(", ")}\n**Cons:** ${p.cons.join(", ")}`).join("\n\n")}\n\n## Market Insights\n${result.marketInsights.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}\n\n## Recommendations\n${result.recommendations.map((r, idx) => `${idx + 1}. ${r}`).join("\n")}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product-research-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback("success", "Download started");
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
          <ShoppingCart className="h-6 w-6 text-blue-400" />
          Product Research
        </h1>
        <p className="text-slate-400">Research products, compare features, and analyze market opportunities</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Research Query</h2>
          <p className="text-sm text-slate-400">Enter a product name, category, or market to research</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              placeholder="e.g., Best project management tools for startups..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleResearch()}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleResearch}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Research
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Best CRM software 2024", "AI writing tools comparison", "Top SEO tools for agencies"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            <p className="text-slate-400">Researching products and market data...</p>
          </div>
        </div>
      )}

      {result && !isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Research Results</h2>
              <p className="text-sm text-slate-400">Query: "{result.query}"</p>
            </div>
            <button onClick={handleDownload} className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-1 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
          <div className="p-6">
            <div className="flex gap-2 mb-4 border-b border-slate-700">
              {[
                { id: "overview", label: "Overview", icon: Package },
                { id: "products", label: `Products (${result.products?.length || 0})`, icon: Star },
                { id: "insights", label: "Insights", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-sm flex items-center gap-1 border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-300"}`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <div className="text-slate-300 whitespace-pre-wrap">{result.overview}</div>
                  </div>
                  {result.recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-white">
                        <Target className="h-4 w-4" /> Recommendations
                      </h4>
                      <div className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <div key={i} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm text-slate-300">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "products" && (
                <div className="space-y-4">
                  {result.products?.map((product, index) => (
                    <div key={index} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{product.name}</h4>
                            {product.price && (
                              <span className="px-2 py-0.5 text-xs bg-slate-700 rounded text-slate-300 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {product.price}
                              </span>
                            )}
                          </div>
                          {product.url && (
                            <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1">
                              Visit <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <p className="text-sm text-slate-400 mt-2">{product.description}</p>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            {product.pros?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-green-400 mb-1">Pros</p>
                                <ul className="text-xs text-slate-400 space-y-1">
                                  {product.pros.map((pro, i) => <li key={i}>+ {pro}</li>)}
                                </ul>
                              </div>
                            )}
                            {product.cons?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-red-400 mb-1">Cons</p>
                                <ul className="text-xs text-slate-400 space-y-1">
                                  {product.cons.map((con, i) => <li key={i}>- {con}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 text-xs border border-slate-600 rounded text-slate-400">{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "insights" && (
                <div className="space-y-3">
                  {result.marketInsights?.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                      <span className="px-2 py-0.5 text-xs border border-slate-600 rounded text-slate-400">{index + 1}</span>
                      <p className="text-sm text-slate-300">{insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!result && !isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12">
          <div className="text-center space-y-4">
            <ShoppingCart className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Start your product research</p>
            <p className="text-sm text-slate-400">Enter a product or market above to get AI-powered analysis</p>
          </div>
        </div>
      )}
    </div>
  );
}
