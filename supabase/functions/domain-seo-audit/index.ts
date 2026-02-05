// Supabase Edge Function: Domain SEO Audit
// Comprehensive domain analysis using DataForSEO

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
  getSecret,
} from "../_shared/secrets.ts";

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

function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/.*$/, "")
    .trim();
}

async function getDomainOverview(
  domain: string,
  locationCode: number,
  credentials: DataForSEOCredentials
): Promise<{
  domainRank: number;
  organicTraffic: number;
  organicKeywords: number;
  backlinks: number;
  referringDomains: number;
}> {
  const tasks = [{
    target: domain,
    location_code: locationCode,
    language_code: "en",
  }];

  try {
    const response = await callDataForSEO(
      "dataforseo_labs/google/domain_metrics_by_categories/live",
      tasks,
      credentials
    ) as { tasks?: { result?: { items?: unknown[] }[] }[] };

    const item = response.tasks?.[0]?.result?.[0]?.items?.[0] as {
      metrics?: {
        organic?: {
          etv?: number;
          count?: number;
          pos_1?: number;
          pos_2_3?: number;
        };
      };
      backlinks_info?: {
        backlinks?: number;
        referring_domains?: number;
      };
      rank?: number;
    } | undefined;

    return {
      domainRank: item?.rank || 0,
      organicTraffic: item?.metrics?.organic?.etv || 0,
      organicKeywords: item?.metrics?.organic?.count || 0,
      backlinks: item?.backlinks_info?.backlinks || 0,
      referringDomains: item?.backlinks_info?.referring_domains || 0,
    };
  } catch {
    return {
      domainRank: 0,
      organicTraffic: 0,
      organicKeywords: 0,
      backlinks: 0,
      referringDomains: 0,
    };
  }
}

async function getRankedKeywords(
  domain: string,
  locationCode: number,
  credentials: DataForSEOCredentials,
  limit: number = 100
): Promise<{
  keyword: string;
  position: number;
  searchVolume: number;
  url: string;
  difficulty: number;
}[]> {
  const tasks = [{
    target: domain,
    location_code: locationCode,
    language_code: "en",
    limit,
    order_by: ["keyword_data.keyword_info.search_volume,desc"],
  }];

  try {
    const response = await callDataForSEO(
      "dataforseo_labs/google/ranked_keywords/live",
      tasks,
      credentials
    ) as { tasks?: { result?: { items?: unknown[] }[] }[] };

    const items = response.tasks?.[0]?.result?.[0]?.items || [];
    return (items as {
      keyword_data?: {
        keyword?: string;
        keyword_info?: { search_volume?: number };
      };
      ranked_serp_element?: {
        serp_item?: { rank_absolute?: number; url?: string };
      };
      keyword_difficulty?: number;
    }[]).map(item => ({
      keyword: item.keyword_data?.keyword || "",
      position: item.ranked_serp_element?.serp_item?.rank_absolute || 0,
      searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
      url: item.ranked_serp_element?.serp_item?.url || "",
      difficulty: item.keyword_difficulty || 0,
    }));
  } catch {
    return [];
  }
}

async function getCompetitors(
  domain: string,
  locationCode: number,
  credentials: DataForSEOCredentials,
  limit: number = 10
): Promise<{
  domain: string;
  avgPosition: number;
  keywords: number;
  traffic: number;
  intersections: number;
}[]> {
  const tasks = [{
    target: domain,
    location_code: locationCode,
    language_code: "en",
    limit,
  }];

  try {
    const response = await callDataForSEO(
      "dataforseo_labs/google/competitors_domain/live",
      tasks,
      credentials
    ) as { tasks?: { result?: { items?: unknown[] }[] }[] };

    const items = response.tasks?.[0]?.result?.[0]?.items || [];
    return (items as {
      domain?: string;
      avg_position?: number;
      sum_position?: number;
      intersections?: number;
      metrics?: { organic?: { etv?: number; count?: number } };
    }[]).map(item => ({
      domain: item.domain || "",
      avgPosition: item.avg_position || 0,
      keywords: item.metrics?.organic?.count || 0,
      traffic: item.metrics?.organic?.etv || 0,
      intersections: item.intersections || 0,
    }));
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    // GET - List audits or get single audit
    if (req.method === "GET") {
      const url = new URL(req.url);
      const auditId = url.searchParams.get("id");

      if (auditId) {
        const { data, error } = await supabase
          .from("domain_seo_audits")
          .select("*")
          .eq("id", auditId)
          .eq("user_id", user.id)
          .single();

        if (error) return corsErrorResponse(req, error.message, 404);
        return corsResponse(req, data);
      }

      const { data: audits, error } = await supabase
        .from("domain_seo_audits")
        .select("id, domain, status, domain_rank, organic_traffic, organic_keywords, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) return corsErrorResponse(req, error.message, 500);
      return corsResponse(req, { audits });
    }

    // POST - Start new audit
    if (req.method === "POST") {
      const body = await req.json();
      const { domain, location_code = 2826, audit_level = "standard" } = body;

      if (!domain) {
        return corsErrorResponse(req, "domain is required", 400);
      }

      const normalizedDomain = normalizeDomain(domain);

      // Check for credentials
      const credentials = await getDataForSEOCredentials();
      if (!credentials) {
        return corsErrorResponse(req, "DataForSEO credentials not configured", 500);
      }

      // Create audit record
      const { data: audit, error: createError } = await supabase
        .from("domain_seo_audits")
        .insert({
          user_id: user.id,
          domain: normalizedDomain,
          audit_level,
          status: "analyzing",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) return corsErrorResponse(req, createError.message, 500);

      const failedEndpoints: string[] = [];

      // Get domain overview
      const overview = await getDomainOverview(normalizedDomain, location_code, credentials);

      // Get ranked keywords
      const rankedKeywords = await getRankedKeywords(
        normalizedDomain,
        location_code,
        credentials,
        audit_level === "deep" ? 500 : 100
      );

      // Get competitors
      const competitors = await getCompetitors(normalizedDomain, location_code, credentials);

      // Update audit with results
      const { data: finalAudit, error: updateError } = await supabase
        .from("domain_seo_audits")
        .update({
          status: "completed",
          domain_rank: overview.domainRank,
          organic_traffic: overview.organicTraffic,
          organic_keywords: overview.organicKeywords,
          backlinks_count: overview.backlinks,
          referring_domains: overview.referringDomains,
          ranked_keywords: rankedKeywords,
          competitors,
          failed_endpoints: failedEndpoints.length > 0 ? failedEndpoints : null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", audit.id)
        .select()
        .single();

      if (updateError) return corsErrorResponse(req, updateError.message, 500);

      // Log API usage
      await supabase.from("api_usage_logs").insert({
        user_id: user.id,
        endpoint: "domain_seo_audit",
        provider: "dataforseo",
        credits_used: 0.5, // Approximate
      });

      return corsResponse(req, finalAudit, 201);
    }

    // DELETE - Delete audit
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = body;

      if (!id) return corsErrorResponse(req, "Audit ID required", 400);

      const { error } = await supabase
        .from("domain_seo_audits")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) return corsErrorResponse(req, error.message, 500);
      return corsResponse(req, { success: true, deleted_id: id });
    }

    return corsErrorResponse(req, "Method not allowed", 405);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
