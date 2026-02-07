import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  FileText,
  Map,
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

type SeoHealthData = {
  id: number;
  website_id: number;
  website_name: string;
  website_url: string;
  health_score: number;
  robots_txt_exists: boolean;
  robots_txt_valid: boolean;
  robots_txt_allows_crawl: boolean;
  sitemap_exists: boolean;
  sitemap_valid: boolean;
  sitemap_url_count: number;
  sitemap_url: string | null;
  ssl_valid: boolean;
  checked_at: string;
};

export default function SeoHealthPage() {
  const [healthData, setHealthData] = useState<SeoHealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SeoHealthData | null>(null);

  useEffect(() => {
    loadHealthData();
  }, []);

  async function loadHealthData() {
    setLoading(true);
    // Demo data
    const demoData: SeoHealthData[] = [
      {
        id: 1,
        website_id: 1,
        website_name: "Example Site",
        website_url: "https://example.com",
        health_score: 85,
        robots_txt_exists: true,
        robots_txt_valid: true,
        robots_txt_allows_crawl: true,
        sitemap_exists: true,
        sitemap_valid: true,
        sitemap_url_count: 150,
        sitemap_url: "https://example.com/sitemap.xml",
        ssl_valid: true,
        checked_at: new Date().toISOString(),
      },
      {
        id: 2,
        website_id: 2,
        website_name: "Test Blog",
        website_url: "https://blog.example.com",
        health_score: 55,
        robots_txt_exists: true,
        robots_txt_valid: true,
        robots_txt_allows_crawl: false,
        sitemap_exists: false,
        sitemap_valid: false,
        sitemap_url_count: 0,
        sitemap_url: null,
        ssl_valid: true,
        checked_at: new Date().toISOString(),
      },
      {
        id: 3,
        website_id: 3,
        website_name: "E-Commerce Store",
        website_url: "https://shop.example.com",
        health_score: 30,
        robots_txt_exists: false,
        robots_txt_valid: false,
        robots_txt_allows_crawl: false,
        sitemap_exists: true,
        sitemap_valid: false,
        sitemap_url_count: 0,
        sitemap_url: "https://shop.example.com/sitemap.xml",
        ssl_valid: true,
        checked_at: new Date().toISOString(),
      },
    ];
    setHealthData(demoData);
    setLoading(false);
  }

  async function runAllSeoChecks() {
    setRunning(true);
    await new Promise(r => setTimeout(r, 2000));
    await loadHealthData();
    setRunning(false);
  }

  function getScoreColor(score: number) {
    if (score >= 70) return "text-emerald-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  }

  function getScoreBg(score: number) {
    if (score >= 70) return "bg-emerald-500/20 border-emerald-500/30";
    if (score >= 40) return "bg-amber-500/20 border-amber-500/30";
    return "bg-red-500/20 border-red-500/30";
  }

  function CheckItem({ passed, label }: { passed: boolean; label: string }) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${passed ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
        {passed ? (
          <CheckCircle size={16} className="text-emerald-600" />
        ) : (
          <XCircle size={16} className="text-red-600" />
        )}
        <span className={passed ? "text-emerald-600" : "text-red-600"}>{label}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">SEO Health Checks</h1>
          <p className="text-sm text-slate-400 mt-1">
            Validate robots.txt, sitemap.xml, and SSL certificates
          </p>
        </div>
        <button
          onClick={runAllSeoChecks}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-60"
        >
          {running ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          {running ? "Running..." : "Run All SEO Checks"}
        </button>
      </div>

      {/* Score Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-400">Good (70-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-400">Needs Work (40-69)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-400">Poor (0-39)</span>
        </div>
      </div>

      {/* Health Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : healthData.length === 0 ? (
        <div className="text-center py-12">
          <ShieldCheck size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No SEO health data yet</p>
          <p className="text-sm text-slate-500 mt-2">Run SEO checks on your websites to see results</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData.map(site => (
            <div
              key={site.id}
              onClick={() => setSelectedSite(site)}
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium">{site.website_name}</h3>
                  <a
                    href={site.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-slate-500 hover:text-slate-600 flex items-center gap-1"
                  >
                    {site.website_url}
                    <ExternalLink size={10} />
                  </a>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border ${getScoreBg(site.health_score)}`}>
                  <span className={`text-lg font-semibold ${getScoreColor(site.health_score)}`}>
                    {site.health_score}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-slate-100">
                  <FileText size={16} className={`mx-auto mb-1 ${site.robots_txt_exists ? "text-emerald-600" : "text-red-600"}`} />
                  <span className="text-[10px] text-slate-500">robots.txt</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-100">
                  <Map size={16} className={`mx-auto mb-1 ${site.sitemap_exists ? "text-emerald-600" : "text-red-600"}`} />
                  <span className="text-[10px] text-slate-500">sitemap</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-100">
                  <Lock size={16} className={`mx-auto mb-1 ${site.ssl_valid ? "text-emerald-600" : "text-red-600"}`} />
                  <span className="text-[10px] text-slate-500">SSL</span>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Checked: {new Date(site.checked_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSite(null)}
          />
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6">
            <button
              onClick={() => setSelectedSite(null)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-100"
            >
              <XCircle size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className={`px-4 py-2 rounded-xl border ${getScoreBg(selectedSite.health_score)}`}>
                <span className={`text-2xl font-bold ${getScoreColor(selectedSite.health_score)}`}>
                  {selectedSite.health_score}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{selectedSite.website_name}</h2>
                <a
                  href={selectedSite.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-slate-900 flex items-center gap-1"
                >
                  {selectedSite.website_url}
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              {/* Robots.txt */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-slate-400" />
                  Robots.txt
                </h3>
                <div className="space-y-2">
                  <CheckItem passed={selectedSite.robots_txt_exists} label="File exists" />
                  <CheckItem passed={selectedSite.robots_txt_valid} label="Valid format" />
                  <CheckItem passed={selectedSite.robots_txt_allows_crawl} label="Allows crawling" />
                </div>
              </div>

              {/* Sitemap */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Map size={18} className="text-slate-400" />
                  Sitemap.xml
                </h3>
                <div className="space-y-2">
                  <CheckItem passed={selectedSite.sitemap_exists} label="File exists" />
                  <CheckItem passed={selectedSite.sitemap_valid} label="Valid XML" />
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100">
                    <span className="text-slate-400">URL Count:</span>
                    <span className="font-medium">{selectedSite.sitemap_url_count}</span>
                  </div>
                  {selectedSite.sitemap_url && (
                    <a
                      href={selectedSite.sitemap_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 text-sm text-slate-400 hover:text-slate-900"
                    >
                      {selectedSite.sitemap_url}
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              {/* SSL */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Lock size={18} className="text-slate-400" />
                  SSL Certificate
                </h3>
                <CheckItem passed={selectedSite.ssl_valid} label="Valid HTTPS" />
              </div>

              <div className="text-sm text-slate-500">
                Last checked: {new Date(selectedSite.checked_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
