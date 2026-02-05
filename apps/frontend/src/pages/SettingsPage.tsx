import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth";
import { callEdgeFunction, type EdgeFunctionResult } from "../lib/edgeFunctions";
import { getSupabase, getSupabaseEnvStatus, getSupabaseInitError } from "../lib/supabase";

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
  { key: "dataforseo_password", label: "DataForSEO Password", placeholder: "••••••••" },
  { key: "dataforseo_token", label: "DataForSEO Token", placeholder: "Optional token value" },
  { key: "openai_api_key", label: "OpenAI API Key", placeholder: "sk-..." },
  { key: "google_api_key", label: "Google API Key (GSC/GA)", placeholder: "Optional" },
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
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
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
  const supabase = useMemo(() => getSupabase(), []);
  const initError = getSupabaseInitError();

  const [activeTab, setActiveTab] = useState<"api" | "mcp" | "integrations" | "diagnostics">("api");
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

  const [inputVisibility, setInputVisibility] = useState<Record<string, boolean>>({});
  const [revealedVisibility, setRevealedVisibility] = useState<Record<string, boolean>>({});

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function toggleInputVisibility(key: string) {
    setInputVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleRevealVisibility(key: string) {
    setRevealedVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const envBanner =
    supabaseEnv.status === "ok"
      ? { label: "OK", classes: "border-emerald-200 bg-emerald-50 text-emerald-800" }
      : supabaseEnv.status === "warn"
      ? { label: "WARN", classes: "border-amber-200 bg-amber-50 text-amber-800" }
      : { label: "ERROR", classes: "border-red-200 bg-red-50 text-red-800" };

  if (mode === "demo" || !supabase) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Supabase is not configured in demo mode. Configure Supabase env vars to
          manage API keys, MCP servers, and diagnostics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Centralize API keys, MCP servers, integrations, and diagnostics for the master app.
        </p>
      </div>

      <div className={`rounded-2xl border p-4 text-sm ${envBanner.classes}`}>
        <div className="font-semibold">Supabase env status: {envBanner.label}</div>
        <div className="mt-1">URL and anon key validation includes presence, format, and safe metadata checks.</div>
      </div>

      {initError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Supabase init warning: {initError.message}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { id: "api", label: "API Keys" },
          { id: "mcp", label: "MCP" },
          { id: "integrations", label: "Integrations" },
          { id: "diagnostics", label: "Diagnostics" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`rounded-full border px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-500/70 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              activeTab === tab.id
                ? "bg-slate-800 text-slate-100 border-slate-700"
                : "bg-slate-900/40 text-slate-200 border-slate-800 hover:bg-slate-900/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "api" && (
        <div className="rounded-2xl border bg-white p-6 shadow-soft space-y-6">
          <div>
            <h2 className="text-lg font-semibold">API Keys</h2>
            <p className="text-sm text-slate-600">
              Keys are stored server-side via Supabase Edge Functions. Values are masked by default.
            </p>
          </div>

          <div className="grid gap-4">
            {apiKeyFields.map((field) => {
              const state = apiKeys[field.key];
              return (
                <div key={field.key} className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{field.label}</div>
                      <div className="text-xs text-slate-500">
                        {state.masked ? `Stored (${state.masked})` : "Not set"}
                      </div>
                    </div>
                    <button
                      onClick={() => revealSecret(field.key)}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                      disabled={state.status !== "idle"}
                    >
                      Reveal
                    </button>
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
                      className="rounded-xl border px-3 py-2"
                    />
                    <button
                      onClick={() => toggleInputVisibility(field.key)}
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      {inputVisibility[field.key] ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => saveSecret(field.key)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
                      disabled={state.status === "saving" || !state.value.trim()}
                    >
                      {state.status === "saving" ? "Saving…" : "Save"}
                    </button>
                  </div>
                  {state.revealed && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Reveal block</span>
                        <button
                          onClick={() => toggleRevealVisibility(field.key)}
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] hover:bg-white"
                        >
                          {revealedVisibility[field.key] ? "Hide" : "Reveal"}
                        </button>
                      </div>
                      <div className="mt-2 break-all">
                        {revealedVisibility[field.key] ? state.revealed : "••••••••••••"}
                      </div>
                    </div>
                  )}
                  {state.error && <div className="text-xs text-red-600">{state.error}</div>}
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border p-4 space-y-4">
            <div>
              <div className="font-medium">Custom key/value</div>
              <p className="text-xs text-slate-500">
                Add custom secret keys by name (e.g., \"partner_api_key\").
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <input
                value={customDraft.label}
                onChange={(event) => setCustomDraft((prev) => ({ ...prev, label: event.target.value }))}
                placeholder="Label (optional)"
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                value={customDraft.key}
                onChange={(event) => setCustomDraft((prev) => ({ ...prev, key: event.target.value }))}
                placeholder="Key name"
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <button
                onClick={addCustomKey}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
              >
                Add custom key
              </button>
            </div>

            {customKeys.length === 0 && (
              <div className="text-xs text-slate-500">No custom keys yet.</div>
            )}

            <div className="grid gap-3">
              {customKeys.map((entry) => {
                const state = apiKeys[entry.key] ?? {
                  value: "",
                  masked: null,
                  revealed: null,
                  status: "idle",
                  error: null,
                };
                return (
                  <div key={entry.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium">{entry.label || entry.key}</div>
                        <div className="text-xs text-slate-500">{entry.key}</div>
                      </div>
                      <button
                        onClick={() => removeCustomKey(entry.id)}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
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
                        className="rounded-lg border px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => toggleInputVisibility(entry.key)}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                      >
                        {inputVisibility[entry.key] ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => revealSecret(entry.key)}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                        disabled={state.status !== "idle"}
                      >
                        Reveal
                      </button>
                      <button
                        onClick={() => saveSecret(entry.key)}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white"
                        disabled={!state.value.trim() || state.status === "saving"}
                      >
                        {state.status === "saving" ? "Saving…" : "Save"}
                      </button>
                    </div>
                    <div className="text-xs text-slate-500">
                      {state.masked ? `Stored (${state.masked})` : "Not set"}
                    </div>
                    {state.revealed && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Reveal block</span>
                          <button
                            onClick={() => toggleRevealVisibility(entry.key)}
                            className="rounded border border-slate-300 px-2 py-1 text-[11px] hover:bg-white"
                          >
                            {revealedVisibility[entry.key] ? "Hide" : "Reveal"}
                          </button>
                        </div>
                        <div className="mt-2 break-all">
                          {revealedVisibility[entry.key] ? state.revealed : "••••••••••••"}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {customMessage && (
              <div
                className={`text-xs ${
                  customStatus === "error" ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {customMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "mcp" && (
        <div className="rounded-2xl border bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">MCP Servers</h2>
              <p className="text-sm text-slate-600">
                Define server endpoints, toggle enablement, and manage header secrets.
              </p>
            </div>
            <button
              onClick={addServer}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
            >
              Add server
            </button>
          </div>

          <div className="space-y-4">
            {mcpServers.map((server) => (
              <div key={server.id} className="rounded-xl border p-4 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="grid gap-3 md:grid-cols-2 flex-1">
                    <input
                      value={server.name}
                      onChange={(event) => updateServer(server.id, { name: event.target.value })}
                      placeholder="Server name"
                      className="rounded-xl border px-3 py-2"
                    />
                    <input
                      value={server.base_url}
                      onChange={(event) => updateServer(server.id, { base_url: event.target.value })}
                      placeholder="https://mcp.example.com"
                      className="rounded-xl border px-3 py-2"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={server.enabled}
                        onChange={(event) => updateServer(server.id, { enabled: event.target.checked })}
                      />
                      Enabled
                    </label>
                    <button
                      onClick={() => removeServer(server.id)}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Headers</div>
                    <button
                      onClick={() => addHeader(server.id)}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      Add header
                    </button>
                  </div>
                  {server.headers.length === 0 && (
                    <div className="text-xs text-slate-500">No headers configured.</div>
                  )}
                  {server.headers.map((header) => (
                    <div key={header.id} className="rounded-lg border p-3 space-y-2">
                      <div className="grid gap-2 md:grid-cols-3">
                        <input
                          value={header.key}
                          onChange={(event) =>
                            updateHeader(server.id, header.id, { key: event.target.value })
                          }
                          placeholder="Header key"
                          className="rounded-lg border px-3 py-2 text-sm"
                        />
                        <input
                          value={header.value}
                          onChange={(event) =>
                            updateHeader(server.id, header.id, { value: event.target.value })
                          }
                          placeholder={header.isSecret ? "Secret name" : "Header value"}
                          className="rounded-lg border px-3 py-2 text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={header.isSecret}
                              onChange={(event) =>
                                updateHeader(server.id, header.id, { isSecret: event.target.checked })
                              }
                            />
                            Secret
                          </label>
                          <button
                            onClick={() => removeHeader(server.id, header.id)}
                            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
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
                          className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900"
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

          <div className="flex items-center gap-3">
            <button
              onClick={saveMcpConfig}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
              disabled={mcpStatus === "saving"}
            >
              {mcpStatus === "saving" ? "Saving…" : "Save MCP config"}
            </button>
            {mcpMessage && (
              <span
                className={`text-sm ${mcpStatus === "error" ? "text-red-600" : "text-emerald-600"}`}
              >
                {mcpMessage}
              </span>
            )}
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="rounded-2xl border bg-white p-6 shadow-soft space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Integrations</h2>
            <p className="text-sm text-slate-600">
              Store non-secret IDs and metadata for upstream services.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Cloudflare Account ID</span>
              <input
                value={integrations.cloudflare_account_id}
                onChange={(event) =>
                  setIntegrations((prev) => ({ ...prev, cloudflare_account_id: event.target.value }))
                }
                placeholder="Account ID"
                className="w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Cloudflare Zone ID</span>
              <input
                value={integrations.cloudflare_zone_id}
                onChange={(event) =>
                  setIntegrations((prev) => ({ ...prev, cloudflare_zone_id: event.target.value }))
                }
                placeholder="Zone ID"
                className="w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Google Analytics Property ID</span>
              <input
                value={integrations.google_ga_property_id}
                onChange={(event) =>
                  setIntegrations((prev) => ({ ...prev, google_ga_property_id: event.target.value }))
                }
                placeholder="GA property ID"
                className="w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Google Search Console Site</span>
              <input
                value={integrations.google_gsc_site}
                onChange={(event) =>
                  setIntegrations((prev) => ({ ...prev, google_gsc_site: event.target.value }))
                }
                placeholder="https://example.com"
                className="w-full rounded-xl border px-3 py-2"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveIntegrations}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
              disabled={integrationStatus === "saving"}
            >
              {integrationStatus === "saving" ? "Saving…" : "Save integrations"}
            </button>
            {integrationMessage && (
              <span
                className={`text-sm ${
                  integrationStatus === "error" ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {integrationMessage}
              </span>
            )}
          </div>
        </div>
      )}

      {activeTab === "diagnostics" && (
        <div className="rounded-2xl border bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Diagnostics</h2>
              <p className="text-sm text-slate-600">
                Confirm Supabase connectivity and Edge Functions availability.
              </p>
            </div>
            <button
              onClick={runDiagnostics}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
            >
              Run diagnostics
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

            <div className="rounded-xl border p-4 space-y-2">
              <div className="font-medium">Session</div>
              <div className="flex justify-between">
                <span>Status</span>
                <span>{diagnostics.sessionStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>User ID</span>
                <span className="truncate">{diagnostics.userId || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Email</span>
                <span>{diagnostics.userEmail || "—"}</span>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-2 md:col-span-2">
              <div className="font-medium">Edge Functions</div>
              <div className="flex justify-between">
                <span>secrets-list</span>
                <span>
                  {diagnostics.edgeStatus === "checking"
                    ? "checking..."
                    : diagnostics.edgeStatus}
                </span>
              </div>
              {diagnostics.edgeMessage && (
                <div className="text-xs text-slate-500">{diagnostics.edgeMessage}</div>
              )}
            </div>

            <div className="rounded-xl border p-4 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Edge Function test</div>
                <button
                  onClick={runEdgeTest}
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                  disabled={edgeTest.status === "running"}
                >
                  {edgeTest.status === "running" ? "Testing…" : "Test Edge Functions"}
                </button>
              </div>
              <div className="text-xs text-slate-500">
                Calls <span className="font-medium">secrets-list</span> and returns the response for
                in-app diagnostics.
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 whitespace-pre-wrap">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
