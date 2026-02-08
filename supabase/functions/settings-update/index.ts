import { z } from "https://esm.sh/zod@3.23.8";
import {
  corsErrorResponse,
  corsOptionsResponse,
  corsResponse,
  getSupabaseClient,
  requireUser,
} from "../_shared/secrets.ts";

const ModulesSchema = z.object({
  multi_tools: z.boolean(),
  build: z.boolean(),
  daily_checks: z.boolean(),
  asset_tracker: z.boolean(),
  nico_geo: z.boolean(),
  nexus_opencopy: z.boolean(),
});

const ProvidersSchema = z.object({
  keyword_data: z.string(),
  ai: z.string(),
});

const SettingsSchema = z.object({
  modules: ModulesSchema,
  providers: ProvidersSchema,
  api_keys: z.object({
    custom: z.array(
      z.object({
        key: z.string().min(1),
        label: z.string().optional(),
      })
    ),
  }),
  mcp: z.object({
    servers: z.array(
      z.object({
        name: z.string().optional(),
        base_url: z.string().optional(),
        enabled: z.boolean(),
        headers: z.array(
          z.object({
            key: z.string().optional(),
            value: z.string().optional(),
            isSecret: z.boolean(),
          })
        ),
      })
    ),
  }),
  integrations: z.object({
    cloudflare_account_id: z.string(),
    cloudflare_zone_id: z.string(),
    google_ga_property_id: z.string(),
    google_gsc_site: z.string(),
  }),
});

const PayloadSchema = z.object({
  settings: SettingsSchema,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();
    console.info("settings-update", { userId: user.id });

    const json = await req.json();
    const parsed = PayloadSchema.safeParse(json);
    if (!parsed.success) {
      return corsErrorResponse(req, parsed.error.flatten().formErrors.join(" "), 400);
    }

    const updated_at = new Date().toISOString();
    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      settings: parsed.data.settings,
      updated_at,
    });

    if (error) {
      return corsErrorResponse(req, error.message, 500);
    }

    return corsResponse(req, { ok: true, updated_at });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 401);
  }
});
