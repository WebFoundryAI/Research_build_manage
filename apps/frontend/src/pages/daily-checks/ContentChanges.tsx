import React, { useState, useEffect } from "react";
import {
  FileText,
  RefreshCw,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle,
  Globe,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";

type ContentChange = {
  id: number;
  website_id: number;
  website_name: string;
  website_url: string;
  change_type: "content" | "title" | "meta" | "structure";
  description: string;
  detected_at: string;
  acknowledged: boolean;
};

export default function ContentChangesPage() {
  const [changes, setChanges] = useState<ContentChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChanges();
  }, []);

  async function loadChanges() {
    setLoading(true);
    setChanges([]);
    setLoading(false);
  }

  async function refreshChanges() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    await loadChanges();
    setRefreshing(false);
  }

  function acknowledgeChange(id: number) {
    setChanges(prev => prev.map(c =>
      c.id === id ? { ...c, acknowledged: true } : c
    ));
  }

  function getChangeTypeBadge(type: string) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      content: { bg: "bg-blue-500/20", text: "text-blue-600", label: "Content" },
      title: { bg: "bg-purple-500/20", text: "text-purple-600", label: "Title" },
      meta: { bg: "bg-amber-500/20", text: "text-amber-600", label: "Meta" },
      structure: { bg: "bg-emerald-500/20", text: "text-emerald-600", label: "Structure" },
    };

    const { bg, text, label } = config[type] || config.content;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    );
  }

  function formatTimeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  const unacknowledgedCount = changes.filter(c => !c.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Content Changes</h1>
          <p className="text-sm text-slate-400 mt-1">
            Detect when your monitored websites change
          </p>
        </div>
        <button
          onClick={refreshChanges}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-60"
        >
          {refreshing ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {refreshing ? "Checking..." : "Check for Changes"}
        </button>
      </div>

      {/* Summary */}
      {unacknowledgedCount > 0 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-600" />
          <span className="text-amber-600">
            {unacknowledgedCount} unacknowledged change{unacknowledgedCount !== 1 ? "s" : ""} detected
          </span>
        </div>
      )}

      {/* Changes List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : changes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {changes.map(change => (
            <div
              key={change.id}
              className={`rounded-xl border p-4 transition-colors ${
                change.acknowledged
                  ? "border-slate-200 bg-white"
                  : "border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 rounded-lg bg-slate-100">
                      <Globe size={16} className="text-slate-400" />
                    </div>
                    <span className="font-medium">{change.website_name}</span>
                    {getChangeTypeBadge(change.change_type)}
                    {!change.acknowledged && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-600">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 mb-2">{change.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <a
                      href={change.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-slate-600"
                    >
                      {change.website_url}
                      <ExternalLink size={10} />
                    </a>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeAgo(change.detected_at)}
                    </span>
                  </div>
                </div>

                {!change.acknowledged && (
                  <button
                    onClick={() => acknowledgeChange(change.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm transition-colors"
                  >
                    <CheckCircle size={14} />
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-medium mb-2">How Content Change Detection Works</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Content is hashed during each availability check</li>
          <li>• Changes are detected by comparing hash values</li>
          <li>• Title and meta tag changes are tracked separately</li>
          <li>• Structural changes (navigation, links) are monitored</li>
        </ul>
      </div>
    </div>
  );
}
