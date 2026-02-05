import React, { useState } from "react";
import {
  Settings,
  Globe2,
  Code,
  FileText,
  Save,
  RefreshCw,
  GitBranch,
  AlertCircle,
} from "lucide-react";

export default function NicoGeoSettings() {
  const [saving, setSaving] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    defaultOutputFormat: "json",
    includeSchemaMarkup: true,
    antiHallucination: true,
    maxFaqs: "5",
    answerCapsuleLength: "medium",
  });

  const [apiSettings, setApiSettings] = useState({
    workerUrl: "",
    defaultPlan: "free",
    enableRateLimiting: true,
  });

  const [gitHubSettings, setGitHubSettings] = useState({
    defaultOwner: "",
    defaultRepo: "",
    defaultBranch: "main",
    projectType: "astro-pages",
  });

  async function saveSettings() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    alert("Settings saved successfully");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          <Settings className="text-slate-400" />
          Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure Nico GEO engine preferences
        </p>
      </div>

      {/* General Settings */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Globe2 size={20} className="text-teal-400" />
          Content Generation
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Default Output Format
            </label>
            <select
              value={generalSettings.defaultOutputFormat}
              onChange={(e) =>
                setGeneralSettings({ ...generalSettings, defaultOutputFormat: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-teal-500"
            >
              <option value="json">JSON (Recommended)</option>
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Maximum FAQs to Generate
            </label>
            <select
              value={generalSettings.maxFaqs}
              onChange={(e) =>
                setGeneralSettings({ ...generalSettings, maxFaqs: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-teal-500"
            >
              <option value="3">3 FAQs</option>
              <option value="5">5 FAQs</option>
              <option value="10">10 FAQs</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Answer Capsule Length
            </label>
            <select
              value={generalSettings.answerCapsuleLength}
              onChange={(e) =>
                setGeneralSettings({ ...generalSettings, answerCapsuleLength: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-teal-500"
            >
              <option value="short">Short (1-2 sentences)</option>
              <option value="medium">Medium (2-3 sentences)</option>
              <option value="long">Long (3-4 sentences)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <div className="font-medium text-sm">Include Schema.org Markup</div>
              <div className="text-xs text-slate-500">Generate JSON-LD structured data</div>
            </div>
            <button
              onClick={() =>
                setGeneralSettings({
                  ...generalSettings,
                  includeSchemaMarkup: !generalSettings.includeSchemaMarkup,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                generalSettings.includeSchemaMarkup ? "bg-teal-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  generalSettings.includeSchemaMarkup ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <div className="font-medium text-sm flex items-center gap-2">
                Anti-Hallucination Mode
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">Required</span>
              </div>
              <div className="text-xs text-slate-500">Output derived solely from input data</div>
            </div>
            <button
              disabled
              className="w-12 h-6 rounded-full bg-emerald-500 opacity-75 cursor-not-allowed"
            >
              <div className="w-5 h-5 rounded-full bg-white translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Code size={20} className="text-blue-400" />
          API Configuration
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Cloudflare Worker URL
            </label>
            <input
              type="url"
              value={apiSettings.workerUrl}
              onChange={(e) => setApiSettings({ ...apiSettings, workerUrl: e.target.value })}
              placeholder="https://your-worker.workers.dev"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Default API Plan
            </label>
            <select
              value={apiSettings.defaultPlan}
              onChange={(e) => setApiSettings({ ...apiSettings, defaultPlan: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="free">Free (20 req/day)</option>
              <option value="pro">Pro (500 req/day)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <div className="font-medium text-sm">Enable Rate Limiting</div>
              <div className="text-xs text-slate-500">Enforce daily and burst limits</div>
            </div>
            <button
              onClick={() =>
                setApiSettings({ ...apiSettings, enableRateLimiting: !apiSettings.enableRateLimiting })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                apiSettings.enableRateLimiting ? "bg-blue-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  apiSettings.enableRateLimiting ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* GitHub Settings */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <GitBranch size={20} className="text-purple-400" />
          GitHub Integration (Pro)
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Default Repository Owner
            </label>
            <input
              type="text"
              value={gitHubSettings.defaultOwner}
              onChange={(e) => setGitHubSettings({ ...gitHubSettings, defaultOwner: e.target.value })}
              placeholder="your-org"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Default Repository
            </label>
            <input
              type="text"
              value={gitHubSettings.defaultRepo}
              onChange={(e) => setGitHubSettings({ ...gitHubSettings, defaultRepo: e.target.value })}
              placeholder="your-site"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Default Branch
            </label>
            <input
              type="text"
              value={gitHubSettings.defaultBranch}
              onChange={(e) => setGitHubSettings({ ...gitHubSettings, defaultBranch: e.target.value })}
              placeholder="main"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Project Type
            </label>
            <select
              value={gitHubSettings.projectType}
              onChange={(e) => setGitHubSettings({ ...gitHubSettings, projectType: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="astro-pages">Astro Pages</option>
              <option value="next-pages">Next.js Pages</option>
              <option value="static-html">Static HTML</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors disabled:opacity-60"
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
