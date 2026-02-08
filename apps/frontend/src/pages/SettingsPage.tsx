import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/ThemeContext";
import { callEdgeFunction, type EdgeFunctionResult } from "../lib/edgeFunctions";
import { getSupabase, getSupabaseEnvStatus, getSupabaseInitError } from "../lib/supabase";
import {
  Key,
  Server,
  Link2,
  Activity,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Palette,
  Sun,
  Moon,
} from "lucide-react";

type DiagnosticsState = {
  sessionStatus: string;
  userId: string;
  userEmail: string;
  edgeStatus: "idle" | "checking" | "ok" | "error";
  edgeMessage?: string;
};

type EdgeTestState = {
  status: "idle" | "running" | "success" | "error";
  output: EdgeFunctionResult | null;
  timestamp: string | null;
};

type SecretMetadata = {
  present: boolean;
  length: number;
  last4: string;
  status: "present" | "missing";
};

type SecretState = {
  value: string;
  metadata: SecretMetadata | null;
  status: "idle" | "loading" | "saving";
  error: string | null;
};

type CustomKey = {
  id: string;
  label: string;
  key: string;
};

type MCPHeader = {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  secretValue: string;
};

type MCPServer = {
  id: string;
  name: string;
  base_url: string;
  enabled: boolean;
  headers: MCPHeader[];
};

type Integrations = {
  cloudflare_account_id: string;
  cloudflare_zone_id: string;
  google_ga_property_id: string;
  google_gsc_site: string;
};

type SettingsRecord = {
  api_keys?: {
    custom?: CustomKey[];
  };
  mcp?: {
    servers?: Array<{
      name: string;
      base_url: string;
      enabled: boolean;
      headers: Array<{ key: string; value: string; isSecret: boolean }>;
    }>;
  };
  integrations?: Integrations;
};

const apiKeyFields = [
  { key: "dataforseo_login", label: "DataForSEO Login", placeholder: "login@domain.com" },
  { key: "dataforseo_password", label: "DataForSEO Password", placeholder: "API password" },
  { key: "dataforseo_token", label: "DataForSEO Token", placeholder: "Optional token value" },
  { key: "openai_api_key", label: "OpenAI API Key", placeholder: "sk-..." },
  { key: "google_api_key", label: "Google API Key (GSC/GA)", placeholder: "Optional" },
  { key: "gsc_client_id", label: "Google Search Console Client ID", placeholder: "OAuth 2.0 Client ID" },
  { key: "gsc_client_secret", label: "Google Search Console Client Secret", placeholder: "OAuth 2.0 Client Secret" },
  { key: "cloudflare_api_key", label: "Cloudflare API Key", placeholder: "Optional" },
];

const EMPTY_INTEGRATIONS: Integrations = {
  cloudflare_account_id: "",
  cloudflare_zone_id: "",
  google_ga_property_id: "",
  google_gsc_site: "",
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function truncateBody(body: unknown, maxLength = 500) {
  if (!body) return "";
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function formatEdgeFunctionError(functionName: string, result: EdgeFunctionResult) {
  const bodyText = truncateBody(result.bodyText || "No response body");
  return `${functionName} failed. Status: ${result.status}. Body: ${bodyText}`;
}

function normalizeCustomKeys(input: unknown): CustomKey[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry: any) => ({
      id: createId(),
      label: typeof entry?.label === "string" ? entry.label : "",
      key: typeof entry?.key === "string" ? entry.key : "",
    }))
    .filter((entry) => entry.key.trim().length > 0);
}

function formatSecretStatus(metadata: SecretMetadata | null) {
  if (!metadata?.present) return "Not set";
  const last4 = metadata.last4 || "----";
  return `Stored (••••${last4}) · len ${metadata.length}`;
}

