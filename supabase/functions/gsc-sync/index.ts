// Supabase Edge Function: Google Search Console Data Sync
// Fetches performance data from GSC for monitored websites

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
  decryptValue,
  encryptValue,
} from "../_shared/secrets.ts";

async function getAccessToken(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string
): Promise<string | null> {
  const { data: auth } = await supabase
    .from("gsc_auth")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .single();

  if (!auth || !auth.access_token) {
    return null;
  }

  const accessToken = await decryptValue(auth.access_token);

  // Check if token is expired
  if (auth.token_expires_at && new Date(auth.token_expires_at) < new Date()) {
    // Token expired, try to refresh
    if (!auth.refresh_token) {
      return null;
    }

    // Get client credentials
    const { data: clientIdRow } = await supabase
      .from("user_secrets")
      .select("value_encrypted")
      .eq("user_id", userId)
      .eq("key", "gsc_client_id")
      .single();

    const { data: clientSecretRow } = await supabase
      .from("user_secrets")
      .select("value_encrypted")
      .eq("user_id", userId)
      .eq("key", "gsc_client_secret")
      .single();

    if (!clientIdRow || !clientSecretRow) {
      return null;
    }

    const refreshToken = await decryptValue(auth.refresh_token);
    const clientId = await decryptValue(clientIdRow.value_encrypted);
    const clientSecret = await decryptValue(clientSecretRow.value_encrypted);

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenResponse.ok) {
      return null;
    }

    const tokens = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Update stored tokens
    await supabase
      .from("gsc_auth")
      .update({
        access_token: await encryptValue(tokens.access_token),
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return tokens.access_token;
  }

  return accessToken;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    const body = await req.json();
    const { action, website_id, site_url, start_date, end_date } = body;

    const accessToken = await getAccessToken(supabase, user.id);
    if (!accessToken) {
      return corsErrorResponse(req, "GSC not connected or token expired. Please reconnect.", 401);
    }

    // List available sites
    if (action === "list_sites") {
      const response = await fetch(
        "https://www.googleapis.com/webmasters/v3/sites",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        return corsErrorResponse(req, "Failed to fetch GSC sites", response.status);
      }

      const data = await response.json();
      return corsResponse(req, { sites: data.siteEntry || [] });
    }

    // Fetch performance data for a site
    if (action === "fetch_performance") {
      if (!site_url) {
        return corsErrorResponse(req, "site_url is required", 400);
      }

      // Default to last 28 days
      const endDate = end_date || new Date().toISOString().split("T")[0];
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - 28);
      const startDateStr = start_date || startDateObj.toISOString().split("T")[0];

      const encodedSiteUrl = encodeURIComponent(site_url);
      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: startDateStr,
            endDate: endDate,
            dimensions: ["query", "page", "country", "device", "date"],
            rowLimit: 1000,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return corsErrorResponse(req, `Failed to fetch GSC data: ${error}`, response.status);
      }

      const data = await response.json();

      // If website_id provided, store the data
      if (website_id && data.rows) {
        // Verify user owns this website
        const { data: website, error: websiteError } = await supabase
          .from("websites")
          .select("id")
          .eq("id", website_id)
          .eq("user_id", user.id)
          .single();

        if (!websiteError && website) {
          // Delete old data for this website
          await supabase
            .from("gsc_performance")
            .delete()
            .eq("website_id", website_id)
            .gte("date", startDateStr)
            .lte("date", endDate);

          // Insert new data
          const records = data.rows.map((row: {
            keys: string[];
            clicks: number;
            impressions: number;
            ctr: number;
            position: number;
          }) => ({
            website_id,
            query: row.keys[0],
            page: row.keys[1],
            country: row.keys[2],
            device: row.keys[3],
            date: row.keys[4],
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
            fetched_at: new Date().toISOString(),
          }));

          if (records.length > 0) {
            await supabase.from("gsc_performance").insert(records);
          }
        }
      }

      return corsResponse(req, {
        rows: data.rows || [],
        row_count: data.rows?.length || 0,
      });
    }

    // Get stored performance data
    if (action === "get_stored_performance") {
      if (!website_id) {
        return corsErrorResponse(req, "website_id is required", 400);
      }

      // Verify user owns this website
      const { data: website, error: websiteError } = await supabase
        .from("websites")
        .select("id")
        .eq("id", website_id)
        .eq("user_id", user.id)
        .single();

      if (websiteError || !website) {
        return corsErrorResponse(req, "Website not found or access denied", 404);
      }

      // Get aggregated performance data
      const { data: performance, error } = await supabase
        .from("gsc_performance")
        .select("*")
        .eq("website_id", website_id)
        .order("date", { ascending: false })
        .limit(1000);

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      // Aggregate by query
      const queryMap = new Map<string, {
        query: string;
        clicks: number;
        impressions: number;
        avgPosition: number;
        positionCount: number;
      }>();

      for (const row of performance || []) {
        const existing = queryMap.get(row.query) || {
          query: row.query,
          clicks: 0,
          impressions: 0,
          avgPosition: 0,
          positionCount: 0,
        };
        existing.clicks += row.clicks;
        existing.impressions += row.impressions;
        existing.avgPosition += row.position;
        existing.positionCount += 1;
        queryMap.set(row.query, existing);
      }

      const aggregated = Array.from(queryMap.values())
        .map((q) => ({
          query: q.query,
          clicks: q.clicks,
          impressions: q.impressions,
          avg_position: q.avgPosition / q.positionCount,
          ctr: q.impressions > 0 ? q.clicks / q.impressions : 0,
        }))
        .sort((a, b) => b.clicks - a.clicks);

      return corsResponse(req, {
        raw: performance,
        aggregated,
      });
    }

    return corsErrorResponse(req, "Invalid action", 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
