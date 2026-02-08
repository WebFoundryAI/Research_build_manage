import { z } from "https://esm.sh/zod@3.23.8";
import {
  corsErrorResponse,
  corsOptionsResponse,
  corsResponse,
  getSupabaseClient,
  requireUser,
} from "../_shared/secrets.ts";

const ModulesSchema = z
  .object({
    multi_tools: z.boolean().optional(),
    build: z.boolean().optional(),
    daily_checks: z.boolean().optional(),
    asset_tracker: z.boolean().optional(),
    nico_geo: z.boolean().optional(),
    nexus_opencopy: z.boolean().optional(),
  })
  .partial();

const ProvidersSchema = z
  .object({
    keyword_data: z.string().optional(),
    ai: z.string().optional(),
  })
  .partial();

const SettingsSchema = z
  .object({
    modules: ModulesSchema.optional(),
    providers: ProvidersSchema.optional(),
    api_keys: z
      .object({
        custom: z
          .array(
            z.object({
              key: z.string().min(1),
              label: z.string().optional(),
            })
          )
          .optional(),
      })
      .optional(),
    mcp: z
      .object({
        servers: z
          .array(
            z.object({
              name: z.string().optional(),
              base_url: z.string().optional(),
              enabled: z.boolean().optional(),
              headers: z
                .array(
                  z.object({
                    key: z.string().optional(),
                    value: z.string().optional(),
                    isSecret: z.boolean().optional(),
                  })
                )
                .optional(),
            })
          )
          .optional(),
      })
      .optional(),
    integrations: z
      .object({
        cloudflare_account_id: z.string().optional(),
        cloudflare_zone_id: z.string().optional(),
        google_ga_property_id: z.string().optional(),
        google_gsc_site: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

const defaultSettings = {
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
};

function mergeSettings(input?: z.infer<typeof SettingsSchema>) {
  return {
    ...defaultSettings,
    ...input,
    modules: { ...defaultSettings.modules, ...(input?.modules ?? {}) },
    providers: { ...defaultSettings.providers, ...(input?.providers ?? {}) },
    api_keys: { custom: input?.api_keys?.custom ?? defaultSettings.api_keys.custom },
    mcp: { servers: input?.mcp?.servers ?? defaultSettings.mcp.servers },
    integrations: { ...defaultSettings.integrations, ...(input?.integrations ?? {}) },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const supabase = getSupabaseClient();
    const user = await requireUser(req);
    console.info("settings-get", { userId: user.id });

    const { data, error } = await supabase
      .from("user_settings")
      .select("settings, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return corsErrorResponse(req, error.message, 500);
    }

    const parsed = SettingsSchema.safeParse(data?.settings ?? {});
    const settings = mergeSettings(parsed.success ? parsed.data : {});
    return corsResponse(req, { settings, updated_at: data?.updated_at ?? null });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 401);
  }
});