export default function SettingsPage() {
  const { user, mode } = useAuth();
  const { mode: themeMode, toggleTheme } = useTheme();
  const supabase = useMemo(() => getSupabase(), []);
  const initError = getSupabaseInitError();

  const [activeTab, setActiveTab] = useState<"appearance" | "api" | "mcp" | "integrations" | "diagnostics">("appearance");
  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    sessionStatus: "unknown",
    userId: user?.id ?? "",
    userEmail: user?.email ?? "",
    edgeStatus: "idle",
  });
  const [edgeTest, setEdgeTest] = useState<EdgeTestState>({
    status: "idle",
    output: null,
    timestamp: null,
  });

  const [apiKeys, setApiKeys] = useState<Record<string, SecretState>>(() =>
    apiKeyFields.reduce((acc, field) => {
      acc[field.key] = { value: "", metadata: null, status: "idle", error: null };
      return acc;
    }, {} as Record<string, SecretState>)
  );

  const [customKeys, setCustomKeys] = useState<CustomKey[]>([]);
  const [customDraft, setCustomDraft] = useState({ label: "", key: "" });
  const [customStatus, setCustomStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [mcpStatus, setMcpStatus] = useState<"idle" | "saving" | "error" | "success">("idle");
  const [mcpMessage, setMcpMessage] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState<Integrations>(EMPTY_INTEGRATIONS);
  const [integrationStatus, setIntegrationStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [integrationMessage, setIntegrationMessage] = useState<string | null>(null);

  const [inputVisibility, setInputVisibility] = useState<Record<string, boolean>>({});
  const supabaseEnv = getSupabaseEnvStatus();

  useEffect(() => {
    setDiagnostics((prev) => ({
      ...prev,
      userId: user?.id ?? "",
      userEmail: user?.email ?? "",
    }));
  }, [user]);

  useEffect(() => {
    async function loadSettings() {
      if (!supabase || !user) return;
      await loadSettingsRecord();
      await Promise.all(apiKeyFields.map((field) => loadSecret(field.key)));
      await runDiagnostics();
    }

    loadSettings();
  }, [supabase, user?.id]);

  async function loadSettingsRecord() {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) return;

    const settings = (data?.settings ?? {}) as SettingsRecord;
    const nextCustomKeys = normalizeCustomKeys(settings.api_keys?.custom);
    setCustomKeys(nextCustomKeys);
    setIntegrations({ ...EMPTY_INTEGRATIONS, ...(settings.integrations ?? {}) });
    await loadCustomSecrets(nextCustomKeys);

    const servers = Array.isArray(settings.mcp?.servers) ? settings.mcp?.servers : [];
    setMcpServers(
      servers.map((server: any) => ({
        id: createId(),
        name: server.name ?? "",
        base_url: server.base_url ?? "",
        enabled: Boolean(server.enabled),
        headers: Array.isArray(server.headers)
          ? server.headers.map((header: any) => ({
              id: createId(),
              key: header.key ?? "",
              value: header.value ?? "",
              isSecret: Boolean(header.isSecret),
              secretValue: "",
            }))
          : [],
      }))
    );
  }

  async function runDiagnostics() {
    if (!supabase) return;
    setDiagnostics((prev) => ({ ...prev, edgeStatus: "checking" }));

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    setDiagnostics((prev) => ({
      ...prev,
      sessionStatus: sessionError
        ? `error: ${sessionError.message}`
        : sessionData.session
        ? "active"
        : "none",
    }));

    const result = await callEdgeFunction("secrets-list", {});
    setDiagnostics((prev) => ({
      ...prev,
      edgeStatus: result.ok ? "ok" : "error",
      edgeMessage: result.ok
        ? `secrets-list reachable. Status: ${result.status}`
        : formatEdgeFunctionError("secrets-list", result),
    }));
  }

  async function runEdgeTest() {
    setEdgeTest({ status: "running", output: null, timestamp: new Date().toISOString() });
    const result = await callEdgeFunction("secrets-list", {});
    if (!result.ok) {
      setEdgeTest({
        status: "error",
        output: result,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    setEdgeTest({
      status: "success",
      output: result,
      timestamp: new Date().toISOString(),
    });
  }

  async function loadSecret(key: string) {
    setApiKeys((prev) => ({
      ...prev,
      [key]: {
        value: prev[key]?.value ?? "",
        metadata: prev[key]?.metadata ?? null,
        status: "loading",
        error: null,
      },
    }));
    const result = await callEdgeFunction("secrets-get", { key });
    if (!result.ok) {
      setApiKeys((prev) => ({
        ...prev,
        [key]: { ...prev[key], status: "idle", error: formatEdgeFunctionError("secrets-get", result) },
      }));
      return;
    }
    const payload = (result.json ?? {}) as { metadata?: SecretMetadata | null };
    setApiKeys((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        metadata: payload?.metadata ?? null,
        status: "idle",
        error: null,
      },
    }));
  }

  async function saveSecret(key: string) {
    const current = apiKeys[key] ?? {
      value: "",
      metadata: null,
      status: "idle",
      error: null,
    };
    if (!current?.value?.trim()) return;
    setApiKeys((prev) => ({
      ...prev,
      [key]: {
        value: current.value,
        metadata: prev[key]?.metadata ?? null,
        status: "saving",
        error: null,
      },
    }));
    const result = await callEdgeFunction(
      "secrets-set",
      { key, value: current.value },
      { headers: { "x-rbm-source": "settings" } }
    );
    if (!result.ok) {
      setApiKeys((prev) => ({
        ...prev,
        [key]: { ...prev[key], status: "idle", error: formatEdgeFunctionError("secrets-set", result) },
      }));
      return;
    }
    setApiKeys((prev) => ({
      ...prev,
      [key]: { ...prev[key], value: "", status: "idle", error: null },
    }));
    await loadSecret(key);
  }

  async function saveCustomKeys(nextKeys: CustomKey[]) {
    if (!supabase || !user) return;
    setCustomStatus("saving");
    setCustomMessage(null);

    const payload: SettingsRecord = {
      api_keys: {
        custom: nextKeys.map((entry) => ({ key: entry.key, label: entry.label })),
      },
      integrations,
      mcp: {
        servers: mcpServers.map((server) => ({
          name: server.name,
          base_url: server.base_url,
          enabled: server.enabled,
          headers: server.headers.map((header) => ({
            key: header.key,
            value: header.value,
            isSecret: header.isSecret,
          })),
        })),
      },
    };

    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      settings: payload,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setCustomStatus("error");
      setCustomMessage(error.message);
      return;
    }
    setCustomStatus("success");
    setCustomMessage("Custom keys saved.");
    setTimeout(() => setCustomStatus("idle"), 1200);
  }

  async function loadCustomSecrets(keys: CustomKey[]) {
    await Promise.all(keys.map((entry) => loadSecret(entry.key)));
  }

  async function addCustomKey() {
    const key = customDraft.key.trim();
    if (!key) {
      setCustomMessage("Custom key name is required.");
      setCustomStatus("error");
      return;
    }
    const next = [
      ...customKeys,
      { id: createId(), key, label: customDraft.label.trim() || key },
    ];
    setCustomKeys(next);
    setCustomDraft({ label: "", key: "" });
    await saveCustomKeys(next);
    await loadCustomSecrets(next);
  }

  async function removeCustomKey(id: string) {
    const next = customKeys.filter((entry) => entry.id !== id);
    setCustomKeys(next);
    await saveCustomKeys(next);
  }

  async function saveIntegrations() {
    if (!supabase || !user) return;
    setIntegrationStatus("saving");
    setIntegrationMessage(null);

    const payload: SettingsRecord = {
      api_keys: {
        custom: customKeys.map((entry) => ({ key: entry.key, label: entry.label })),
      },
      mcp: {
        servers: mcpServers.map((server) => ({
          name: server.name,
          base_url: server.base_url,
          enabled: server.enabled,
          headers: server.headers.map((header) => ({
            key: header.key,
            value: header.value,
            isSecret: header.isSecret,
          })),
        })),
      },
      integrations,
    };

    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      settings: payload,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setIntegrationStatus("error");
      setIntegrationMessage(error.message);
      return;
    }
    setIntegrationStatus("success");
    setIntegrationMessage("Integrations saved.");
    setTimeout(() => setIntegrationStatus("idle"), 1200);
  }

  async function saveMcpConfig() {
    if (!supabase || !user) return;
    setMcpStatus("saving");
    setMcpMessage(null);

    for (const server of mcpServers) {
      for (const header of server.headers) {
        if (header.isSecret && header.value && header.secretValue) {
          const result = await callEdgeFunction(
            "secrets-set",
            { key: header.value, value: header.secretValue },
            { headers: { "x-rbm-source": "settings" } }
          );
          if (!result.ok) {
            setMcpStatus("error");
            setMcpMessage(formatEdgeFunctionError("secrets-set", result));
            return;
          }
        }
      }
    }

    const payload: SettingsRecord = {
      api_keys: {
        custom: customKeys.map((entry) => ({ key: entry.key, label: entry.label })),
      },
      integrations,
      mcp: {
        servers: mcpServers.map((server) => ({
          name: server.name,
          base_url: server.base_url,
          enabled: server.enabled,
          headers: server.headers.map((header) => ({
            key: header.key,
            value: header.value,
            isSecret: header.isSecret,
          })),
        })),
      },
    };

    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      settings: payload,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setMcpStatus("error");
      setMcpMessage(error.message);
      return;
    }
    setMcpStatus("success");
    setMcpMessage("MCP configuration saved.");
    setTimeout(() => setMcpStatus("idle"), 1500);
    setMcpServers((prev) =>
      prev.map((server) => ({
        ...server,
        headers: server.headers.map((header) => ({ ...header, secretValue: "" })),
      }))
    );
  }

  function updateServer(id: string, updates: Partial<MCPServer>) {
    setMcpServers((prev) => prev.map((server) => (server.id === id ? { ...server, ...updates } : server)));
  }

  function updateHeader(serverId: string, headerId: string, updates: Partial<MCPHeader>) {
    setMcpServers((prev) =>
      prev.map((server) =>
        server.id === serverId
          ? {
              ...server,
              headers: server.headers.map((header) =>
                header.id === headerId ? { ...header, ...updates } : header
              ),
            }
          : server
      )
    );
  }

  function addServer() {
    setMcpServers((prev) => [
      ...prev,
      { id: createId(), name: "", base_url: "", enabled: true, headers: [] },
    ]);
  }

  function removeServer(id: string) {
    setMcpServers((prev) => prev.filter((server) => server.id !== id));
  }

  function addHeader(serverId: string) {
    setMcpServers((prev) =>
      prev.map((server) =>
        server.id === serverId
          ? {
              ...server,
              headers: [
                ...server.headers,
                { id: createId(), key: "", value: "", isSecret: false, secretValue: "" },
              ],
            }
          : server
      )
    );
  }

  function removeHeader(serverId: string, headerId: string) {
    setMcpServers((prev) =>
      prev.map((server) =>
        server.id === serverId
          ? { ...server, headers: server.headers.filter((header) => header.id !== headerId) }
          : server
      )
    );
  }

  function toggleInputVisibility(key: string) {
    setInputVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const envBanner =
    supabaseEnv.status === "ok"
      ? { label: "OK", classes: "border-emerald-200 bg-emerald-50 text-emerald-800" }
      : supabaseEnv.status === "warn"
      ? { label: "WARN", classes: "border-amber-200 bg-amber-50 text-amber-800" }
      : { label: "ERROR", classes: "border-red-200 bg-red-50 text-red-800" };

  if (mode === "demo" || !supabase) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <AlertTriangle size={24} className="text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-sm text-slate-500">Demo mode - Settings disabled</p>
            </div>
          </div>
          <p className="text-slate-500">
            Configure Supabase environment variables to manage API keys, MCP servers, and diagnostics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <Settings size={20} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Centralize API keys, MCP servers, integrations, and diagnostics.
        </p>
      </div>

      <div className={`rounded-2xl border p-4 text-sm ${envBanner.classes}`}>
        <div className="font-semibold">Supabase env status: {envBanner.label}</div>
        <div className="mt-1">URL and anon key validation includes presence, format, and safe metadata checks.</div>
      </div>

      {initError && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-600 flex items-center gap-3">
          <AlertTriangle size={18} />
          Supabase init warning: {initError.message}
        </div>
      )}

      {/* Tabs */}
      <div className="space-y-3">
        {/* Core Settings */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "appearance", label: "Appearance", icon: Palette },
            { id: "api", label: "API Keys", icon: Key },
            { id: "mcp", label: "MCP Servers", icon: Server },
            { id: "integrations", label: "Integrations", icon: Link2 },
            { id: "diagnostics", label: "Diagnostics", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-600 border border-indigo-500/30"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Palette size={18} className="text-slate-500" />
              Appearance
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Customize how the platform looks and feels.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-sm text-slate-500 mt-1">
                  Switch between light and dark mode
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 transition-colors ${themeMode === "light" ? "text-indigo-600" : "text-slate-400"}`}>
                  <Sun size={16} />
                  <span className="text-sm font-medium">Light</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    themeMode === "dark" ? "bg-indigo-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      themeMode === "dark" ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
                <div className={`flex items-center gap-2 transition-colors ${themeMode === "dark" ? "text-indigo-600" : "text-slate-400"}`}>
                  <Moon size={16} />
                  <span className="text-sm font-medium">Dark</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Your theme preference is saved locally and will persist across sessions.
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === "api" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Key size={18} className="text-slate-500" />
                API Keys
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Keys are stored server-side via Supabase Edge Functions. Values are never revealed here.
              </p>
            </div>

            <div className="space-y-4">
              {apiKeyFields.map((field) => {
                const state = apiKeys[field.key];
                return (
                  <div key={field.key} className="rounded-xl border border-slate-200 p-4 space-y-3">
                    <div>
                      <div className="font-medium">{field.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {formatSecretStatus(state.metadata)}
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                      <input
                        type={inputVisibility[field.key] ? "text" : "password"}
                        value={state.value}
                        onChange={(event) =>
                          setApiKeys((prev) => ({
                            ...prev,
                            [field.key]: { ...prev[field.key], value: event.target.value },
                          }))
                        }
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility(field.key)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-xs hover:bg-slate-100 transition-colors"
                      >
                        {inputVisibility[field.key] ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => saveSecret(field.key)}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                        disabled={state.status === "saving" || !state.value.trim()}
                      >
                        <Save size={14} />
                        {state.status === "saving" ? "Saving..." : "Save"}
                      </button>
                    </div>
                    {state.error && (
                      <div className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {state.error}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Keys Section */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Plus size={16} className="text-slate-500" />
                Custom API Keys
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Add custom secret keys by name (e.g., "partner_api_key").
              </p>
            </div>

            <div className="flex gap-2">
              <input
                value={customDraft.label}
                onChange={(event) => setCustomDraft((prev) => ({ ...prev, label: event.target.value }))}
                placeholder="Label (optional)"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
              <input
                value={customDraft.key}
                onChange={(event) => setCustomDraft((prev) => ({ ...prev, key: event.target.value }))}
                placeholder="Key name"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={addCustomKey}
                className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm hover:bg-slate-100 transition-colors"
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            {customKeys.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-4">No custom keys yet.</div>
            )}

            <div className="space-y-3">
              {customKeys.map((entry) => {
                const state = apiKeys[entry.key] ?? {
                  value: "",
                  metadata: null,
                  status: "idle",
                  error: null,
                };
                return (
                  <div key={entry.id} className="rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{entry.label || entry.key}</div>
                        <div className="text-xs text-slate-500">{entry.key}</div>
                      </div>
                      <button
                        onClick={() => removeCustomKey(entry.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                      <input
                        type={inputVisibility[entry.key] ? "text" : "password"}
                        value={state.value}
                        onChange={(event) =>
                          setApiKeys((prev) => ({
                            ...prev,
                            [entry.key]: { ...state, value: event.target.value },
                          }))
                        }
                        placeholder="Secret value"
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={() => toggleInputVisibility(entry.key)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors"
                      >
                        {inputVisibility[entry.key] ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => saveSecret(entry.key)}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors"
                        disabled={!state.value.trim() || state.status === "saving"}
                      >
                        Save
                      </button>
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatSecretStatus(state.metadata)}
                    </div>
                    {state.error && <div className="text-xs text-red-600">{state.error}</div>}
                  </div>
                );
              })}
            </div>

            {customMessage && (
              <div
                className={`text-sm flex items-center gap-2 ${
                  customStatus === "error" ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {customStatus === "error" ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                {customMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MCP Tab */}
      {activeTab === "mcp" && (
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Server size={18} className="text-slate-500" />
                MCP Servers
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Define server endpoints, toggle enablement, and manage header secrets.
              </p>
            </div>
            <button
              onClick={addServer}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm hover:bg-slate-100 transition-colors"
            >
              <Plus size={14} />
              Add Server
            </button>
          </div>

          {mcpServers.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-8">
              No MCP servers configured yet.
            </div>
          )}

          <div className="space-y-4">
            {mcpServers.map((server) => (
              <div key={server.id} className="rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="grid gap-3 md:grid-cols-2 flex-1">
                    <input
                      value={server.name}
                      onChange={(event) => updateServer(server.id, { name: event.target.value })}
                      placeholder="Server name"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      value={server.base_url}
                      onChange={(event) => updateServer(server.id, { base_url: event.target.value })}
                      placeholder="https://mcp.example.com"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={server.enabled}
                        onChange={(event) => updateServer(server.id, { enabled: event.target.checked })}
                        className="rounded border-slate-300 bg-slate-100 text-indigo-500 focus:ring-indigo-500"
                      />
                      Enabled
                    </label>
                    <button
                      onClick={() => removeServer(server.id)}
                      className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Headers</span>
                    <button
                      onClick={() => addHeader(server.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors"
                    >
                      Add Header
                    </button>
                  </div>
                  {server.headers.length === 0 && (
                    <div className="text-xs text-slate-500">No headers configured.</div>
                  )}
                  {server.headers.map((header) => (
                    <div key={header.id} className="rounded-lg border border-slate-200 p-3 space-y-2">
                      <div className="grid gap-2 md:grid-cols-3">
                        <input
                          value={header.key}
                          onChange={(event) =>
                            updateHeader(server.id, header.id, { key: event.target.value })
                          }
                          placeholder="Header key"
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400"
                        />
                        <input
                          value={header.value}
                          onChange={(event) =>
                            updateHeader(server.id, header.id, { value: event.target.value })
                          }
                          placeholder={header.isSecret ? "Secret name" : "Header value"}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={header.isSecret}
                              onChange={(event) =>
                                updateHeader(server.id, header.id, { isSecret: event.target.checked })
                              }
                              className="rounded border-slate-300 bg-slate-100"
                            />
                            Secret
                          </label>
                          <button
                            onClick={() => removeHeader(server.id, header.id)}
                            className="ml-auto rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      {header.isSecret && (
                        <input
                          type={inputVisibility[header.id] ? "text" : "password"}
                          value={header.secretValue}
                          onChange={(event) =>
                            updateHeader(server.id, header.id, { secretValue: event.target.value })
                          }
                          placeholder="Secret value (saved to secrets-set)"
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400"
                        />
                      )}
                      {header.isSecret && (
                        <button
                          onClick={() => toggleInputVisibility(header.id)}
                          className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                        >
                          {inputVisibility[header.id] ? "Hide" : "Show"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={saveMcpConfig}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors"
              disabled={mcpStatus === "saving"}
            >
              <Save size={14} />
              {mcpStatus === "saving" ? "Saving..." : "Save MCP Config"}
            </button>
            {mcpMessage && (
              <span
                className={`text-sm flex items-center gap-2 ${mcpStatus === "error" ? "text-red-600" : "text-emerald-600"}`}
              >
                {mcpStatus === "error" ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                {mcpMessage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Link2 size={18} className="text-slate-500" />
              Integrations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Store non-secret IDs and metadata for upstream services.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Cloudflare Account ID</span>
              <input
                value={integrations.cloudflare_account_id}
                onChange={(event) =>
                  setIntegrations((prev) => ({ ...prev, cloudflare_account_id: event.target.value }))
                }
                placeholder="Account ID"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Cloudflare Zone ID</span>
              <input
                value={integrations.cloudflare_zone_id}
                onChange={(event) =>
                  setIntegrations((prev) => ({ ...prev, cloudflare_zone_id: event.target.value }))
                }
                placeholder="Zone ID"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Google Analytics Property ID</span>
              <input
                value={integrations.google_ga_property_id}
                onChange={(event) =>
                  setIntegrations((prev) => ({ ...prev, google_ga_property_id: event.target.value }))
                }
                placeholder="GA property ID"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Google Search Console Site</span>
              <input
                value={integrations.google_gsc_site}
                onChange={(event) =>
                  setIntegrations((prev) => ({ ...prev, google_gsc_site: event.target.value }))
                }
                placeholder="https://example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={saveIntegrations}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors"
              disabled={integrationStatus === "saving"}
            >
              <Save size={14} />
              {integrationStatus === "saving" ? "Saving..." : "Save Integrations"}
            </button>
            {integrationMessage && (
              <span
                className={`text-sm flex items-center gap-2 ${
                  integrationStatus === "error" ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {integrationStatus === "error" ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                {integrationMessage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Diagnostics Tab */}
      {activeTab === "diagnostics" && (
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity size={18} className="text-slate-500" />
                Diagnostics
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Confirm Supabase connectivity and Edge Functions availability.
              </p>
            </div>
            <button
              onClick={runDiagnostics}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm hover:bg-slate-100 transition-colors"
            >
              <RefreshCw size={14} />
              Run Diagnostics
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="rounded-xl border p-4 space-y-2">
              <div className="font-medium">Supabase env</div>
              <div className="flex justify-between">
                <span>Status</span>
                <span>{supabaseEnv.status.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>URL</span>
                <span>{supabaseEnv.url.present ? "present" : "missing"} · len {supabaseEnv.url.length} · …{supabaseEnv.url.last4 || "----"} · {supabaseEnv.url.format}</span>
              </div>
              <div className="flex justify-between">
                <span>Anon key</span>
                <span>{supabaseEnv.anonKey.present ? "present" : "missing"} · len {supabaseEnv.anonKey.length} · …{supabaseEnv.anonKey.last4 || "----"} · {supabaseEnv.anonKey.format}</span>
              </div>
              {supabaseEnv.errors.length > 0 && (
                <div className="text-xs text-amber-700">{supabaseEnv.errors.join(" ")}</div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <h3 className="font-medium text-sm">Session</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={diagnostics.sessionStatus === "active" ? "text-emerald-600" : "text-slate-700"}>
                    {diagnostics.sessionStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">User ID</span>
                  <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                    {diagnostics.userId ? `${diagnostics.userId.slice(0, 8)}...` : "—"}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="text-xs">{diagnostics.userEmail || "—"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3 md:col-span-2">
              <h3 className="font-medium text-sm">Edge Functions</h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">secrets-list</span>
                <span
                  className={
                    diagnostics.edgeStatus === "ok"
                      ? "text-emerald-600"
                      : diagnostics.edgeStatus === "error"
                      ? "text-red-600"
                      : "text-slate-500"
                  }
                >
                  {diagnostics.edgeStatus === "checking" ? "Checking..." : diagnostics.edgeStatus}
                </span>
              </div>
              {diagnostics.edgeMessage && (
                <div className="text-xs text-slate-500 bg-slate-100 rounded-lg p-2 break-all">
                  {diagnostics.edgeMessage}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Edge Function Test</h3>
                <button
                  onClick={runEdgeTest}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors"
                  disabled={edgeTest.status === "running"}
                >
                  {edgeTest.status === "running" ? "Testing..." : "Test Edge Functions"}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Calls <code className="bg-slate-100 px-1 rounded">secrets-list</code> and returns the response.
              </p>
              <pre className="rounded-lg bg-slate-100 p-3 text-xs text-slate-700 overflow-x-auto">
                {JSON.stringify(
                  {
                    status: edgeTest.status,
                    output: edgeTest.output
                      ? {
                          ok: edgeTest.output.ok,
                          status: edgeTest.output.status,
                          bodyText: edgeTest.output.bodyText,
                          json: edgeTest.output.json ?? null,
                        }
                      : null,
                    timestamp: edgeTest.timestamp,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
