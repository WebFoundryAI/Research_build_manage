import { useState, useEffect } from "react";
import { Settings, Globe, FileText, Bell, Database, Save } from "lucide-react";

interface McpToolsSettings {
  defaultLocation: number;
  defaultLanguage: string;
  defaultKeywordLimit: number;
  autoSaveResults: boolean;
  defaultExportFormat: "csv" | "pdf";
  showCreditWarnings: boolean;
  creditWarningThreshold: number;
}

const LOCATION_OPTIONS = [
  { code: 2840, name: "United States" },
  { code: 2826, name: "United Kingdom" },
  { code: 2124, name: "Canada" },
  { code: 2036, name: "Australia" },
  { code: 2276, name: "Germany" },
  { code: 2250, name: "France" },
];

const LANGUAGE_OPTIONS = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
];

function getDefaultSettings(): McpToolsSettings {
  return {
    defaultLocation: 2840,
    defaultLanguage: "en",
    defaultKeywordLimit: 50,
    autoSaveResults: true,
    defaultExportFormat: "csv",
    showCreditWarnings: true,
    creditWarningThreshold: 100,
  };
}

export default function McpSettings() {
  const [settings, setSettings] = useState<McpToolsSettings>(() => {
    const saved = localStorage.getItem("mcp-tools-settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultSettings();
      }
    }
    return getDefaultSettings();
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const updateSetting = <K extends keyof McpToolsSettings>(key: K, value: McpToolsSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem("mcp-tools-settings", JSON.stringify(settings));
    setHasChanges(false);
    showFeedback("success", "Settings saved");
  };

  const resetToDefaults = () => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    localStorage.setItem("mcp-tools-settings", JSON.stringify(defaults));
    setHasChanges(false);
    showFeedback("success", "Settings reset to defaults");
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {feedback && (
        <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {feedback.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Settings className="h-6 w-6 text-blue-400" />
            MCP Tools Settings
          </h1>
          <p className="text-slate-400">Configure default preferences for research tools</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetToDefaults} className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            Reset to Defaults
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Location & Language */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Default Location & Language
          </h2>
          <p className="text-sm text-slate-400">These settings will be pre-filled when you start new research</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Default Location</label>
              <select
                value={settings.defaultLocation}
                onChange={(e) => updateSetting("defaultLocation", Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc.code} value={loc.code}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Default Language</label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => updateSetting("defaultLanguage", e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Research Defaults */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            Research Defaults
          </h2>
          <p className="text-sm text-slate-400">Configure default limits and behavior for research tools</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Default Keyword Limit</label>
              <select
                value={settings.defaultKeywordLimit}
                onChange={(e) => updateSetting("defaultKeywordLimit", Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25 keywords</option>
                <option value={50}>50 keywords</option>
                <option value={100}>100 keywords</option>
                <option value={200}>200 keywords</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Default Export Format</label>
              <select
                value={settings.defaultExportFormat}
                onChange={(e) => updateSetting("defaultExportFormat", e.target.value as "csv" | "pdf")}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV (Spreadsheet)</option>
                <option value="pdf">PDF (Report)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-300">Auto-save Results</label>
                <p className="text-sm text-slate-500">Automatically save research results to history</p>
              </div>
              <button
                onClick={() => updateSetting("autoSaveResults", !settings.autoSaveResults)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoSaveResults ? "bg-blue-600" : "bg-slate-700"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoSaveResults ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications & Warnings
          </h2>
          <p className="text-sm text-slate-400">Configure when you receive warnings and alerts</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-300">Show Credit Warnings</label>
              <p className="text-sm text-slate-500">Alert when credits are running low</p>
            </div>
            <button
              onClick={() => updateSetting("showCreditWarnings", !settings.showCreditWarnings)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showCreditWarnings ? "bg-blue-600" : "bg-slate-700"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showCreditWarnings ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {settings.showCreditWarnings && (
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Credit Warning Threshold</label>
              <input
                type="number"
                value={settings.creditWarningThreshold}
                onChange={(e) => updateSetting("creditWarningThreshold", Number(e.target.value) || 100)}
                min={10}
                max={1000}
                className="w-full md:w-48 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Show warning when credits fall below this amount</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Settings */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Settings
          </h2>
          <p className="text-sm text-slate-400">Configure how your research data is exported</p>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-400">
            Export buttons are available on all research tools. CSV exports include all data fields, while PDF exports
            generate formatted reports suitable for sharing with clients or team members.
          </p>
        </div>
      </div>
    </div>
  );
}
