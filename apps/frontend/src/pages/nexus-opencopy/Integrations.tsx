import React, { useState } from "react";
import {
  Link2,
  CheckCircle,
  XCircle,
  Settings,
  ExternalLink,
  RefreshCw,
  Plus,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string | null;
  config?: Record<string, string>;
};

export default function NexusOpenCopyIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  const [showConfigModal, setShowConfigModal] = useState<string | null>(null);

  function getStatusIcon(status: string) {
    if (status === "connected") return <CheckCircle size={16} className="text-emerald-600" />;
    if (status === "error") return <XCircle size={16} className="text-red-600" />;
    return <div className="w-4 h-4 rounded-full border-2 border-slate-300" />;
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      connected: "bg-emerald-500/20 text-emerald-600",
      disconnected: "bg-slate-200 text-slate-400",
      error: "bg-red-500/20 text-red-600",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  }

  function toggleConnection(id: string) {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: i.status === "connected" ? "disconnected" : "connected",
              lastSync: i.status === "disconnected" ? new Date().toISOString() : i.lastSync,
            }
          : i
      )
    );
  }

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <Link2 className="text-cyan-600" />
            Integrations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect external services for content publishing
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {connectedCount} of {integrations.length} connected
        </div>
      </div>

      {/* Integration Cards */}
      {integrations.length === 0 ? (
        <EmptyState
          title="No integrations connected"
          description="Connect a publishing platform to sync content."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className={`rounded-xl border p-5 transition-colors ${
                integration.status === "connected"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : integration.status === "error"
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {integration.name}
                      {getStatusIcon(integration.status)}
                    </h3>
                    {integration.config && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {Object.values(integration.config)[0]}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>

              <p className="text-sm text-slate-400 mb-4">{integration.description}</p>

              {integration.lastSync && (
                <div className="text-xs text-slate-500 mb-4">
                  Last synced: {new Date(integration.lastSync).toLocaleString()}
                </div>
              )}

              <div className="flex gap-2">
                {integration.status === "connected" ? (
                  <>
                    <button
                      onClick={() => setShowConfigModal(integration.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-sm transition-colors"
                    >
                      <Settings size={14} />
                      Configure
                    </button>
                    <button
                      onClick={() => toggleConnection(integration.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-600 text-sm transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggleConnection(integration.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm transition-colors"
                  >
                    <Plus size={14} />
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Link2 size={18} className="text-cyan-600" />
          API Access
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Use our REST API to integrate with custom platforms and workflows.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-100">
            <div className="text-xs text-slate-500 mb-1">API Endpoint</div>
            <code className="text-sm text-cyan-600">https://api.nexusopencopy.com/v1</code>
          </div>
          <div className="p-4 rounded-lg bg-slate-100">
            <div className="text-xs text-slate-500 mb-1">Documentation</div>
            <a
              href="#"
              className="text-sm text-cyan-600 hover:text-cyan-300 flex items-center gap-1"
            >
              View API Docs
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <RefreshCw size={18} className="text-purple-600" />
            Webhooks
          </h3>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-sm">
            <Plus size={14} />
            Add Webhook
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Receive real-time notifications when content is generated or published.
        </p>
        <div className="rounded-lg border border-slate-200 p-4 text-center text-slate-500 text-sm">
          No webhooks configured
        </div>
      </div>
    </div>
  );
}
