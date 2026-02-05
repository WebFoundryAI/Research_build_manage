import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Shield,
  FileText,
  Clock,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type HealthCheck = {
  id: string;
  project_id: string;
  project_name: string;
  domain: string;
  overall_score: number;
  uptime_score: number;
  ssl_score: number;
  performance_score: number;
  seo_score: number;
  last_checked: string;
  issues: string[];
};

export default function HealthPage() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);

  useEffect(() => {
    loadHealthData();
  }, []);

  async function loadHealthData() {
    setLoading(true);

    const demoData: HealthCheck[] = [
      {
        id: "1",
        project_id: "1",
        project_name: "Main Website",
        domain: "example.com",
        overall_score: 92,
        uptime_score: 100,
        ssl_score: 100,
        performance_score: 85,
        seo_score: 82,
        last_checked: new Date().toISOString(),
        issues: [],
      },
      {
        id: "2",
        project_id: "2",
        project_name: "E-Commerce Store",
        domain: "shop.example.com",
        overall_score: 68,
        uptime_score: 99,
        ssl_score: 100,
        performance_score: 45,
        seo_score: 65,
        last_checked: new Date().toISOString(),
        issues: ["Slow page load time", "Missing meta descriptions"],
      },
      {
        id: "3",
        project_id: "4",
        project_name: "SaaS Dashboard",
        domain: "app.example.com",
        overall_score: 85,
        uptime_score: 100,
        ssl_score: 100,
        performance_score: 78,
        seo_score: 72,
        last_checked: new Date().toISOString(),
        issues: ["Missing sitemap.xml"],
      },
    ];

    setHealthChecks(demoData);
    setLoading(false);
  }

  async function runAllHealthChecks() {
    setRunningCheck(true);
    await new Promise(r => setTimeout(r, 2000));
    await loadHealthData();
    setRunningCheck(false);
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  }

  function getScoreBgColor(score: number) {
    if (score >= 80) return "bg-emerald-500/20 border-emerald-500/30";
    if (score >= 60) return "bg-amber-500/20 border-amber-500/30";
    return "bg-red-500/20 border-red-500/30";
  }

  const avgScore = healthChecks.length > 0
    ? Math.round(healthChecks.reduce((sum, h) => sum + h.overall_score, 0) / healthChecks.length)
    : 0;

  const healthySites = healthChecks.filter(h => h.overall_score >= 80).length;
  const warningsCount = healthChecks.filter(h => h.overall_score >= 60 && h.overall_score < 80).length;
  const criticalCount = healthChecks.filter(h => h.overall_score < 60).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Health Monitor</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor website health, uptime, and performance
          </p>
        </div>
        <button
          onClick={runAllHealthChecks}
          disabled={runningCheck}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors disabled:opacity-60"
        >
          {runningCheck ? <RefreshCw size={16} className="animate-spin" /> : <Activity size={16} />}
          {runningCheck ? "Running..." : "Run Health Check"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getScoreBgColor(avgScore)}`}>
              <Activity size={18} className={getScoreColor(avgScore)} />
            </div>
            <div>
              <div className={`text-2xl font-semibold ${getScoreColor(avgScore)}`}>{avgScore}</div>
              <div className="text-xs text-slate-500">Avg Health Score</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-emerald-400">{healthySites}</div>
              <div className="text-xs text-slate-500">Healthy</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-amber-400">{warningsCount}</div>
              <div className="text-xs text-slate-500">Warnings</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle size={18} className="text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-red-400">{criticalCount}</div>
              <div className="text-xs text-slate-500">Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Checks List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : healthChecks.length === 0 ? (
        <div className="text-center py-12">
          <Activity size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-4">No health checks yet</p>
          <p className="text-sm text-slate-500">Add projects to start monitoring their health</p>
        </div>
      ) : (
        <div className="space-y-4">
          {healthChecks.map((check) => (
            <div
              key={check.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getScoreBgColor(check.overall_score)}`}>
                      <span className={`text-lg font-bold ${getScoreColor(check.overall_score)}`}>
                        {check.overall_score}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{check.project_name}</h3>
                      <a
                        href={`https://${check.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-400 hover:text-blue-400 flex items-center gap-1"
                      >
                        {check.domain}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} />
                    Last checked: {new Date(check.last_checked).toLocaleString()}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-800/30 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-400">Uptime</span>
                    </div>
                    <div className={`text-lg font-semibold ${getScoreColor(check.uptime_score)}`}>
                      {check.uptime_score}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-800/30 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-400">SSL</span>
                    </div>
                    <div className={`text-lg font-semibold ${getScoreColor(check.ssl_score)}`}>
                      {check.ssl_score}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-800/30 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-400">Performance</span>
                    </div>
                    <div className={`text-lg font-semibold ${getScoreColor(check.performance_score)}`}>
                      {check.performance_score}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-800/30 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-400">SEO</span>
                    </div>
                    <div className={`text-lg font-semibold ${getScoreColor(check.seo_score)}`}>
                      {check.seo_score}%
                    </div>
                  </div>
                </div>

                {/* Issues */}
                {check.issues.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                      <AlertTriangle size={14} />
                      Issues ({check.issues.length})
                    </h4>
                    <ul className="space-y-1">
                      {check.issues.map((issue, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
