import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Shield,
  RefreshCw,
  FileText,
  ChevronRight,
} from "lucide-react";

type ReviewItem = {
  id: string;
  project_name: string;
  domain: string;
  category: string;
  status: "ok" | "warning" | "critical";
  items: {
    name: string;
    status: "ok" | "warning" | "critical";
    message: string;
  }[];
  last_reviewed: string;
};

export default function OpsReviewPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);

    const demoReviews: ReviewItem[] = [
      {
        id: "1",
        project_name: "Main Website",
        domain: "example.com",
        category: "business",
        status: "ok",
        items: [
          { name: "SSL Certificate", status: "ok", message: "Valid until Dec 2025" },
          { name: "Domain Expiry", status: "ok", message: "Expires Jan 2026" },
          { name: "Uptime", status: "ok", message: "99.9% last 30 days" },
          { name: "Backups", status: "ok", message: "Last backup: 2 hours ago" },
        ],
        last_reviewed: new Date().toISOString(),
      },
      {
        id: "2",
        project_name: "E-Commerce Store",
        domain: "shop.example.com",
        category: "ecommerce",
        status: "warning",
        items: [
          { name: "SSL Certificate", status: "ok", message: "Valid until Nov 2025" },
          { name: "Domain Expiry", status: "ok", message: "Expires Jan 2026" },
          { name: "Uptime", status: "warning", message: "98.5% last 30 days (2 incidents)" },
          { name: "Backups", status: "warning", message: "Last backup: 3 days ago" },
          { name: "Performance", status: "warning", message: "Page load > 4s" },
        ],
        last_reviewed: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "3",
        project_name: "SaaS Dashboard",
        domain: "app.example.com",
        category: "saas",
        status: "critical",
        items: [
          { name: "SSL Certificate", status: "critical", message: "Expires in 15 days!" },
          { name: "Domain Expiry", status: "ok", message: "Expires Feb 2026" },
          { name: "Uptime", status: "ok", message: "100% last 30 days" },
          { name: "Backups", status: "ok", message: "Last backup: 1 hour ago" },
        ],
        last_reviewed: new Date().toISOString(),
      },
    ];

    setReviews(demoReviews);
    setLoading(false);
  }

  function getStatusIcon(status: string) {
    if (status === "ok") return <CheckCircle size={16} className="text-emerald-400" />;
    if (status === "warning") return <AlertTriangle size={16} className="text-amber-400" />;
    return <AlertTriangle size={16} className="text-red-400" />;
  }

  function getStatusBg(status: string) {
    if (status === "ok") return "bg-emerald-500/10 border-emerald-500/20";
    if (status === "warning") return "bg-amber-500/10 border-amber-500/20";
    return "bg-red-500/10 border-red-500/20";
  }

  const okCount = reviews.filter(r => r.status === "ok").length;
  const warningCount = reviews.filter(r => r.status === "warning").length;
  const criticalCount = reviews.filter(r => r.status === "critical").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ops Review</h1>
          <p className="text-sm text-slate-400 mt-1">
            Operational health checklist for all projects
          </p>
        </div>
        <button
          onClick={loadReviews}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors"
        >
          <RefreshCw size={16} />
          Refresh All
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-emerald-400">{okCount}</div>
              <div className="text-xs text-slate-500">All Clear</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-amber-400">{warningCount}</div>
              <div className="text-xs text-slate-500">Warnings</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-red-400">{criticalCount}</div>
              <div className="text-xs text-slate-500">Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No projects to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-xl border ${getStatusBg(review.status)} overflow-hidden`}
            >
              <button
                onClick={() => setExpandedId(expandedId === review.id ? null : review.id)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(review.status)}
                  <div className="text-left">
                    <div className="font-medium">{review.project_name}</div>
                    <div className="text-xs text-slate-500">{review.domain}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500">
                    Last reviewed: {new Date(review.last_reviewed).toLocaleDateString()}
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-slate-500 transition-transform ${expandedId === review.id ? "rotate-90" : ""}`}
                  />
                </div>
              </button>

              {expandedId === review.id && (
                <div className="px-4 pb-4 pt-0">
                  <div className="border-t border-slate-700/50 pt-4 space-y-2">
                    {review.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/30"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-xs text-slate-400">{item.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-medium mb-3">Review Checklist Items</h3>
        <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Shield size={14} />
            SSL Certificate expiry
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} />
            Domain registration expiry
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            Uptime monitoring
          </div>
          <div className="flex items-center gap-2">
            <FileText size={14} />
            Backup status
          </div>
        </div>
      </div>
    </div>
  );
}
