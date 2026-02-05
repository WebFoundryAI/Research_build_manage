// Supabase Edge Function: SERP Analysis
// Analyze search engine results pages for keywords

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
  getSecret,
} from "../_shared/secrets.ts";

interface SerpResult {
  position: number;
  url: string;
  domain: string;
  title: string;
  description: string;
  type: string;
  domainRank?: number;
  backlinks?: number;
}

interface SerpFeature {
  type: string;
  position: number;
}

interface DataForSEOCredentials {
  login: string;
  password: string;
}

async function getDataForSEOCredentials(): Promise<DataForSEOCredentials | null> {
  const login = await getSecret("DATAFORSEO_LOGIN");
  const password = await getSecret("DATAFORSEO_PASSWORD");
  if (!login || !password) return null;
  return { login, password };
}

async function callDataForSEO(
  endpoint: string,
  data: unknown[],
  credentials: DataForSEOCredentials
): Promise<unknown> {
  const auth = btoa(`${credentials.login}:${credentials.password}`);

  const response = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.status}`);
  }

  return response.json();
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

async function getSerpResults(
  keyword: string,
  locationCode: number,
  languageCode: string,
  credentials: DataForSEOCredentials,
  depth: number = 20
): Promise<{
  results: SerpResult[];
  features: SerpFeature[];
  totalResults: number;
}> {
  const tasks = [{
    keyword,
    location_code: locationCode,
    language_code: languageCode,
    depth,
  }];

  const response = await callDataForSEO(
    "serp/google/organic/live/regular",
    tasks,
    credentials
  ) as {
    tasks?: {
      result?: {
        items?: unknown[];
        se_results_count?: number;
      }[];
    }[];
  };

  const items = response.tasks?.[0]?.result?.[0]?.items || [];
  const totalResults = response.tasks?.[0]?.result?.[0]?.se_results_count || 0;

  const results: SerpResult[] = [];
  const features: SerpFeature[] = [];

  for (const item of items as {
    type?: string;
    rank_absolute?: number;
    url?: string;
    title?: string;
    description?: string;
  }[]) {
    if (item.type === "organic") {
      results.push({
        position: item.rank_absolute || 0,
        url: item.url || "",
        domain: extractDomain(item.url || ""),
        title: item.title || "",
        description: item.description || "",
        type: "organic",
      });
    } else if (item.type && item.rank_absolute) {
      features.push({
        type: item.type,
        position: item.rank_absolute,
      });
    }
  }

  return { results, features, totalResults };
}

async function enrichWithDomainMetrics(
  results: SerpResult[],
  credentials: DataForSEOCredentials
): Promise<SerpResult[]> {
  const domains = [...new Set(results.map(r => r.domain))].slice(0, 20);

  if (domains.length === 0) return results;

  const tasks = domains.map(domain => ({
    target: domain,
    location_code: 2826,
    language_code: "en",
  }));

  try {
    const response = await callDataForSEO(
      "backlinks/domain_pages_summary/live",
      tasks,
      credentials
    ) as { tasks?: { result?: { items?: { target?: string; backlinks?: number; rank?: number }[] }[] }[] };

    const metricsMap = new Map<string, { backlinks: number; rank: number }>();

    for (const task of response.tasks || []) {
      for (const result of task.result || []) {
        for (const item of result.items || []) {
          if (item.target) {
            metricsMap.set(item.target, {
              backlinks: item.backlinks || 0,
              rank: item.rank || 0,
            });
          }
        }
      }
    }

    return results.map(r => ({
      ...r,
      backlinks: metricsMap.get(r.domain)?.backlinks,
      domainRank: metricsMap.get(r.domain)?.rank,
    }));
  } catch {
    return results;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    // POST - Analyze SERP for keyword
    if (req.method === "POST") {
      const body = await req.json();
      const {
        keyword,
        location_code = 2826,
        language_code = "en",
        depth = 20,
        enrich_domains = true,
        save_to_history = true,
        search_id,
      } = body;

      if (!keyword) {
        return corsErrorResponse(req, "keyword is required", 400);
      }

      const credentials = await getDataForSEOCredentials();
      if (!credentials) {
        return corsErrorResponse(req, "DataForSEO credentials not configured", 500);
      }

      // Get SERP results
      let { results, features, totalResults } = await getSerpResults(
        keyword,
        location_code,
        language_code,
        credentials,
        depth
      );

      // Optionally enrich with domain metrics
      if (enrich_domains && results.length > 0) {
        results = await enrichWithDomainMetrics(results, credentials);
      }

      // Optionally save to search history
      if (save_to_history && search_id) {
        await supabase
          .from("seo_search_history")
          .update({
            serp_results: results,
            serp_count: results.length,
            fetch_serp: true,
          })
          .eq("id", search_id)
          .eq("user_id", user.id);
      }

      // Log API usage
      await supabase.from("api_usage_logs").insert({
        user_id: user.id,
        endpoint: "serp/google/organic/live/regular",
        provider: "dataforseo",
        credits_used: 0.1,
      });

      return corsResponse(req, {
        keyword,
        results,
        features,
        totalResults,
        stats: {
          organicResults: results.length,
          featuresCount: features.length,
          avgPosition: results.length > 0
            ? results.reduce((sum, r) => sum + r.position, 0) / results.length
            : 0,
        },
      });
    }

    return corsErrorResponse(req, "Method not allowed", 405);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
