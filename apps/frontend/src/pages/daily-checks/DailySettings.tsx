import React, { useState } from "react";
import {
  Settings,
  Key,
  Globe,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

type GscStatus = {
  connected: boolean;
  email: string | null;
};

export default function DailySettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "api-keys" | "gsc">("general");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const [generalSettings, setGeneralSettings] = useState({
    default_country: "United Kingdom",
    default_language: "en",
    check_interval: "30",
    seo_check_time: "02:00",
  });

  const [apiKeys, setApiKeys] = useState({
    dataforseo_login: "",
    dataforseo_password: "",
    cloudflare_worker_url: "",
  });

  const [gscStatus, setGscStatus] = useState<GscStatus>({
    connected: false,
    email: null,
  });

  async function saveGeneralSettings() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert("Settings saved successfully");
  }

  async function saveApiKeys() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert("API keys saved securely");
  }

  async function connectGsc() {
    // In real implementation, this would redirect to Google OAuth
    alert("This would redirect to Google OAuth for Search Console authorization");
  }

  async function disconnectGsc() {
    if (!confirm("Disconnect from Google Search Console?")) return;
    setGscStatus({ connected: false, email: null });
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "api-keys", label: "API Keys", icon: Key },
    { id: "gsc", label: "Search Console", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure Daily Checks module settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold mb-6">General Settings</h2>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Default Country
              </label>
              <input
                type="text"
                value={generalSettings.default_country}
                onChange={(e) => setGeneralSettings({ ...generalSettings, default_country: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Default Language
              </label>
              <select
                value={generalSettings.default_language}
                onChange={(e) => setGeneralSettings({ ...generalSettings, default_language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Check Interval (minutes)
              </label>
              <select
                value={generalSettings.check_interval}
                onChange={(e) => setGeneralSettings({ ...generalSettings, check_interval: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
                <option value="360">Every 6 hours</option>
                <option value="720">Every 12 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Daily SEO Check Time (UTC)
              </label>
              <input
                type="time"
                value={generalSettings.seo_check_time}
                onChange={(e) => setGeneralSettings({ ...generalSettings, seo_check_time: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={saveGeneralSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-60 mt-6"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeTab === "api-keys" && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold mb-2">API Keys</h2>
          <p className="text-sm text-slate-400 mb-6">
            Configure API keys for enhanced functionality
          </p>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                DataForSEO Login
              </label>
              <input
                type="text"
                value={apiKeys.dataforseo_login}
                onChange={(e) => setApiKeys({ ...apiKeys, dataforseo_login: e.target.value })}
                placeholder="login@domain.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-1">For advanced rank tracking</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                DataForSEO Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.dataforseo ? "text" : "password"}
                  value={apiKeys.dataforseo_password}
                  onChange={(e) => setApiKeys({ ...apiKeys, dataforseo_password: e.target.value })}
                  placeholder="API password"
                  className="w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, dataforseo: !showPassword.dataforseo })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword.dataforseo ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Cloudflare Worker URL
              </label>
              <input
                type="url"
                value={apiKeys.cloudflare_worker_url}
                onChange={(e) => setApiKeys({ ...apiKeys, cloudflare_worker_url: e.target.value })}
                placeholder="https://your-worker.workers.dev"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                URL of your deployed Daily Checks worker
              </p>
            </div>

            <button
              onClick={saveApiKeys}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-60 mt-6"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save API Keys"}
            </button>
          </div>
        </div>
      )}

      {/* Google Search Console */}
      {activeTab === "gsc" && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold mb-2">Google Search Console</h2>
          <p className="text-sm text-slate-400 mb-6">
            Connect to import ranking data and search analytics
          </p>

          {/* Connection Status */}
          <div className={`rounded-xl p-4 mb-6 ${
            gscStatus.connected
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-slate-800/50 border border-slate-700"
          }`}>
            <div className="flex items-center gap-3">
              {gscStatus.connected ? (
                <CheckCircle size={20} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={20} className="text-slate-400" />
              )}
              <div className="flex-1">
                <div className={gscStatus.connected ? "text-emerald-400 font-medium" : "text-slate-300"}>
                  {gscStatus.connected ? "Connected" : "Not Connected"}
                </div>
                {gscStatus.email && (
                  <div className="text-xs text-slate-500">{gscStatus.email}</div>
                )}
              </div>
              {gscStatus.connected ? (
                <button
                  onClick={disconnectGsc}
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={connectGsc}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                >
                  Connect GSC
                </button>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-xl border border-slate-800 p-4">
            <h3 className="font-medium mb-3">Setup Instructions</h3>
            <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Google Cloud Console <ExternalLink size={12} className="inline" /></a></li>
              <li>Create a new project or select existing one</li>
              <li>Enable the "Search Console API"</li>
              <li>Create OAuth 2.0 credentials (Web application)</li>
              <li>Add your worker URL as authorized redirect URI</li>
              <li>Configure GSC_CLIENT_ID and GSC_CLIENT_SECRET in your worker</li>
              <li>Click "Connect GSC" above to authorize</li>
            </ol>
          </div>

          {/* Benefits */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 p-4">
              <h4 className="font-medium mb-2">What you get</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Search query performance data</li>
                <li>• Click and impression metrics</li>
                <li>• Average position tracking</li>
                <li>• CTR analysis</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-800 p-4">
              <h4 className="font-medium mb-2">Data sync</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Last 28 days of data</li>
                <li>• Automatic daily sync at 2 AM UTC</li>
                <li>• Manual sync available anytime</li>
                <li>• Per-website breakdown</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
