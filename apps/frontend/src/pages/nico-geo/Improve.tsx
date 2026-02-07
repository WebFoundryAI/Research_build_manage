import React, { useState } from "react";
import {
  FileText,
  Play,
  Globe,
  Wand2,
  CheckCircle,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

type Improvement = {
  id: string;
  category: string;
  original: string;
  improved: string;
  impact: "high" | "medium" | "low";
  applied: boolean;
};

export default function NicoGeoImprove() {
  const [siteUrl, setSiteUrl] = useState("");
  const [improving, setImproving] = useState(false);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleImprove() {
    if (!siteUrl) return;
    setImproving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2500));
    setImprovements([
      {
        id: "1",
        category: "Title Tag",
        original: "Welcome to Our Business",
        improved: "Professional Consulting Services in Austin, TX | Your Business Name",
        impact: "high",
        applied: false,
      },
      {
        id: "2",
        category: "Meta Description",
        original: "We offer great services for our customers. Contact us today to learn more about what we can do for you.",
        improved: "Expert consulting services in Austin & Round Rock, TX. 15+ years experience. Free consultation. Call (512) 555-0123.",
        impact: "high",
        applied: false,
      },
      {
        id: "3",
        category: "H1 Heading",
        original: "Our Services",
        improved: "Professional Consulting Services for Austin Businesses",
        impact: "medium",
        applied: false,
      },
      {
        id: "4",
        category: "FAQ Schema",
        original: "(Not present)",
        improved: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}`,
        impact: "high",
        applied: false,
      },
      {
        id: "5",
        category: "Answer Capsule",
        original: "(Not present)",
        improved: "Your Business Name provides professional consulting services including strategy, operations, and growth advisory for businesses in the Austin metropolitan area.",
        impact: "medium",
        applied: false,
      },
    ]);
    setImproving(false);
  }

  function toggleApplied(id: string) {
    setImprovements((prev) =>
      prev.map((i) => (i.id === id ? { ...i, applied: !i.applied } : i))
    );
  }

  async function copyImprovement(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function getImpactColor(impact: string) {
    if (impact === "high") return "bg-red-500/20 text-red-600 border-red-500/30";
    if (impact === "medium") return "bg-amber-500/20 text-amber-600 border-amber-500/30";
    return "bg-blue-500/20 text-blue-600 border-blue-500/30";
  }

  const appliedCount = improvements.filter((i) => i.applied).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          <FileText className="text-purple-600" />
          Improve Content
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Enhance content with AI-powered GEO recommendations
        </p>
      </div>

      {/* URL Input */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Website URL to Improve
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleImprove}
            disabled={improving || !siteUrl}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors disabled:opacity-60"
          >
            {improving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-200/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Generate Improvements
              </>
            )}
          </button>
        </div>
      </div>

      {improvements.length > 0 && (
        <>
          {/* Summary */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Wand2 size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="font-medium">
                  {improvements.length} improvements suggested
                </div>
                <div className="text-sm text-slate-500">
                  {appliedCount} marked as applied
                </div>
              </div>
            </div>
            <button
              onClick={handleImprove}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-sm"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          </div>

          {/* Improvements List */}
          <div className="space-y-4">
            {improvements.map((improvement) => (
              <div
                key={improvement.id}
                className={`rounded-xl border bg-white overflow-hidden transition-all ${
                  improvement.applied ? "border-emerald-500/30" : "border-slate-200"
                }`}
              >
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{improvement.category}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs border ${getImpactColor(
                        improvement.impact
                      )}`}
                    >
                      {improvement.impact} impact
                    </span>
                  </div>
                  <button
                    onClick={() => toggleApplied(improvement.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      improvement.applied
                        ? "bg-emerald-500/20 text-emerald-600"
                        : "bg-slate-100 text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <CheckCircle size={14} />
                    {improvement.applied ? "Applied" : "Mark Applied"}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  {/* Original */}
                  <div className="p-4">
                    <div className="text-xs text-slate-500 mb-2">Original</div>
                    <div className="p-3 rounded-lg bg-slate-100 text-sm text-slate-400 font-mono whitespace-pre-wrap">
                      {improvement.original}
                    </div>
                  </div>

                  {/* Improved */}
                  <div className="p-4 bg-purple-500/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-purple-600">Improved</div>
                      <button
                        onClick={() => copyImprovement(improvement.id, improvement.improved)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                      >
                        {copied === improvement.id ? (
                          <>
                            <Check size={12} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-100 text-sm text-white font-mono whitespace-pre-wrap">
                      {improvement.improved}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Apply All */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-600">Ready to apply changes?</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Create a review session to safely deploy improvements to your repository
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors">
                Create Review Session
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {improvements.length === 0 && !improving && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <Wand2 size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">Enter a URL to generate GEO improvements</p>
          <p className="text-sm text-slate-500 mt-1">
            AI will analyze and suggest optimizations for better visibility
          </p>
        </div>
      )}
    </div>
  );
}
