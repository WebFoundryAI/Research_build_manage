// Supabase Edge Function: Website Availability Check
// Performs HEAD/GET request to check if website is live, records response time

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
} from "../_shared/secrets.ts";

const TIMEOUT_MS = 25000;

interface CheckResult {
  is_live: boolean;
  status_code: number | null;
  response_time_ms: number;
  error_message: string | null;
  checked_at: string;
}

async function checkWebsiteAvailability(url: string): Promise<CheckResult> {
  const start = Date.now();
  const checkedAt = new Date().toISOString();

  // Ensure URL has protocol
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Try HEAD first, fall back to GET
    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
      });
    } catch {
      response = await fetch(fullUrl, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
      });
    }

    clearTimeout(timeoutId);
    const responseTime = Date.now() - start;

    return {
      is_live: response.ok || response.status < 500,
      status_code: response.status,
      response_time_ms: responseTime,
      error_message: null,
      checked_at: checkedAt,
    };
  } catch (err) {
    const responseTime = Date.now() - start;
    return {
      is_live: false,
      status_code: null,
      response_time_ms: responseTime,
      error_message: err instanceof Error ? err.message : "Unknown error",
      checked_at: checkedAt,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    const { website_id, url } = await req.json();

    if (!url) {
      return corsErrorResponse(req, "URL is required", 400);
    }

    // Perform the availability check
    const result = await checkWebsiteAvailability(url);

    // If website_id provided, save to database
    if (website_id) {
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

      // Insert status check record
      await supabase.from("status_checks").insert({
        website_id,
        is_live: result.is_live,
        response_time_ms: result.response_time_ms,
        status_code: result.status_code,
        error_message: result.error_message,
        checked_at: result.checked_at,
      });

      // Update website status
      await supabase
        .from("websites")
        .update({
          status: result.status_code,
          response_time_ms: result.response_time_ms,
          last_checked_at: result.checked_at,
        })
        .eq("id", website_id);
    }

    return corsResponse(req, {
      ok: result.is_live,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
