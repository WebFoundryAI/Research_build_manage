import React, { useState } from "react";
import {
  Settings,
  Bell,
  Globe,
  Key,
  Save,
  RefreshCw,
  Mail,
  Slack,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AssetSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "integrations">("general");
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    default_status: "Idea / Backlog",
    health_check_interval: "24",
    auto_backup: true,
    trash_retention_days: "30",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_alerts: true,
    slack_alerts: false,
    critical_only: false,
    daily_digest: true,
    email: "",
    slack_webhook: "",
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    google_analytics_id: "",
    cloudflare_api_key: "",
    uptime_robot_key: "",
  });

  async function saveSettings() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert("Settings saved successfully");
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Key },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure Asset Tracker preferences
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
                ? "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold mb-6">General Settings</h2>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Default Project Status
              </label>
              <select
                value={generalSettings.default_status}
                onChange={(e) => setGeneralSettings({ ...generalSettings, default_status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Idea / Backlog">Idea / Backlog</option>
                <option value="Planning">Planning</option>
                <option value="In Build">In Build</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Health Check Interval (hours)
              </label>
              <select
                value={generalSettings.health_check_interval}
                onChange={(e) => setGeneralSettings({ ...generalSettings, health_check_interval: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="1">Every hour</option>
                <option value="6">Every 6 hours</option>
                <option value="12">Every 12 hours</option>
                <option value="24">Every 24 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Trash Retention (days)
              </label>
              <select
                value={generalSettings.trash_retention_days}
                onChange={(e) => setGeneralSettings({ ...generalSettings, trash_retention_days: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-slate-200">
              <div>
                <div className="font-medium text-sm">Auto Backup</div>
                <div className="text-xs text-slate-500">Automatically backup project data</div>
              </div>
              <button
                onClick={() => setGeneralSettings({ ...generalSettings, auto_backup: !generalSettings.auto_backup })}
                className={`w-12 h-6 rounded-full transition-colors ${generalSettings.auto_backup ? "bg-blue-500" : "bg-slate-200"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${generalSettings.auto_backup ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors disabled:opacity-60 mt-6"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === "notifications" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>

          <div className="space-y-4 max-w-md">
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-slate-400" />
                <div>
                  <div className="font-medium text-sm">Email Alerts</div>
                  <div className="text-xs text-slate-500">Receive alerts via email</div>
                </div>
              </div>
              <button
                onClick={() => setNotificationSettings({ ...notificationSettings, email_alerts: !notificationSettings.email_alerts })}
                className={`w-12 h-6 rounded-full transition-colors ${notificationSettings.email_alerts ? "bg-blue-500" : "bg-slate-200"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notificationSettings.email_alerts ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            {notificationSettings.email_alerts && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={notificationSettings.email}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, email: e.target.value })}
                  placeholder="alerts@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Slack size={18} className="text-slate-400" />
                <div>
                  <div className="font-medium text-sm">Slack Alerts</div>
                  <div className="text-xs text-slate-500">Send alerts to Slack</div>
                </div>
              </div>
              <button
                onClick={() => setNotificationSettings({ ...notificationSettings, slack_alerts: !notificationSettings.slack_alerts })}
                className={`w-12 h-6 rounded-full transition-colors ${notificationSettings.slack_alerts ? "bg-blue-500" : "bg-slate-200"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notificationSettings.slack_alerts ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div>
                <div className="font-medium text-sm">Critical Only</div>
                <div className="text-xs text-slate-500">Only receive critical alerts</div>
              </div>
              <button
                onClick={() => setNotificationSettings({ ...notificationSettings, critical_only: !notificationSettings.critical_only })}
                className={`w-12 h-6 rounded-full transition-colors ${notificationSettings.critical_only ? "bg-blue-500" : "bg-slate-200"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notificationSettings.critical_only ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Daily Digest</div>
                <div className="text-xs text-slate-500">Receive daily summary email</div>
              </div>
              <button
                onClick={() => setNotificationSettings({ ...notificationSettings, daily_digest: !notificationSettings.daily_digest })}
                className={`w-12 h-6 rounded-full transition-colors ${notificationSettings.daily_digest ? "bg-blue-500" : "bg-slate-200"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notificationSettings.daily_digest ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors disabled:opacity-60 mt-6"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}

      {/* Integrations Settings */}
      {activeTab === "integrations" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold mb-2">Integrations</h2>
          <p className="text-sm text-slate-400 mb-6">Connect external services for enhanced monitoring</p>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Google Analytics Property ID
              </label>
              <input
                type="text"
                value={integrationSettings.google_analytics_id}
                onChange={(e) => setIntegrationSettings({ ...integrationSettings, google_analytics_id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Cloudflare API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={integrationSettings.cloudflare_api_key}
                  onChange={(e) => setIntegrationSettings({ ...integrationSettings, cloudflare_api_key: e.target.value })}
                  placeholder="Your Cloudflare API key"
                  className="w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                UptimeRobot API Key
              </label>
              <input
                type="password"
                value={integrationSettings.uptime_robot_key}
                onChange={(e) => setIntegrationSettings({ ...integrationSettings, uptime_robot_key: e.target.value })}
                placeholder="Your UptimeRobot API key"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors disabled:opacity-60 mt-6"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
