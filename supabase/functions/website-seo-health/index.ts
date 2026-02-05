// Supabase Edge Function: Website SEO Health Check
// Validates robots.txt, sitemap, SSL certificate, and calculates health score

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
} from "../_shared/secrets.ts";

interface SeoHealthResult {
  // Robots.txt
  robots_txt_exists: boolean;
  robots_txt_valid: boolean;
  robots_txt_allows_crawl: boolean;
  robots_txt_content: string | null;
  // Sitemap
  sitemap_exists: boolean;
  sitemap_valid: boolean;
  sitemap_url_count: number;
  sitemap_url: string | null;
  // SSL
  ssl_valid: boolean;
  ssl_issuer: string | null;
  ssl_expires_at: string | null;
  ssl_days_remaining: number | null;
  // Overall
  health_score: number;
  checked_at: string;
}

async function checkRobotsTxt(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/robots.txt`, { method: "GET" });
    if (!res.ok) {
      return { exists: false, valid: false, allowsCrawl: false, content: null };
    }
    const content = await res.text();
    const valid = content.includes("User-agent");
    // Check if Googlebot is allowed (not disallowed for /)
    const allowsCrawl = !content.toLowerCase().includes("disallow: /\n") &&
      !content.toLowerCase().includes("disallow: / ");
    return { exists: true, valid, allowsCrawl, content };
  } catch {
    return { exists: false, valid: false, allowsCrawl: false, content: null };
  }
}

async function checkSitemap(baseUrl: string) {
  const sitemapLocations = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap/sitemap.xml`,
  ];

  for (const url of sitemapLocations) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.ok) {
        const content = await res.text();
        const isValid = content.includes("<urlset") || content.includes("<sitemapindex");
        // Count URLs
        const urlMatches = content.match(/<loc>/g);
        const urlCount = urlMatches ? urlMatches.length : 0;
        return { exists: true, valid: isValid, urlCount, url };
      }
    } catch {
      continue;
    }
  }
  return { exists: false, valid: false, urlCount: 0, url: null };
}

async function checkSsl(baseUrl: string) {
  // For edge functions, we can only check if HTTPS works
  // Full SSL details would require a different approach
  try {
    const httpsUrl = baseUrl.replace("http://", "https://");
    const res = await fetch(httpsUrl, { method: "HEAD" });
    return {
      valid: res.ok || res.status < 500,
      issuer: null, // Would need TLS inspection
      expiresAt: null,
      daysRemaining: null,
    };
  } catch {
    return { valid: false, issuer: null, expiresAt: null, daysRemaining: null };
  }
}

function calculateHealthScore(result: Partial<SeoHealthResult>): number {
  let score = 0;
  const weights = {
    robots_txt_exists: 15,
    robots_txt_valid: 10,
    robots_txt_allows_crawl: 10,
    sitemap_exists: 20,
    sitemap_valid: 15,
    ssl_valid: 30,
  };

  if (result.robots_txt_exists) score += weights.robots_txt_exists;
  if (result.robots_txt_valid) score += weights.robots_txt_valid;
  if (result.robots_txt_allows_crawl) score += weights.robots_txt_allows_crawl;
  if (result.sitemap_exists) score += weights.sitemap_exists;
  if (result.sitemap_valid) score += weights.sitemap_valid;
  if (result.ssl_valid) score += weights.ssl_valid;

  return Math.min(100, score);
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

    // Ensure URL has protocol
    const baseUrl = url.startsWith("http") ? url : `https://${url}`;
    const checkedAt = new Date().toISOString();

    // Run all checks in parallel
    const [robotsResult, sitemapResult, sslResult] = await Promise.all([
      checkRobotsTxt(baseUrl),
      checkSitemap(baseUrl),
      checkSsl(baseUrl),
    ]);

    const result: SeoHealthResult = {
      robots_txt_exists: robotsResult.exists,
      robots_txt_valid: robotsResult.valid,
      robots_txt_allows_crawl: robotsResult.allowsCrawl,
      robots_txt_content: robotsResult.content,
      sitemap_exists: sitemapResult.exists,
      sitemap_valid: sitemapResult.valid,
      sitemap_url_count: sitemapResult.urlCount,
      sitemap_url: sitemapResult.url,
      ssl_valid: sslResult.valid,
      ssl_issuer: sslResult.issuer,
      ssl_expires_at: sslResult.expiresAt,
      ssl_days_remaining: sslResult.daysRemaining,
      health_score: 0,
      checked_at: checkedAt,
    };

    result.health_score = calculateHealthScore(result);

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

      // Insert SEO health check record
      await supabase.from("seo_health_checks").insert({
        website_id,
        ...result,
      });
    }

    return corsResponse(req, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
