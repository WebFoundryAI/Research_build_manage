import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Shield,
} from "lucide-react";

type ApiKey = {
  id: string;
  keyId: string;
  maskedKey: string;
  plan: "free" | "pro";
  status: "active" | "disabled";
  createdAt: string;
  lastUsed: string | null;
  requestsToday: number;
  dailyLimit: number;
};

export default function NicoGeoApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyPlan, setNewKeyPlan] = useState<"free" | "pro">("free");
  const [newKeyNote, setNewKeyNote] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setKeys([
      {
        id: "1",
        keyId: "key-prod-001",
        maskedKey: "sk-****************************1234",
        plan: "pro",
        status: "active",
        createdAt: "2024-12-01T00:00:00Z",
        lastUsed: new Date().toISOString(),
        requestsToday: 127,
        dailyLimit: 500,
      },
      {
        id: "2",
        keyId: "key-dev-001",
        maskedKey: "sk-****************************5678",
        plan: "free",
        status: "active",
        createdAt: "2024-12-15T00:00:00Z",
        lastUsed: new Date(Date.now() - 86400000).toISOString(),
        requestsToday: 8,
        dailyLimit: 20,
      },
    ]);
    setLoading(false);
  }

  async function createKey() {
    const generatedKey = `sk-${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`;
    setNewKey(generatedKey);
    setKeys((prev) => [
      {
        id: Date.now().toString(),
        keyId: `key-${Date.now()}`,
        maskedKey: `sk-****************************${generatedKey.slice(-4)}`,
        plan: newKeyPlan,
        status: "active",
        createdAt: new Date().toISOString(),
        lastUsed: null,
        requestsToday: 0,
        dailyLimit: newKeyPlan === "pro" ? 500 : 20,
      },
      ...prev,
    ]);
  }

  function deleteKey(id: string) {
    if (!confirm("Delete this API key? This action cannot be undone.")) return;
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function toggleKeyStatus(id: string) {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === id
          ? { ...k, status: k.status === "active" ? "disabled" : "active" }
          : k
      )
    );
  }

  async function copyKey(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <Key className="text-amber-400" />
            API Keys
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your GEO API authentication keys
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          Create Key
        </button>
      </div>

      {/* Warning */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-400">Keep your keys secure</h3>
            <p className="text-sm text-slate-400 mt-1">
              API keys provide full access to your account. Never share them publicly or commit them to version control.
            </p>
          </div>
        </div>
      </div>

      {/* Plan Limits */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Free Plan</h3>
            <span className="px-2 py-1 rounded text-xs bg-slate-800">Default</span>
          </div>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>Daily Limit</span>
              <span className="text-white">20 requests</span>
            </div>
            <div className="flex justify-between">
              <span>Burst Rate</span>
              <span className="text-white">2 per minute</span>
            </div>
            <div className="flex justify-between">
              <span>Features</span>
              <span className="text-white">Generate, Audit, Improve</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-amber-400">Pro Plan</h3>
            <span className="px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400">Recommended</span>
          </div>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>Daily Limit</span>
              <span className="text-white">500 requests</span>
            </div>
            <div className="flex justify-between">
              <span>Burst Rate</span>
              <span className="text-white">30 per minute</span>
            </div>
            <div className="flex justify-between">
              <span>Features</span>
              <span className="text-white">All + GitHub Write-back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keys List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading keys...</div>
      ) : keys.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Key size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No API keys yet</p>
          <p className="text-sm text-slate-500 mt-1">Create your first key to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`rounded-xl border p-4 ${
                key.status === "active"
                  ? "border-slate-800 bg-slate-900/40"
                  : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${key.plan === "pro" ? "bg-amber-500/20" : "bg-slate-800"}`}>
                    <Key size={18} className={key.plan === "pro" ? "text-amber-400" : "text-slate-400"} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono">{key.maskedKey}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        key.plan === "pro" ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400"
                      }`}>
                        {key.plan}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        key.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {key.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span>ID: {key.keyId}</span>
                      <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                      {key.lastUsed && (
                        <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Usage */}
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="font-medium">{key.requestsToday}</span>
                      <span className="text-slate-500">/{key.dailyLimit}</span>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-slate-800 mt-1">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${(key.requestsToday / key.dailyLimit) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleKeyStatus(key.id)}
                      className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
                      title={key.status === "active" ? "Disable" : "Enable"}
                    >
                      {key.status === "active" ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => deleteKey(key.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowCreateModal(false);
              setNewKey(null);
              setNewKeyNote("");
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
            {!newKey ? (
              <>
                <h2 className="text-lg font-semibold mb-4">Create API Key</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Plan</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewKeyPlan("free")}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        newKeyPlan === "free"
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="font-medium">Free</div>
                      <div className="text-xs text-slate-500">20 requests/day</div>
                    </button>
                    <button
                      onClick={() => setNewKeyPlan("pro")}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        newKeyPlan === "pro"
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="font-medium text-amber-400">Pro</div>
                      <div className="text-xs text-slate-500">500 requests/day</div>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Note (optional)</label>
                  <input
                    type="text"
                    value={newKeyNote}
                    onChange={(e) => setNewKeyNote(e.target.value)}
                    placeholder="e.g., Production server"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewKeyNote("");
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createKey}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium transition-colors"
                  >
                    Create Key
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <CheckCircle size={20} className="text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-semibold">Key Created!</h2>
                </div>

                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className="text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-400">
                      Copy this key now. You won't be able to see it again.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800 font-mono text-sm mb-4 flex items-center justify-between">
                  <span className="break-all">{newKey}</span>
                  <button
                    onClick={() => copyKey(newKey, "new")}
                    className="ml-2 p-2 rounded hover:bg-slate-700"
                  >
                    {copied === "new" ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewKey(null);
                    setNewKeyNote("");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
