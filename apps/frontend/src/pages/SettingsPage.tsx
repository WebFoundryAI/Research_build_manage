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
  Eye,
  EyeOff,
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
  Zap,
  CalendarCheck,
  Package,
  Globe2,
  FileEdit,
  Globe,
  Database,
  Bell,
  FileText,
  Code,
  GitBranch,
  Sparkles,
  Mail,
  Slack,
  ExternalLink,
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

type SecretState = {
  value: string;
  masked: string | null;
  revealed: string | null;
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

export default function SettingsPage() {
  const { user, mode } = useAuth();
  const { mode: themeMode, toggleTheme } = useTheme();
  const supabase = useMemo(() => getSupabase(), []);
  const initError = getSupabaseInitError();

  const [activeTab, setActiveTab] = useState<"appearance" | "api" | "mcp" | "integrations" | "diagnostics" | "mcp-spark" | "daily-checks" | "asset-tracker" | "nico-geo" | "nexus-opencopy">("appearance");

  // --- MCP Spark Module Settings ---
  const [mcpSparkSettings, setMcpSparkSettings] = useState(() => {
    const saved = localStorage.getItem("mcp-tools-settings");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      defaultLocation: 2840,
      defaultLanguage: "en",
      defaultKeywordLimit: 50,
      autoSaveResults: true,
      defaultExportFormat: "csv" as "csv" | "pdf",
      showCreditWarnings: true,
      creditWarningThreshold: 100,
    };
  });
  const [mcpSparkHasChanges, setMcpSparkHasChanges] = useState(false);
  const [mcpSparkFeedback, setMcpSparkFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- Daily Checks Module Settings ---
  const [dailyActiveSubTab, setDailyActiveSubTab] = useState<"general" | "api-keys" | "gsc">("general");
  const [dailyGeneralSettings, setDailyGeneralSettings] = useState({
    default_country: "United Kingdom",
    default_language: "en",
    check_interval: "30",
    seo_check_time: "02:00",
  });
  const [dailyApiKeys, setDailyApiKeys] = useState({
    dataforseo_login: "",
    dataforseo_password: "",
    cloudflare_worker_url: "",
  });
  const [dailyShowPassword, setDailyShowPassword] = useState<Record<string, boolean>>({});
  const [dailyGscStatus, setDailyGscStatus] = useState<{ connected: boolean; email: string | null }>({
    connected: false,
    email: null,
  });
  const [dailySaving, setDailySaving] = useState(false);

  // --- Asset Tracker Module Settings ---
  const [assetActiveSubTab, setAssetActiveSubTab] = useState<"general" | "notifications" | "integrations">("general");
  const [assetGeneralSettings, setAssetGeneralSettings] = useState({
    default_status: "Idea / Backlog",
    health_check_interval: "24",
    auto_backup: true,
    trash_retention_days: "30",
  });
  const [assetNotificationSettings, setAssetNotificationSettings] = useState({
    email_alerts: true,
    slack_alerts: false,
    critical_only: false,
    daily_digest: true,
    email: "",
    slack_webhook: "",
  });
  const [assetIntegrationSettings, setAssetIntegrationSettings] = useState({
    google_analytics_id: "",
    cloudflare_api_key: "",
    uptime_robot_key: "",
  });
  const [assetShowApiKey, setAssetShowApiKey] = useState(false);
  const [assetSaving, setAssetSaving] = useState(false);

  // --- Nico GEO Module Settings ---
  const [nicoGeneralSettings, setNicoGeneralSettings] = useState({
    defaultOutputFormat: "json",
    includeSchemaMarkup: true,
    antiHallucination: true,
    maxFaqs: "5",
    answerCapsuleLength: "medium",
  });
  const [nicoApiSettings, setNicoApiSettings] = useState({
    workerUrl: "",
    defaultPlan: "free",
    enableRateLimiting: true,
  });
  const [nicoGitHubSettings, setNicoGitHubSettings] = useState({
    defaultOwner: "",
    defaultRepo: "",
    defaultBranch: "main",
    projectType: "astro-pages",
  });
  const [nicoSaving, setNicoSaving] = useState(false);

  // --- Nexus OpenCopy Module Settings ---
  const [nexusContentSettings, setNexusContentSettings] = useState({
    defaultWordCount: "2000",
    defaultTone: "professional",
    defaultLanguage: "en",
    includeImages: true,
    includeInternalLinks: true,
    includeFaqs: true,
    seoOptimization: true,
  });
  const [nexusAiSettings, setNexusAiSettings] = useState({
    model: "gpt-4",
    temperature: "0.7",
    maxTokens: "4000",
    enableFactChecking: true,
  });
  const [nexusPublishingSettings, setNexusPublishingSettings] = useState({
    autoPublish: false,
    requireReview: true,
    defaultStatus: "draft",
    notifyOnPublish: true,
  });
  const [nexusSaving, setNexusSaving] = useState(false);
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
      acc[field.key] = { value: "", masked: null, revealed: null, status: "idle", error: null };
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

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const supabaseUrlPresent = Boolean((import.meta as any).env?.VITE_SUPABASE_URL);
  const supabaseAnonPresent = Boolean((import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

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
        masked: prev[key]?.masked ?? null,
        revealed: prev[key]?.revealed ?? null,
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
    const payload = (result.json ?? {}) as { masked?: string | null };
    setApiKeys((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        masked: payload?.masked ?? null,
        revealed: null,
        status: "idle",
        error: null,
      },
    }));
  }

  async function revealSecret(key: string) {
    setApiKeys((prev) => ({
      ...prev,
      [key]: {
        value: prev[key]?.value ?? "",
        masked: prev[key]?.masked ?? null,
        revealed: prev[key]?.revealed ?? null,
        status: "loading",
        error: null,
      },
    }));
    const result = await callEdgeFunction("secrets-get", { key, reveal: true });
    if (!result.ok) {
      setApiKeys((prev) => ({
        ...prev,
        [key]: { ...prev[key], status: "idle", error: formatEdgeFunctionError("secrets-get", result) },
      }));
      return;
    }
    const payload = (result.json ?? {}) as { value?: string };
    setApiKeys((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        revealed: payload?.value ?? "",
        status: "idle",
        error: null,
      },
    }));
  }

  async function saveSecret(key: string) {
    const current = apiKeys[key] ?? {
      value: "",
      masked: null,
      revealed: null,
      status: "idle",
      error: null,
    };
    if (!current?.value?.trim()) return;
    setApiKeys((prev) => ({
      ...prev,
      [key]: {
        value: current.value,
        masked: prev[key]?.masked ?? null,
        revealed: prev[key]?.revealed ?? null,
        status: "saving",
        error: null,
      },
    }));
    const result = await callEdgeFunction("secrets-set", { key, value: current.value });
    if (!result.ok) {
      setApiKeys((prev) => ({
        ...prev,
        [key]: { ...prev[key], status: "idle", error: formatEdgeFunctionError("secrets-set", result) },
      }));
      return;
    }
    setApiKeys((prev) => ({
      ...prev,
      [key]: { ...prev[key], value: "", revealed: null, status: "idle", error: null },
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
          const result = await callEdgeFunction("secrets-set", {
            key: header.value,
            value: header.secretValue,
          });
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

        {/* Module Settings */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">Module Settings</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: "mcp-spark", label: "MCP Spark", icon: Zap, color: "amber" },
              { id: "daily-checks", label: "Daily Checks", icon: CalendarCheck, color: "emerald" },
              { id: "asset-tracker", label: "Asset Tracker", icon: Package, color: "blue" },
              { id: "nico-geo", label: "Nico GEO", icon: Globe2, color: "teal" },
              { id: "nexus-opencopy", label: "Nexus OpenCopy", icon: FileEdit, color: "pink" },
            ].map((tab) => {
              const colorMap: Record<string, string> = {
                amber: activeTab === tab.id ? "bg-amber-500/20 text-amber-600 border-amber-500/30" : "",
                emerald: activeTab === tab.id ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" : "",
                blue: activeTab === tab.id ? "bg-blue-500/20 text-blue-600 border-blue-500/30" : "",
                teal: activeTab === tab.id ? "bg-teal-500/20 text-teal-600 border-teal-500/30" : "",
                pink: activeTab === tab.id ? "bg-pink-500/20 text-pink-600 border-pink-500/30" : "",
              };
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                    activeTab === tab.id
                      ? colorMap[tab.color]
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-transparent"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
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
                Keys are stored server-side via Supabase Edge Functions. Values are masked by default.
              </p>
            </div>

            <div className="space-y-4">
              {apiKeyFields.map((field) => {
                const state = apiKeys[field.key];
                const isPasswordVisible = showPasswords[field.key];
                return (
                  <div key={field.key} className="rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{field.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {state.masked ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle size={12} /> Stored ({state.masked})
                            </span>
                          ) : (
                            <span className="text-slate-500">Not configured</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => revealSecret(field.key)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors"
                        disabled={state.status !== "idle"}
                      >
                        <Eye size={14} />
                        Reveal
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={isPasswordVisible ? "text" : "password"}
                          value={state.value}
                          onChange={(event) =>
                            setApiKeys((prev) => ({
                              ...prev,
                              [field.key]: { ...prev[field.key], value: event.target.value },
                            }))
                          }
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <button
                        onClick={() => saveSecret(field.key)}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                        disabled={state.status === "saving" || !state.value.trim()}
                      >
                        <Save size={14} />
                        {state.status === "saving" ? "Saving..." : "Save"}
                      </button>
                    </div>
                    {state.revealed && (
                      <div className="text-xs bg-slate-100 rounded-lg p-2 font-mono break-all">
                        {state.revealed}
                      </div>
                    )}
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
                  masked: null,
                  revealed: null,
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
                    <div className="flex gap-2">
                      <input
                        type="password"
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
                        onClick={() => revealSecret(entry.key)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors"
                        disabled={state.status !== "idle"}
                      >
                        Reveal
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
                      {state.masked ? `Stored (${state.masked})` : "Not set"}
                    </div>
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
                          type="password"
                          value={header.secretValue}
                          onChange={(event) =>
                            updateHeader(server.id, header.id, { secretValue: event.target.value })
                          }
                          placeholder="Secret value (saved to secrets-set)"
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400"
                        />
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <h3 className="font-medium text-sm">Supabase Environment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">URL</span>
                  <span className={supabaseUrlPresent ? "text-emerald-600" : "text-red-600"}>
                    {supabaseUrlPresent ? "Present" : "Missing"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Anon Key</span>
                  <span className={supabaseAnonPresent ? "text-emerald-600" : "text-red-600"}>
                    {supabaseAnonPresent ? "Present" : "Missing"}
                  </span>
                </div>
              </div>
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

      {/* ===== MCP SPARK MODULE SETTINGS ===== */}
      {activeTab === "mcp-spark" && (
        <div className="space-y-6">
          {mcpSparkFeedback && (
            <div className={`p-3 rounded-lg ${mcpSparkFeedback.type === "success" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
              {mcpSparkFeedback.message}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                MCP Spark Settings
              </h2>
              <p className="text-sm text-slate-500 mt-1">Configure default preferences for SEO research tools</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const defaults = { defaultLocation: 2840, defaultLanguage: "en", defaultKeywordLimit: 50, autoSaveResults: true, defaultExportFormat: "csv" as const, showCreditWarnings: true, creditWarningThreshold: 100 };
                  setMcpSparkSettings(defaults);
                  localStorage.setItem("mcp-tools-settings", JSON.stringify(defaults));
                  setMcpSparkHasChanges(false);
                  setMcpSparkFeedback({ type: "success", message: "Settings reset to defaults" });
                  setTimeout(() => setMcpSparkFeedback(null), 3000);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-sm transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("mcp-tools-settings", JSON.stringify(mcpSparkSettings));
                  setMcpSparkHasChanges(false);
                  setMcpSparkFeedback({ type: "success", message: "Settings saved" });
                  setTimeout(() => setMcpSparkFeedback(null), 3000);
                }}
                disabled={!mcpSparkHasChanges}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
              >
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </div>

          {/* Location & Language */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Globe size={16} className="text-slate-500" /> Default Location & Language</h3>
              <p className="text-xs text-slate-500 mt-1">Pre-filled when starting new research</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Default Location</span>
                <select value={mcpSparkSettings.defaultLocation} onChange={(e) => { setMcpSparkSettings((p: typeof mcpSparkSettings) => ({ ...p, defaultLocation: Number(e.target.value) })); setMcpSparkHasChanges(true); }} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500">
                  <option value={2840}>United States</option><option value={2826}>United Kingdom</option><option value={2124}>Canada</option><option value={2036}>Australia</option><option value={2276}>Germany</option><option value={2250}>France</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Default Language</span>
                <select value={mcpSparkSettings.defaultLanguage} onChange={(e) => { setMcpSparkSettings((p: typeof mcpSparkSettings) => ({ ...p, defaultLanguage: e.target.value })); setMcpSparkHasChanges(true); }} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500">
                  <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option>
                </select>
              </label>
            </div>
          </div>

          {/* Research Defaults */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Database size={16} className="text-slate-500" /> Research Defaults</h3>
              <p className="text-xs text-slate-500 mt-1">Configure default limits and behavior</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Default Keyword Limit</span>
                <select value={mcpSparkSettings.defaultKeywordLimit} onChange={(e) => { setMcpSparkSettings((p: typeof mcpSparkSettings) => ({ ...p, defaultKeywordLimit: Number(e.target.value) })); setMcpSparkHasChanges(true); }} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500">
                  <option value={25}>25 keywords</option><option value={50}>50 keywords</option><option value={100}>100 keywords</option><option value={200}>200 keywords</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Default Export Format</span>
                <select value={mcpSparkSettings.defaultExportFormat} onChange={(e) => { setMcpSparkSettings((p: typeof mcpSparkSettings) => ({ ...p, defaultExportFormat: e.target.value })); setMcpSparkHasChanges(true); }} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500">
                  <option value="csv">CSV (Spreadsheet)</option><option value="pdf">PDF (Report)</option>
                </select>
              </label>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div><div className="font-medium text-sm">Auto-save Results</div><div className="text-xs text-slate-500">Automatically save research results to history</div></div>
              <button onClick={() => { setMcpSparkSettings((p: typeof mcpSparkSettings) => ({ ...p, autoSaveResults: !p.autoSaveResults })); setMcpSparkHasChanges(true); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mcpSparkSettings.autoSaveResults ? "bg-amber-500" : "bg-slate-200"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mcpSparkSettings.autoSaveResults ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Bell size={16} className="text-slate-500" /> Notifications & Warnings</h3>
            </div>
            <div className="flex items-center justify-between">
              <div><div className="font-medium text-sm">Show Credit Warnings</div><div className="text-xs text-slate-500">Alert when credits are running low</div></div>
              <button onClick={() => { setMcpSparkSettings((p: typeof mcpSparkSettings) => ({ ...p, showCreditWarnings: !p.showCreditWarnings })); setMcpSparkHasChanges(true); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mcpSparkSettings.showCreditWarnings ? "bg-amber-500" : "bg-slate-200"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mcpSparkSettings.showCreditWarnings ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            {mcpSparkSettings.showCreditWarnings && (
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Credit Warning Threshold</span>
                <input type="number" value={mcpSparkSettings.creditWarningThreshold} onChange={(e) => { setMcpSparkSettings((p: typeof mcpSparkSettings) => ({ ...p, creditWarningThreshold: Number(e.target.value) || 100 })); setMcpSparkHasChanges(true); }} min={10} max={1000} className="w-full md:w-48 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500" />
                <p className="text-xs text-slate-500">Show warning when credits fall below this amount</p>
              </label>
            )}
          </div>
        </div>
      )}

      {/* ===== DAILY CHECKS MODULE SETTINGS ===== */}
      {activeTab === "daily-checks" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarCheck size={18} className="text-emerald-500" />
              Daily Checks Settings
            </h2>
            <p className="text-sm text-slate-500 mt-1">Configure Daily Checks module settings</p>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: "general" as const, label: "General", icon: Settings },
              { id: "api-keys" as const, label: "API Keys", icon: Key },
              { id: "gsc" as const, label: "Search Console", icon: Globe },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setDailyActiveSubTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${dailyActiveSubTab === tab.id ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-transparent"}`}>
                <tab.icon size={16} />{tab.label}
              </button>
            ))}
          </div>

          {dailyActiveSubTab === "general" && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
              <h3 className="font-semibold mb-6">General Settings</h3>
              <div className="space-y-4 max-w-md">
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Country</span><input type="text" value={dailyGeneralSettings.default_country} onChange={(e) => setDailyGeneralSettings({ ...dailyGeneralSettings, default_country: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500" /></label>
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Language</span>
                  <select value={dailyGeneralSettings.default_language} onChange={(e) => setDailyGeneralSettings({ ...dailyGeneralSettings, default_language: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500">
                    <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option><option value="it">Italian</option>
                  </select>
                </label>
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Check Interval (minutes)</span>
                  <select value={dailyGeneralSettings.check_interval} onChange={(e) => setDailyGeneralSettings({ ...dailyGeneralSettings, check_interval: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500">
                    <option value="15">Every 15 minutes</option><option value="30">Every 30 minutes</option><option value="60">Every hour</option><option value="360">Every 6 hours</option><option value="720">Every 12 hours</option>
                  </select>
                </label>
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Daily SEO Check Time (UTC)</span><input type="time" value={dailyGeneralSettings.seo_check_time} onChange={(e) => setDailyGeneralSettings({ ...dailyGeneralSettings, seo_check_time: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500" /></label>
                <button onClick={async () => { setDailySaving(true); await new Promise(r => setTimeout(r, 1000)); setDailySaving(false); }} disabled={dailySaving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-60 mt-4">
                  {dailySaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}{dailySaving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          )}

          {dailyActiveSubTab === "api-keys" && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
              <h3 className="font-semibold mb-2">API Keys</h3>
              <p className="text-sm text-slate-500 mb-6">Configure API keys for enhanced functionality</p>
              <div className="space-y-4 max-w-md">
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">DataForSEO Login</span><input type="text" value={dailyApiKeys.dataforseo_login} onChange={(e) => setDailyApiKeys({ ...dailyApiKeys, dataforseo_login: e.target.value })} placeholder="login@domain.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500" /><p className="text-xs text-slate-500 mt-1">For advanced rank tracking</p></label>
                <div><span className="block text-sm font-medium text-slate-500 mb-2">DataForSEO Password</span>
                  <div className="relative"><input type={dailyShowPassword.dataforseo ? "text" : "password"} value={dailyApiKeys.dataforseo_password} onChange={(e) => setDailyApiKeys({ ...dailyApiKeys, dataforseo_password: e.target.value })} placeholder="API password" className="w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500" /><button type="button" onClick={() => setDailyShowPassword({ ...dailyShowPassword, dataforseo: !dailyShowPassword.dataforseo })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{dailyShowPassword.dataforseo ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                </div>
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Cloudflare Worker URL</span><input type="url" value={dailyApiKeys.cloudflare_worker_url} onChange={(e) => setDailyApiKeys({ ...dailyApiKeys, cloudflare_worker_url: e.target.value })} placeholder="https://your-worker.workers.dev" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500" /><p className="text-xs text-slate-500 mt-1">URL of your deployed Daily Checks worker</p></label>
                <button onClick={async () => { setDailySaving(true); await new Promise(r => setTimeout(r, 1000)); setDailySaving(false); }} disabled={dailySaving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-60 mt-4">
                  {dailySaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}{dailySaving ? "Saving..." : "Save API Keys"}
                </button>
              </div>
            </div>
          )}

          {dailyActiveSubTab === "gsc" && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-6">
              <div><h3 className="font-semibold mb-2">Google Search Console</h3><p className="text-sm text-slate-500">Connect to import ranking data and search analytics</p></div>
              <div className={`rounded-xl p-4 ${dailyGscStatus.connected ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-slate-100 border border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  {dailyGscStatus.connected ? <CheckCircle size={20} className="text-emerald-600" /> : <AlertTriangle size={20} className="text-slate-400" />}
                  <div className="flex-1"><div className={dailyGscStatus.connected ? "text-emerald-600 font-medium" : "text-slate-600"}>{dailyGscStatus.connected ? "Connected" : "Not Connected"}</div>{dailyGscStatus.email && <div className="text-xs text-slate-500">{dailyGscStatus.email}</div>}</div>
                  {dailyGscStatus.connected ? (
                    <button onClick={() => { if (confirm("Disconnect from Google Search Console?")) setDailyGscStatus({ connected: false, email: null }); }} className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-600 text-sm font-medium transition-colors">Disconnect</button>
                  ) : (
                    <button onClick={() => alert("This would redirect to Google OAuth for Search Console authorization")} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">Connect GSC</button>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-medium mb-3">Setup Instructions</h4>
                <ol className="text-sm text-slate-500 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Google Cloud Console <ExternalLink size={12} className="inline" /></a></li>
                  <li>Create a new project or select existing one</li>
                  <li>Enable the "Search Console API"</li>
                  <li>Create OAuth 2.0 credentials (Web application)</li>
                  <li>Add your worker URL as authorized redirect URI</li>
                  <li>Configure GSC_CLIENT_ID and GSC_CLIENT_SECRET in your worker</li>
                  <li>Click "Connect GSC" above to authorize</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== ASSET TRACKER MODULE SETTINGS ===== */}
      {activeTab === "asset-tracker" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package size={18} className="text-blue-500" />
              Asset Tracker Settings
            </h2>
            <p className="text-sm text-slate-500 mt-1">Configure Asset Tracker preferences</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: "general" as const, label: "General", icon: Settings },
              { id: "notifications" as const, label: "Notifications", icon: Bell },
              { id: "integrations" as const, label: "Integrations", icon: Key },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setAssetActiveSubTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${assetActiveSubTab === tab.id ? "bg-blue-500/20 text-blue-600 border border-blue-500/30" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-transparent"}`}>
                <tab.icon size={16} />{tab.label}
              </button>
            ))}
          </div>

          {assetActiveSubTab === "general" && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
              <h3 className="font-semibold mb-6">General Settings</h3>
              <div className="space-y-4 max-w-md">
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Project Status</span>
                  <select value={assetGeneralSettings.default_status} onChange={(e) => setAssetGeneralSettings({ ...assetGeneralSettings, default_status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500">
                    <option value="Idea / Backlog">Idea / Backlog</option><option value="Planning">Planning</option><option value="In Build">In Build</option>
                  </select>
                </label>
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Health Check Interval (hours)</span>
                  <select value={assetGeneralSettings.health_check_interval} onChange={(e) => setAssetGeneralSettings({ ...assetGeneralSettings, health_check_interval: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500">
                    <option value="1">Every hour</option><option value="6">Every 6 hours</option><option value="12">Every 12 hours</option><option value="24">Every 24 hours</option>
                  </select>
                </label>
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Trash Retention (days)</span>
                  <select value={assetGeneralSettings.trash_retention_days} onChange={(e) => setAssetGeneralSettings({ ...assetGeneralSettings, trash_retention_days: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500">
                    <option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option><option value="60">60 days</option>
                  </select>
                </label>
                <div className="flex items-center justify-between py-3 border-t border-slate-200">
                  <div><div className="font-medium text-sm">Auto Backup</div><div className="text-xs text-slate-500">Automatically backup project data</div></div>
                  <button onClick={() => setAssetGeneralSettings({ ...assetGeneralSettings, auto_backup: !assetGeneralSettings.auto_backup })} className={`w-12 h-6 rounded-full transition-colors ${assetGeneralSettings.auto_backup ? "bg-blue-500" : "bg-slate-200"}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${assetGeneralSettings.auto_backup ? "translate-x-6" : "translate-x-0.5"}`} /></button>
                </div>
                <button onClick={async () => { setAssetSaving(true); await new Promise(r => setTimeout(r, 1000)); setAssetSaving(false); }} disabled={assetSaving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors disabled:opacity-60 mt-4">
                  {assetSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}{assetSaving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          )}

          {assetActiveSubTab === "notifications" && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
              <h3 className="font-semibold mb-6">Notification Preferences</h3>
              <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <div className="flex items-center gap-3"><Mail size={18} className="text-slate-400" /><div><div className="font-medium text-sm">Email Alerts</div><div className="text-xs text-slate-500">Receive alerts via email</div></div></div>
                  <button onClick={() => setAssetNotificationSettings({ ...assetNotificationSettings, email_alerts: !assetNotificationSettings.email_alerts })} className={`w-12 h-6 rounded-full transition-colors ${assetNotificationSettings.email_alerts ? "bg-blue-500" : "bg-slate-200"}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${assetNotificationSettings.email_alerts ? "translate-x-6" : "translate-x-0.5"}`} /></button>
                </div>
                {assetNotificationSettings.email_alerts && (
                  <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Email Address</span><input type="email" value={assetNotificationSettings.email} onChange={(e) => setAssetNotificationSettings({ ...assetNotificationSettings, email: e.target.value })} placeholder="alerts@example.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500" /></label>
                )}
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <div className="flex items-center gap-3"><Slack size={18} className="text-slate-400" /><div><div className="font-medium text-sm">Slack Alerts</div><div className="text-xs text-slate-500">Send alerts to Slack</div></div></div>
                  <button onClick={() => setAssetNotificationSettings({ ...assetNotificationSettings, slack_alerts: !assetNotificationSettings.slack_alerts })} className={`w-12 h-6 rounded-full transition-colors ${assetNotificationSettings.slack_alerts ? "bg-blue-500" : "bg-slate-200"}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${assetNotificationSettings.slack_alerts ? "translate-x-6" : "translate-x-0.5"}`} /></button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <div><div className="font-medium text-sm">Critical Only</div><div className="text-xs text-slate-500">Only receive critical alerts</div></div>
                  <button onClick={() => setAssetNotificationSettings({ ...assetNotificationSettings, critical_only: !assetNotificationSettings.critical_only })} className={`w-12 h-6 rounded-full transition-colors ${assetNotificationSettings.critical_only ? "bg-blue-500" : "bg-slate-200"}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${assetNotificationSettings.critical_only ? "translate-x-6" : "translate-x-0.5"}`} /></button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div><div className="font-medium text-sm">Daily Digest</div><div className="text-xs text-slate-500">Receive daily summary email</div></div>
                  <button onClick={() => setAssetNotificationSettings({ ...assetNotificationSettings, daily_digest: !assetNotificationSettings.daily_digest })} className={`w-12 h-6 rounded-full transition-colors ${assetNotificationSettings.daily_digest ? "bg-blue-500" : "bg-slate-200"}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${assetNotificationSettings.daily_digest ? "translate-x-6" : "translate-x-0.5"}`} /></button>
                </div>
                <button onClick={async () => { setAssetSaving(true); await new Promise(r => setTimeout(r, 1000)); setAssetSaving(false); }} disabled={assetSaving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors disabled:opacity-60 mt-4">
                  {assetSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}{assetSaving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          )}

          {assetActiveSubTab === "integrations" && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
              <h3 className="font-semibold mb-2">Integrations</h3>
              <p className="text-sm text-slate-500 mb-6">Connect external services for enhanced monitoring</p>
              <div className="space-y-4 max-w-md">
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Google Analytics Property ID</span><input type="text" value={assetIntegrationSettings.google_analytics_id} onChange={(e) => setAssetIntegrationSettings({ ...assetIntegrationSettings, google_analytics_id: e.target.value })} placeholder="G-XXXXXXXXXX" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500" /></label>
                <div><span className="block text-sm font-medium text-slate-500 mb-2">Cloudflare API Key</span>
                  <div className="relative"><input type={assetShowApiKey ? "text" : "password"} value={assetIntegrationSettings.cloudflare_api_key} onChange={(e) => setAssetIntegrationSettings({ ...assetIntegrationSettings, cloudflare_api_key: e.target.value })} placeholder="Your Cloudflare API key" className="w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500" /><button type="button" onClick={() => setAssetShowApiKey(!assetShowApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{assetShowApiKey ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                </div>
                <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">UptimeRobot API Key</span><input type="password" value={assetIntegrationSettings.uptime_robot_key} onChange={(e) => setAssetIntegrationSettings({ ...assetIntegrationSettings, uptime_robot_key: e.target.value })} placeholder="Your UptimeRobot API key" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500" /></label>
                <button onClick={async () => { setAssetSaving(true); await new Promise(r => setTimeout(r, 1000)); setAssetSaving(false); }} disabled={assetSaving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors disabled:opacity-60 mt-4">
                  {assetSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}{assetSaving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== NICO GEO MODULE SETTINGS ===== */}
      {activeTab === "nico-geo" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Globe2 size={18} className="text-teal-500" />
              Nico GEO Settings
            </h2>
            <p className="text-sm text-slate-500 mt-1">Configure GEO content engine preferences</p>
          </div>

          {/* Content Generation */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Globe2 size={16} className="text-teal-600" /> Content Generation</h3>
            <div className="space-y-4 max-w-md">
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Output Format</span>
                <select value={nicoGeneralSettings.defaultOutputFormat} onChange={(e) => setNicoGeneralSettings({ ...nicoGeneralSettings, defaultOutputFormat: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-teal-500">
                  <option value="json">JSON (Recommended)</option><option value="markdown">Markdown</option><option value="html">HTML</option>
                </select>
              </label>
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Maximum FAQs to Generate</span>
                <select value={nicoGeneralSettings.maxFaqs} onChange={(e) => setNicoGeneralSettings({ ...nicoGeneralSettings, maxFaqs: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-teal-500">
                  <option value="3">3 FAQs</option><option value="5">5 FAQs</option><option value="10">10 FAQs</option>
                </select>
              </label>
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Answer Capsule Length</span>
                <select value={nicoGeneralSettings.answerCapsuleLength} onChange={(e) => setNicoGeneralSettings({ ...nicoGeneralSettings, answerCapsuleLength: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-teal-500">
                  <option value="short">Short (1-2 sentences)</option><option value="medium">Medium (2-3 sentences)</option><option value="long">Long (3-4 sentences)</option>
                </select>
              </label>
              <div className="flex items-center justify-between py-3 border-t border-slate-200">
                <div><div className="font-medium text-sm">Include Schema.org Markup</div><div className="text-xs text-slate-500">Generate JSON-LD structured data</div></div>
                <button onClick={() => setNicoGeneralSettings({ ...nicoGeneralSettings, includeSchemaMarkup: !nicoGeneralSettings.includeSchemaMarkup })} className={`w-12 h-6 rounded-full transition-colors ${nicoGeneralSettings.includeSchemaMarkup ? "bg-teal-500" : "bg-slate-200"}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${nicoGeneralSettings.includeSchemaMarkup ? "translate-x-6" : "translate-x-0.5"}`} /></button>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-slate-200">
                <div><div className="font-medium text-sm flex items-center gap-2">Anti-Hallucination Mode <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-600">Required</span></div><div className="text-xs text-slate-500">Output derived solely from input data</div></div>
                <button disabled className="w-12 h-6 rounded-full bg-emerald-500 opacity-75 cursor-not-allowed"><div className="w-5 h-5 rounded-full bg-white translate-x-6" /></button>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Code size={16} className="text-blue-600" /> API Configuration</h3>
            <div className="space-y-4 max-w-md">
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Cloudflare Worker URL</span><input type="url" value={nicoApiSettings.workerUrl} onChange={(e) => setNicoApiSettings({ ...nicoApiSettings, workerUrl: e.target.value })} placeholder="https://your-worker.workers.dev" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500" /></label>
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default API Plan</span>
                <select value={nicoApiSettings.defaultPlan} onChange={(e) => setNicoApiSettings({ ...nicoApiSettings, defaultPlan: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500">
                  <option value="free">Free (20 req/day)</option><option value="pro">Pro (500 req/day)</option>
                </select>
              </label>
              <div className="flex items-center justify-between py-3 border-t border-slate-200">
                <div><div className="font-medium text-sm">Enable Rate Limiting</div><div className="text-xs text-slate-500">Enforce daily and burst limits</div></div>
                <button onClick={() => setNicoApiSettings({ ...nicoApiSettings, enableRateLimiting: !nicoApiSettings.enableRateLimiting })} className={`w-12 h-6 rounded-full transition-colors ${nicoApiSettings.enableRateLimiting ? "bg-blue-500" : "bg-slate-200"}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${nicoApiSettings.enableRateLimiting ? "translate-x-6" : "translate-x-0.5"}`} /></button>
              </div>
            </div>
          </div>

          {/* GitHub Integration */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><GitBranch size={16} className="text-purple-600" /> GitHub Integration (Pro)</h3>
            <div className="space-y-4 max-w-md">
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Repository Owner</span><input type="text" value={nicoGitHubSettings.defaultOwner} onChange={(e) => setNicoGitHubSettings({ ...nicoGitHubSettings, defaultOwner: e.target.value })} placeholder="your-org" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-purple-500" /></label>
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Repository</span><input type="text" value={nicoGitHubSettings.defaultRepo} onChange={(e) => setNicoGitHubSettings({ ...nicoGitHubSettings, defaultRepo: e.target.value })} placeholder="your-site" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-purple-500" /></label>
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Branch</span><input type="text" value={nicoGitHubSettings.defaultBranch} onChange={(e) => setNicoGitHubSettings({ ...nicoGitHubSettings, defaultBranch: e.target.value })} placeholder="main" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:border-purple-500" /></label>
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Project Type</span>
                <select value={nicoGitHubSettings.projectType} onChange={(e) => setNicoGitHubSettings({ ...nicoGitHubSettings, projectType: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-purple-500">
                  <option value="astro-pages">Astro Pages</option><option value="next-pages">Next.js Pages</option><option value="static-html">Static HTML</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={async () => { setNicoSaving(true); await new Promise(r => setTimeout(r, 1000)); setNicoSaving(false); }} disabled={nicoSaving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors disabled:opacity-60">
              {nicoSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}{nicoSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}

      {/* ===== NEXUS OPENCOPY MODULE SETTINGS ===== */}
      {activeTab === "nexus-opencopy" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileEdit size={18} className="text-pink-500" />
              Nexus OpenCopy Settings
            </h2>
            <p className="text-sm text-slate-500 mt-1">Configure AI content studio preferences</p>
          </div>

          {/* Content Generation */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><FileText size={16} className="text-pink-600" /> Content Generation</h3>
            <div className="space-y-4 max-w-md">
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Word Count Target</span>
                <select value={nexusContentSettings.defaultWordCount} onChange={(e) => setNexusContentSettings({ ...nexusContentSettings, defaultWordCount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-pink-500">
                  <option value="1000">~1,000 words</option><option value="1500">~1,500 words</option><option value="2000">~2,000 words</option><option value="2500">~2,500 words</option><option value="3000">~3,000 words</option>
                </select>
              </label>
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Writing Tone</span>
                <select value={nexusContentSettings.defaultTone} onChange={(e) => setNexusContentSettings({ ...nexusContentSettings, defaultTone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-pink-500">
                  <option value="professional">Professional</option><option value="conversational">Conversational</option><option value="academic">Academic</option><option value="casual">Casual</option>
                </select>
              </label>
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Language</span>
                <select value={nexusContentSettings.defaultLanguage} onChange={(e) => setNexusContentSettings({ ...nexusContentSettings, defaultLanguage: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-pink-500">
                  <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option><option value="pt">Portuguese</option>
                </select>
              </label>
              {[
                { key: "includeImages" as const, label: "Include Image Suggestions", desc: "Suggest images for articles" },
                { key: "includeInternalLinks" as const, label: "Internal Linking", desc: "Auto-suggest internal links" },
                { key: "includeFaqs" as const, label: "Generate FAQs", desc: "Include FAQ section in articles" },
                { key: "seoOptimization" as const, label: "SEO Optimization", desc: "Auto-optimize for search engines" },
              ].map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between py-3 border-t border-slate-200">
                  <div><div className="font-medium text-sm">{toggle.label}</div><div className="text-xs text-slate-500">{toggle.desc}</div></div>
                  <button onClick={() => setNexusContentSettings({ ...nexusContentSettings, [toggle.key]: !nexusContentSettings[toggle.key] })} className={`w-12 h-6 rounded-full transition-colors ${nexusContentSettings[toggle.key] ? "bg-pink-500" : "bg-slate-200"}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${nexusContentSettings[toggle.key] ? "translate-x-6" : "translate-x-0.5"}`} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Configuration */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Sparkles size={16} className="text-purple-600" /> AI Configuration</h3>
            <div className="space-y-4 max-w-md">
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">AI Model</span>
                <select value={nexusAiSettings.model} onChange={(e) => setNexusAiSettings({ ...nexusAiSettings, model: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-purple-500">
                  <option value="gpt-4">GPT-4 (Recommended)</option><option value="gpt-4-turbo">GPT-4 Turbo</option><option value="gpt-3.5-turbo">GPT-3.5 Turbo</option><option value="claude-3">Claude 3</option>
                </select>
              </label>
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Temperature (Creativity)</span>
                <select value={nexusAiSettings.temperature} onChange={(e) => setNexusAiSettings({ ...nexusAiSettings, temperature: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-purple-500">
                  <option value="0.3">0.3 - More focused</option><option value="0.5">0.5 - Balanced</option><option value="0.7">0.7 - More creative</option><option value="0.9">0.9 - Highly creative</option>
                </select>
              </label>
              <div className="flex items-center justify-between py-3 border-t border-slate-200">
                <div><div className="font-medium text-sm">Fact Checking</div><div className="text-xs text-slate-500">Verify claims in generated content</div></div>
                <button onClick={() => setNexusAiSettings({ ...nexusAiSettings, enableFactChecking: !nexusAiSettings.enableFactChecking })} className={`w-12 h-6 rounded-full transition-colors ${nexusAiSettings.enableFactChecking ? "bg-purple-500" : "bg-slate-200"}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${nexusAiSettings.enableFactChecking ? "translate-x-6" : "translate-x-0.5"}`} /></button>
              </div>
            </div>
          </div>

          {/* Publishing */}
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Globe size={16} className="text-emerald-600" /> Publishing</h3>
            <div className="space-y-4 max-w-md">
              <label className="block"><span className="block text-sm font-medium text-slate-500 mb-2">Default Article Status</span>
                <select value={nexusPublishingSettings.defaultStatus} onChange={(e) => setNexusPublishingSettings({ ...nexusPublishingSettings, defaultStatus: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500">
                  <option value="draft">Draft</option><option value="in_review">In Review</option><option value="published">Published</option>
                </select>
              </label>
              {[
                { key: "requireReview" as const, label: "Require Review", desc: "Articles must be reviewed before publishing", color: "emerald" },
                { key: "notifyOnPublish" as const, label: "Notify on Publish", desc: "Send notifications when articles are published", color: "emerald" },
              ].map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between py-3 border-t border-slate-200">
                  <div><div className="font-medium text-sm">{toggle.label}</div><div className="text-xs text-slate-500">{toggle.desc}</div></div>
                  <button onClick={() => setNexusPublishingSettings({ ...nexusPublishingSettings, [toggle.key]: !nexusPublishingSettings[toggle.key] })} className={`w-12 h-6 rounded-full transition-colors ${nexusPublishingSettings[toggle.key] ? "bg-emerald-500" : "bg-slate-200"}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${nexusPublishingSettings[toggle.key] ? "translate-x-6" : "translate-x-0.5"}`} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-red-600"><AlertTriangle size={16} /> Danger Zone</h3>
            <div className="flex items-center justify-between">
              <div><div className="font-medium text-sm">Reset All Settings</div><div className="text-xs text-slate-500">Restore default configuration</div></div>
              <button className="px-4 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-red-600 text-sm transition-colors">Reset</button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-red-500/20">
              <div><div className="font-medium text-sm">Delete All Data</div><div className="text-xs text-slate-500">Permanently delete all projects and articles</div></div>
              <button className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm transition-colors">Delete All</button>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={async () => { setNexusSaving(true); await new Promise(r => setTimeout(r, 1000)); setNexusSaving(false); }} disabled={nexusSaving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium transition-colors disabled:opacity-60">
              {nexusSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}{nexusSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
