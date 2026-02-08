import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { callEdgeFunction } from "./edgeFunctions";
import { useAuth } from "./auth";

export type ModuleSettings = {
  multi_tools: boolean;
  build: boolean;
  daily_checks: boolean;
  asset_tracker: boolean;
  nico_geo: boolean;
  nexus_opencopy: boolean;
};

export type ProviderSettings = {
  keyword_data: "dataforseo" | "none";
  ai: "openai" | "none";
};

export type Integrations = {
  cloudflare_account_id: string;
  cloudflare_zone_id: string;
  google_ga_property_id: string;
  google_gsc_site: string;
};

export type SettingsRecord = {
  modules: ModuleSettings;
  providers: ProviderSettings;
  api_keys: {
    custom: Array<{ key: string; label?: string }>;
  };
  mcp: {
    servers: Array<{
      name: string;
      base_url: string;
      enabled: boolean;
      headers: Array<{ key: string; value: string; isSecret: boolean }>;
    }>;
  };
  integrations: Integrations;
  updated_at?: string | null;
};

const defaultSettings: SettingsRecord = {
  modules: {
    multi_tools: true,
    build: true,
    daily_checks: true,
    asset_tracker: true,
    nico_geo: true,
    nexus_opencopy: true,
  },
  providers: {
    keyword_data: "dataforseo",
    ai: "openai",
  },
  api_keys: {
    custom: [],
  },
  mcp: {
    servers: [],
  },
  integrations: {
    cloudflare_account_id: "",
    cloudflare_zone_id: "",
    google_ga_property_id: "",
    google_gsc_site: "",
  },
  updated_at: null,
};

function mergeSettings(settings?: Partial<SettingsRecord>): SettingsRecord {
  return {
    ...defaultSettings,
    ...settings,
    modules: { ...defaultSettings.modules, ...(settings?.modules ?? {}) },
    providers: { ...defaultSettings.providers, ...(settings?.providers ?? {}) },
    api_keys: { custom: settings?.api_keys?.custom ?? defaultSettings.api_keys.custom },
    mcp: { servers: settings?.mcp?.servers ?? defaultSettings.mcp.servers },
    integrations: { ...defaultSettings.integrations, ...(settings?.integrations ?? {}) },
    updated_at: settings?.updated_at ?? null,
  };
}

type SettingsContextValue = {
  settings: SettingsRecord;
  status: "idle" | "loading" | "error";
  error: string | null;
  refresh: () => Promise<void>;
  setSettings: React.Dispatch<React.SetStateAction<SettingsRecord>>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsRecord>(defaultSettings);
  const [status, setStatus] = useState<SettingsContextValue["status"]>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useMemo(
    () => async () => {
      if (!user) {
        setStatus("idle");
        setError(null);
        setSettings(defaultSettings);
        return;
      }
      setStatus("loading");
      setError(null);
      try {
        const result = await callEdgeFunction("settings-get", {});
        if (!result.ok) {
          setStatus("error");
          setError(result.bodyText || "Failed to load settings");
          setSettings(defaultSettings);
          return;
        }
        const payload = result.json as { settings?: SettingsRecord; updated_at?: string | null } | undefined;
        const merged = mergeSettings({ ...payload?.settings, updated_at: payload?.updated_at ?? null });
        setSettings(merged);
        setStatus("idle");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to load settings");
        setSettings(defaultSettings);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ settings, status, error, refresh, setSettings }),
    [settings, status, error, refresh]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}

export { defaultSettings, mergeSettings };
