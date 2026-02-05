import React, { useState } from "react";
import {
  Settings,
  FileText,
  Globe,
  Sparkles,
  Save,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export default function NexusOpenCopySettings() {
  const [saving, setSaving] = useState(false);

  const [contentSettings, setContentSettings] = useState({
    defaultWordCount: "2000",
    defaultTone: "professional",
    defaultLanguage: "en",
    includeImages: true,
    includeInternalLinks: true,
    includeFaqs: true,
    seoOptimization: true,
  });

  const [aiSettings, setAiSettings] = useState({
    model: "gpt-4",
    temperature: "0.7",
    maxTokens: "4000",
    enableFactChecking: true,
  });

  const [publishingSettings, setPublishingSettings] = useState({
    autoPublish: false,
    requireReview: true,
    defaultStatus: "draft",
    notifyOnPublish: true,
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
          Configure Nexus OpenCopy preferences
        </p>
      </div>

      {/* Content Settings */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <FileText size={20} className="text-pink-400" />
          Content Generation
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Default Word Count Target
            </label>
            <select
              value={contentSettings.defaultWordCount}
              onChange={(e) =>
                setContentSettings({ ...contentSettings, defaultWordCount: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-pink-500"
            >
              <option value="1000">~1,000 words</option>
              <option value="1500">~1,500 words</option>
              <option value="2000">~2,000 words</option>
              <option value="2500">~2,500 words</option>
              <option value="3000">~3,000 words</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Default Writing Tone
            </label>
            <select
              value={contentSettings.defaultTone}
              onChange={(e) =>
                setContentSettings({ ...contentSettings, defaultTone: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-pink-500"
            >
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="academic">Academic</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Default Language
            </label>
            <select
              value={contentSettings.defaultLanguage}
              onChange={(e) =>
                setContentSettings({ ...contentSettings, defaultLanguage: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-pink-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <div className="font-medium text-sm">Include Image Suggestions</div>
              <div className="text-xs text-slate-500">Suggest images for articles</div>
            </div>
            <button
              onClick={() =>
                setContentSettings({ ...contentSettings, includeImages: !contentSettings.includeImages })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                contentSettings.includeImages ? "bg-pink-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  contentSettings.includeImages ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <div className="font-medium text-sm">Internal Linking</div>
              <div className="text-xs text-slate-500">Auto-suggest internal links</div>
            </div>
            <button
              onClick={() =>
                setContentSettings({
                  ...contentSettings,
                  includeInternalLinks: !contentSettings.includeInternalLinks,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                contentSettings.includeInternalLinks ? "bg-pink-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  contentSettings.includeInternalLinks ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <div className="font-medium text-sm">Generate FAQs</div>
              <div className="text-xs text-slate-500">Include FAQ section in articles</div>
            </div>
            <button
              onClick={() =>
                setContentSettings({ ...contentSettings, includeFaqs: !contentSettings.includeFaqs })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                contentSettings.includeFaqs ? "bg-pink-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  contentSettings.includeFaqs ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <div className="font-medium text-sm">SEO Optimization</div>
              <div className="text-xs text-slate-500">Auto-optimize for search engines</div>
            </div>
            <button
              onClick={() =>
                setContentSettings({ ...contentSettings, seoOptimization: !contentSettings.seoOptimization })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                contentSettings.seoOptimization ? "bg-pink-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  contentSettings.seoOptimization ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Sparkles size={20} className="text-purple-400" />
          AI Configuration
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              AI Model
            </label>
            <select
              value={aiSettings.model}
              onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="gpt-4">GPT-4 (Recommended)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Temperature (Creativity)
            </label>
            <select
              value={aiSettings.temperature}
              onChange={(e) => setAiSettings({ ...aiSettings, temperature: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="0.3">0.3 - More focused</option>
              <option value="0.5">0.5 - Balanced</option>
              <option value="0.7">0.7 - More creative</option>
              <option value="0.9">0.9 - Highly creative</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <div className="font-medium text-sm">Fact Checking</div>
              <div className="text-xs text-slate-500">Verify claims in generated content</div>
            </div>
            <button
              onClick={() =>
                setAiSettings({ ...aiSettings, enableFactChecking: !aiSettings.enableFactChecking })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                aiSettings.enableFactChecking ? "bg-purple-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  aiSettings.enableFactChecking ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Publishing Settings */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Globe size={20} className="text-emerald-400" />
          Publishing
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Default Article Status
            </label>
            <select
              value={publishingSettings.defaultStatus}
              onChange={(e) =>
                setPublishingSettings({ ...publishingSettings, defaultStatus: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <div className="font-medium text-sm">Require Review</div>
              <div className="text-xs text-slate-500">Articles must be reviewed before publishing</div>
            </div>
            <button
              onClick={() =>
                setPublishingSettings({
                  ...publishingSettings,
                  requireReview: !publishingSettings.requireReview,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                publishingSettings.requireReview ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  publishingSettings.requireReview ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <div className="font-medium text-sm">Notify on Publish</div>
              <div className="text-xs text-slate-500">Send notifications when articles are published</div>
            </div>
            <button
              onClick={() =>
                setPublishingSettings({
                  ...publishingSettings,
                  notifyOnPublish: !publishingSettings.notifyOnPublish,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                publishingSettings.notifyOnPublish ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  publishingSettings.notifyOnPublish ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
          <AlertTriangle size={20} />
          Danger Zone
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Reset All Settings</div>
              <div className="text-xs text-slate-500">Restore default configuration</div>
            </div>
            <button className="px-4 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-red-400 text-sm transition-colors">
              Reset
            </button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-red-500/20">
            <div>
              <div className="font-medium text-sm">Delete All Data</div>
              <div className="text-xs text-slate-500">Permanently delete all projects and articles</div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm transition-colors">
              Delete All
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium transition-colors disabled:opacity-60"
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
