// Supabase Edge Function: Keyword Research
// Uses DataForSEO API for keyword ideas, search volume, and difficulty

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
  getSecret,
} from "../_shared/secrets.ts";

interface KeywordResult {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  competitionLevel: string;
  keywordDifficulty: number | null;
  monthlySearches: { year: number; month: number; volume: number }[];
  serpFeatures: string[];
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

async function getKeywordIdeas(
  keywords: string[],
  locationCode: number,
  languageCode: string,
  credentials: DataForSEOCredentials,
  limit: number = 100
): Promise<KeywordResult[]> {
  const tasks = keywords.slice(0, 10).map(keyword => ({
    keyword,
    location_code: locationCode,
    language_code: languageCode,
    include_serp_info: true,
    limit,
  }));

  const response = await callDataForSEO(
    "keywords_data/google_ads/keywords_for_keywords/live",
    tasks,
    credentials
  ) as { tasks?: { result?: { items?: unknown[] }[] }[] };

  const results: KeywordResult[] = [];
  const seen = new Set<string>();

  for (const task of response.tasks || []) {
    for (const result of task.result || []) {
      for (const item of (result as { items?: unknown[] }).items || []) {
        const kw = item as {
          keyword: string;
          search_volume: number;
          cpc: number;
          competition: number;
          competition_level: string;
          monthly_searches: { year: number; month: number; search_volume: number }[];
        };

        const normalized = kw.keyword.toLowerCase();
        if (seen.has(normalized)) continue;
        seen.add(normalized);

        results.push({
          keyword: kw.keyword,
          searchVolume: kw.search_volume || 0,
          cpc: kw.cpc || 0,
          competition: kw.competition || 0,
          competitionLevel: kw.competition_level || "UNKNOWN",
          keywordDifficulty: null,
          monthlySearches: (kw.monthly_searches || []).map(m => ({
            year: m.year,
            month: m.month,
            volume: m.search_volume,
          })),
          serpFeatures: [],
        });
      }
    }
  }

  return results.sort((a, b) => b.searchVolume - a.searchVolume);
}

async function getKeywordDifficulty(
  keywords: string[],
  locationCode: number,
  languageCode: string,
  credentials: DataForSEOCredentials
): Promise<Map<string, number>> {
  const difficultyMap = new Map<string, number>();

  // Process in batches of 1000
  for (let i = 0; i < keywords.length; i += 1000) {
    const batch = keywords.slice(i, i + 1000);

    const tasks = [{
      keywords: batch,
      location_code: locationCode,
      language_code: languageCode,
    }];

    try {
      const response = await callDataForSEO(
        "keywords_data/google_ads/keywords_for_keywords/live",
        tasks,
        credentials
      ) as { tasks?: { result?: { items?: { keyword: string; keyword_difficulty: number }[] }[] }[] };

      for (const task of response.tasks || []) {
        for (const result of task.result || []) {
          for (const item of result.items || []) {
            difficultyMap.set(item.keyword.toLowerCase(), item.keyword_difficulty);
          }
        }
      }
    } catch {
      // Continue without difficulty data
    }

    // Rate limiting
    if (i + 1000 < keywords.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return difficultyMap;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    // GET - List search history
    if (req.method === "GET") {
      const url = new URL(req.url);
      const searchId = url.searchParams.get("id");

      if (searchId) {
        const { data, error } = await supabase
          .from("seo_search_history")
          .select("*")
          .eq("id", searchId)
          .eq("user_id", user.id)
          .single();

        if (error) return corsErrorResponse(req, error.message, 404);
        return corsResponse(req, data);
      }

      const { data: searches, error } = await supabase
        .from("seo_search_history")
        .select("id, search_name, seed_keyword, country, keyword_count, serp_count, created_at, is_favorite, tags")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) return corsErrorResponse(req, error.message, 500);
      return corsResponse(req, { searches });
    }

    // POST - Run keyword research
    if (req.method === "POST") {
      const body = await req.json();
      const {
        keywords,
        location_code = 2826,
        language_code = "en",
        search_name,
        fetch_difficulty = true,
        limit = 100,
      } = body;

      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return corsErrorResponse(req, "keywords array is required", 400);
      }

      // Check for DataForSEO credentials
      const credentials = await getDataForSEOCredentials();
      if (!credentials) {
        return corsErrorResponse(req, "DataForSEO credentials not configured", 500);
      }

      // Get keyword ideas
      let results = await getKeywordIdeas(
        keywords,
        location_code,
        language_code,
        credentials,
        limit
      );

      // Optionally fetch difficulty scores
      if (fetch_difficulty && results.length > 0) {
        const difficultyMap = await getKeywordDifficulty(
          results.map(r => r.keyword),
          location_code,
          language_code,
          credentials
        );

        results = results.map(r => ({
          ...r,
          keywordDifficulty: difficultyMap.get(r.keyword.toLowerCase()) || null,
        }));
      }

      // Calculate stats
      const totalVolume = results.reduce((sum, r) => sum + r.searchVolume, 0);
      const avgDifficulty = results.filter(r => r.keywordDifficulty !== null).length > 0
        ? results.filter(r => r.keywordDifficulty !== null)
            .reduce((sum, r) => sum + (r.keywordDifficulty || 0), 0) /
          results.filter(r => r.keywordDifficulty !== null).length
        : null;

      // Save to search history
      const { data: search, error } = await supabase
        .from("seo_search_history")
        .insert({
          user_id: user.id,
          search_name: search_name || `Research: ${keywords[0]}`,
          seed_keyword: keywords.join(", "),
          country_code: location_code,
          language_code,
          keyword_results: results,
          keyword_count: results.length,
          total_search_volume: totalVolume,
          avg_difficulty: avgDifficulty,
        })
        .select()
        .single();

      if (error) return corsErrorResponse(req, error.message, 500);

      // Log API usage
      await supabase.from("api_usage_logs").insert({
        user_id: user.id,
        endpoint: "keywords_data/google_ads/keywords_for_keywords/live",
        provider: "dataforseo",
        credits_used: keywords.length * 0.05, // Approximate cost
      });

      return corsResponse(req, {
        search_id: search.id,
        keywords: results,
        stats: {
          total: results.length,
          totalVolume,
          avgDifficulty,
        },
      }, 201);
    }

    // DELETE - Delete search history
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = body;

      if (!id) return corsErrorResponse(req, "Search ID required", 400);

      const { error } = await supabase
        .from("seo_search_history")
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
