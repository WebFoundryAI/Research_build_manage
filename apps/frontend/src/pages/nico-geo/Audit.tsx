import React, { useState } from "react";
import {
  Search,
  Play,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  BarChart3,
} from "lucide-react";

type AuditResult = {
  url: string;
  score: number;
  issues: {
    type: "critical" | "warning" | "info";
    category: string;
    message: string;
    recommendation: string;
  }[];
  metrics: {
    titleOptimized: boolean;
    metaDescriptionPresent: boolean;
    schemaMarkup: boolean;
    answerCapsules: number;
    faqsDetected: number;
    readabilityScore: number;
  };
};

export default function NicoGeoAudit() {
  const [siteUrl, setSiteUrl] = useState("");
  const [auditing, setAuditing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  async function handleAudit() {
    if (!siteUrl) return;
    setAuditing(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2500));
    setResult({
      url: siteUrl,
      score: 72,
      issues: [
        {
          type: "critical",
          category: "Schema",
          message: "Missing LocalBusiness schema markup",
          recommendation: "Add JSON-LD LocalBusiness schema to improve AI visibility",
        },
        {
          type: "warning",
          category: "Content",
          message: "Meta description exceeds 160 characters",
          recommendation: "Shorten meta description to 150-160 characters",
        },
        {
          type: "warning",
          category: "FAQ",
          message: "No FAQ schema detected",
          recommendation: "Add FAQPage schema for featured snippet eligibility",
        },
        {
          type: "info",
          category: "Title",
          message: "Title could include location modifier",
          recommendation: "Consider adding city name to title for local SEO",
        },
      ],
      metrics: {
        titleOptimized: true,
        metaDescriptionPresent: true,
        schemaMarkup: false,
        answerCapsules: 0,
        faqsDetected: 3,
        readabilityScore: 68,
      },
    });
    setAuditing(false);
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  }

  function getScoreBg(score: number) {
    if (score >= 80) return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30";
    if (score >= 60) return "from-amber-500/20 to-amber-500/5 border-amber-500/30";
    return "from-red-500/20 to-red-500/5 border-red-500/30";
  }

  function getIssueIcon(type: string) {
    if (type === "critical") return <XCircle size={16} className="text-red-400" />;
    if (type === "warning") return <AlertTriangle size={16} className="text-amber-400" />;
    return <CheckCircle size={16} className="text-blue-400" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          <Search className="text-blue-400" />
          Audit Content
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Analyze existing content for GEO optimization opportunities
        </p>
      </div>

      {/* URL Input */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Website URL
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleAudit}
            disabled={auditing || !siteUrl}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-60"
          >
            {auditing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Auditing...
              </>
            ) : (
              <>
                <Play size={18} />
                Run Audit
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Score Card */}
          <div className={`rounded-xl border bg-gradient-to-br ${getScoreBg(result.score)} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">GEO Score</h2>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                >
                  {result.url}
                  <ExternalLink size={14} />
                </a>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </div>
                <div className="text-sm text-slate-500">out of 100</div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
              <div className="mb-2">
                {result.metrics.titleOptimized ? (
                  <CheckCircle size={24} className="mx-auto text-emerald-400" />
                ) : (
                  <XCircle size={24} className="mx-auto text-red-400" />
                )}
              </div>
              <div className="text-xs text-slate-500">Title Optimized</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
              <div className="mb-2">
                {result.metrics.metaDescriptionPresent ? (
                  <CheckCircle size={24} className="mx-auto text-emerald-400" />
                ) : (
                  <XCircle size={24} className="mx-auto text-red-400" />
                )}
              </div>
              <div className="text-xs text-slate-500">Meta Description</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
              <div className="mb-2">
                {result.metrics.schemaMarkup ? (
                  <CheckCircle size={24} className="mx-auto text-emerald-400" />
                ) : (
                  <XCircle size={24} className="mx-auto text-red-400" />
                )}
              </div>
              <div className="text-xs text-slate-500">Schema Markup</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
              <div className="text-2xl font-semibold text-blue-400 mb-1">
                {result.metrics.answerCapsules}
              </div>
              <div className="text-xs text-slate-500">Answer Capsules</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
              <div className="text-2xl font-semibold text-purple-400 mb-1">
                {result.metrics.faqsDetected}
              </div>
              <div className="text-xs text-slate-500">FAQs Detected</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
              <div className="text-2xl font-semibold text-amber-400 mb-1">
                {result.metrics.readabilityScore}
              </div>
              <div className="text-xs text-slate-500">Readability</div>
            </div>
          </div>

          {/* Issues List */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Issues Found ({result.issues.length})
            </h2>
            <div className="space-y-3">
              {result.issues.map((issue, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-4 ${
                    issue.type === "critical"
                      ? "bg-red-500/5 border-red-500/20"
                      : issue.type === "warning"
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-blue-500/5 border-blue-500/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIssueIcon(issue.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{issue.message}</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400">
                          {issue.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!result && !auditing && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Search size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">Enter a URL to audit for GEO optimization</p>
          <p className="text-sm text-slate-500 mt-1">
            We'll analyze schema markup, content structure, and AI visibility
          </p>
        </div>
      )}
    </div>
  );
}
