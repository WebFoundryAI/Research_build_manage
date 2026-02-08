import { corsErrorResponse, corsOptionsResponse, corsResponse, getSecretValue, requireUser } from "../_shared/secrets.ts";

const TOOL_SECRETS: Record<string, string[]> = {
  "single-url-scrape": ["dataforseo_login", "dataforseo_password"],
  "site-crawl": ["dataforseo_login", "dataforseo_password"],
  "url-map": ["dataforseo_login", "dataforseo_password"],
  "web-search-scrape": ["dataforseo_login", "dataforseo_password"],
  "structured-extract": ["dataforseo_login", "dataforseo_password"],
  "site-cloner": ["dataforseo_login", "dataforseo_password"],
  "deep-research": ["openai_api_key"],
  "product-research": ["openai_api_key"],
  "content-analysis": ["openai_api_key"],
  "question-finder": ["dataforseo_login", "dataforseo_password"],
  "keyword-cluster": ["dataforseo_login", "dataforseo_password"],
  "keyword-gap": ["dataforseo_login", "dataforseo_password"],
  "serp-compare": ["dataforseo_login", "dataforseo_password"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const { toolId, inputs } = await req.json();
    if (!toolId) {
      return corsErrorResponse(req, "toolId is required", 400);
    }

    const required = TOOL_SECRETS[String(toolId)] ?? [];
    const secretStatus: Record<string, boolean> = {};
    for (const key of required) {
      const value = await getSecretValue(user.id, key);
      secretStatus[key] = Boolean(value);
    }

    return corsResponse(req, {
      ok: true,
      toolId: String(toolId),
      inputs: inputs ?? {},
      secrets: secretStatus,
      message: "Tool request accepted. Connect provider integrations server-side to return results.",
    });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
