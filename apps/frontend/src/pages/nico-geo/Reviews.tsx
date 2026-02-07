import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  GitBranch,
  Eye,
  Play,
  RefreshCw,
} from "lucide-react";

type ReviewSession = {
  id: string;
  siteUrl: string;
  status: "pending" | "approved" | "applied" | "expired";
  createdAt: string;
  expiresAt: string;
  targetRepo: {
    owner: string;
    repo: string;
    branch: string;
  };
  plannedFilesCount: number;
  commitShas?: string[];
};

export default function NicoGeoReviews() {
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ReviewSession | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setSessions([
      {
        id: "abc12345-1234-4567-89ab-cdef01234567",
        siteUrl: "https://example.com",
        status: "pending",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: new Date(Date.now() + 82800000).toISOString(),
        targetRepo: {
          owner: "your-org",
          repo: "your-site",
          branch: "main",
        },
        plannedFilesCount: 3,
      },
      {
        id: "def67890-5678-9012-bcde-f01234567890",
        siteUrl: "https://shop.example.com",
        status: "approved",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        expiresAt: new Date(Date.now() + 79200000).toISOString(),
        targetRepo: {
          owner: "your-org",
          repo: "shop-site",
          branch: "main",
        },
        plannedFilesCount: 5,
      },
      {
        id: "ghi34567-9012-3456-efgh-234567890123",
        siteUrl: "https://blog.example.com",
        status: "applied",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: new Date(Date.now() - 3600000).toISOString(),
        targetRepo: {
          owner: "your-org",
          repo: "blog-site",
          branch: "main",
        },
        plannedFilesCount: 2,
        commitShas: ["abc123", "def456"],
      },
    ]);
    setLoading(false);
  }

  function getStatusIcon(status: string) {
    if (status === "pending") return <Clock size={16} className="text-amber-600" />;
    if (status === "approved") return <CheckCircle size={16} className="text-blue-600" />;
    if (status === "applied") return <CheckCircle size={16} className="text-emerald-600" />;
    return <XCircle size={16} className="text-red-600" />;
  }

  function getStatusBg(status: string) {
    if (status === "pending") return "bg-amber-500/10 border-amber-500/20";
    if (status === "approved") return "bg-blue-500/10 border-blue-500/20";
    if (status === "applied") return "bg-emerald-500/10 border-emerald-500/20";
    return "bg-red-500/10 border-red-500/20";
  }

  function getTimeRemaining(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  async function approveSession(id: string) {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" as const } : s))
    );
  }

  async function applySession(id: string) {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "applied" as const, commitShas: ["new123", "new456"] }
          : s
      )
    );
  }

  const pendingCount = sessions.filter((s) => s.status === "pending").length;
  const approvedCount = sessions.filter((s) => s.status === "approved").length;
  const appliedCount = sessions.filter((s) => s.status === "applied").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <ClipboardCheck className="text-amber-600" />
            Review Sessions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage and approve content changes before deployment
          </p>
        </div>
        <button
          onClick={loadSessions}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-sm transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-amber-600">{pendingCount}</div>
              <div className="text-xs text-slate-500">Pending Review</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <CheckCircle size={18} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-600">{approvedCount}</div>
              <div className="text-xs text-slate-500">Approved</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-emerald-600">{appliedCount}</div>
              <div className="text-xs text-slate-500">Applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <ClipboardCheck size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No review sessions</p>
          <p className="text-sm text-slate-500 mt-1">
            Create a session from the Improve page
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`rounded-xl border ${getStatusBg(session.status)} p-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(session.status)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <a
                        href={session.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-blue-600 flex items-center gap-1"
                      >
                        {session.siteUrl}
                        <ExternalLink size={14} />
                      </a>
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 capitalize">
                        {session.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <GitBranch size={14} />
                        {session.targetRepo.owner}/{session.targetRepo.repo}:{session.targetRepo.branch}
                      </span>
                      <span>{session.plannedFilesCount} files</span>
                      {session.status !== "applied" && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {getTimeRemaining(session.expiresAt)} remaining
                        </span>
                      )}
                    </div>

                    {session.commitShas && (
                      <div className="mt-2 text-xs text-emerald-600">
                        Commits: {session.commitShas.join(", ")}
                      </div>
                    )}

                    <div className="text-xs text-slate-500 mt-2">
                      Session ID: {session.id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSession(session)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  {session.status === "pending" && (
                    <button
                      onClick={() => approveSession(session.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                  )}
                  {session.status === "approved" && (
                    <button
                      onClick={() => applySession(session.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
                    >
                      <Play size={14} />
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" />
          Session Lifecycle
        </h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <div className="font-medium">Create</div>
              <div className="text-xs text-slate-500">Session created with 24h TTL</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <div className="font-medium">Review</div>
              <div className="text-xs text-slate-500">View diff previews</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center text-xs font-bold">3</div>
            <div>
              <div className="font-medium">Approve</div>
              <div className="text-xs text-slate-500">Mark ready for deploy</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs font-bold">4</div>
            <div>
              <div className="font-medium">Apply</div>
              <div className="text-xs text-slate-500">Write to GitHub</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
