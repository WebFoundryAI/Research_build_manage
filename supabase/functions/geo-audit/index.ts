// Supabase Edge Function: GEO Website Audit
// Crawls websites and analyzes GEO/SEO signals

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
} from "../_shared/secrets.ts";

interface PageSignals {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  h2Count: number;
  h3Count: number;
  wordCount: number;
  hasLocalBusinessSchema: boolean;
  hasOrganizationSchema: boolean;
  hasServiceSchema: boolean;
  hasFaqSchema: boolean;
  hasBreadcrumbSchema: boolean;
  schemaTypes: string[];
  hasGeoKeywords: boolean;
  geoKeywordsFound: string[];
  hasServiceKeywords: boolean;
  serviceKeywordsFound: string[];
  hasPhone: boolean;
  hasEmail: boolean;
  hasAddress: boolean;
  hasFaqContent: boolean;
  faqCount: number;
  hasCanonical: boolean;
  isIndexable: boolean;
  internalLinksCount: number;
  externalLinksCount: number;
  imagesCount: number;
  imagesWithAlt: number;
  pageType: string;
}

interface AuditIssue {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  evidence: string | null;
  pageUrl: string | null;
  impact: string;
  recommendation: string;
}

// GEO keywords for detection
const GEO_KEYWORDS = [
  'near me', 'local', 'in my area', 'nearby', 'service area',
  'london', 'manchester', 'birmingham', 'leeds', 'liverpool',
  'bristol', 'sheffield', 'newcastle', 'nottingham', 'glasgow',
  'edinburgh', 'cardiff', 'belfast', 'dublin',
];

const SERVICE_KEYWORDS = [
  'plumber', 'plumbing', 'electrician', 'electrical', 'hvac',
  'boiler', 'heating', 'emergency', 'repair', 'installation',
  'maintenance', 'service', 'contractor', 'professional',
  'free quote', 'free estimate', '24/7', 'same day',
];

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GEOAuditBot/1.0; +https://webfoundry.ai)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function extractSignals(html: string, pageUrl: string): PageSignals {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);

  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;

  // Extract text content for word count
  const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = textContent.split(' ').filter(w => w.length > 0).length;

  // Schema detection
  const hasLocalBusinessSchema = /LocalBusiness|Plumber|Electrician|HVACBusiness/i.test(html);
  const hasOrganizationSchema = /"@type"\s*:\s*"Organization"/i.test(html);
  const hasServiceSchema = /"@type"\s*:\s*"Service"/i.test(html);
  const hasFaqSchema = /"@type"\s*:\s*"FAQPage"/i.test(html);
  const hasBreadcrumbSchema = /"@type"\s*:\s*"BreadcrumbList"/i.test(html);

  const schemaMatches = html.match(/"@type"\s*:\s*"([^"]+)"/gi) || [];
  const schemaTypes = [...new Set(schemaMatches.map(m => m.replace(/"@type"\s*:\s*"/i, '').replace(/"$/, '')))];

  // Keyword detection
  const lowerHtml = html.toLowerCase();
  const geoKeywordsFound = GEO_KEYWORDS.filter(kw => lowerHtml.includes(kw.toLowerCase()));
  const serviceKeywordsFound = SERVICE_KEYWORDS.filter(kw => lowerHtml.includes(kw.toLowerCase()));

  // Contact detection
  const hasPhone = /(\+44|0\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}|tel:|phone:)/i.test(html);
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(html);
  const hasAddress = /(street|road|avenue|lane|drive|way|court|place|close|gardens|terrace|crescent|grove|park|square|hill|green|view|rise|walk|mews|row)/i.test(html);

  // FAQ detection
  const faqMatches = html.match(/<(dt|details|summary|[^>]*class=["'][^"']*faq[^"']*["'])[^>]*>/gi) || [];
  const hasFaqContent = faqMatches.length > 0 || /frequently asked|faq/i.test(html);
  const faqCount = faqMatches.length;

  // Technical signals
  const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
  const isIndexable = !/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);

  // Links
  const internalLinks = (html.match(/<a[^>]*href=["'][^"']*["']/gi) || [])
    .filter(a => !a.includes('http') || a.includes(new URL(pageUrl).hostname));
  const externalLinks = (html.match(/<a[^>]*href=["']https?:\/\/[^"']*["']/gi) || [])
    .filter(a => !a.includes(new URL(pageUrl).hostname));

  // Images
  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = images.filter(img => /alt=["'][^"']+["']/i.test(img)).length;

  // Page type detection
  let pageType = 'other';
  const urlLower = pageUrl.toLowerCase();
  if (urlLower.endsWith('/') || urlLower.match(/\/(index|home)?\.?[a-z]*$/)) pageType = 'homepage';
  else if (/service|what-we-do|our-work/i.test(urlLower)) pageType = 'service';
  else if (/location|area|near|coverage/i.test(urlLower)) pageType = 'location';
  else if (/about|who-we-are|our-team/i.test(urlLower)) pageType = 'about';
  else if (/contact|get-in-touch/i.test(urlLower)) pageType = 'contact';
  else if (/blog|news|article/i.test(urlLower)) pageType = 'blog';

  return {
    url: pageUrl,
    title: titleMatch?.[1]?.trim() || null,
    metaDescription: metaDescMatch?.[1]?.trim() || null,
    h1: h1Match?.[1]?.trim() || null,
    h2Count,
    h3Count,
    wordCount,
    hasLocalBusinessSchema,
    hasOrganizationSchema,
    hasServiceSchema,
    hasFaqSchema,
    hasBreadcrumbSchema,
    schemaTypes,
    hasGeoKeywords: geoKeywordsFound.length > 0,
    geoKeywordsFound,
    hasServiceKeywords: serviceKeywordsFound.length > 0,
    serviceKeywordsFound,
    hasPhone,
    hasEmail,
    hasAddress,
    hasFaqContent,
    faqCount,
    hasCanonical,
    isIndexable,
    internalLinksCount: internalLinks.length,
    externalLinksCount: externalLinks.length,
    imagesCount: images.length,
    imagesWithAlt,
    pageType,
  };
}

function runAuditRules(homepage: PageSignals, allPages: PageSignals[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Critical issues
  if (!homepage.title) {
    issues.push({
      title: 'Missing page title',
      description: 'The homepage has no title tag',
      priority: 'critical',
      category: 'technical',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'Search engines cannot properly index or rank the page',
      recommendation: 'Add a descriptive title tag with target keywords',
    });
  }

  if (!homepage.h1) {
    issues.push({
      title: 'Missing H1 heading',
      description: 'The homepage has no H1 tag',
      priority: 'critical',
      category: 'content',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'Reduced semantic clarity for search engines and AI systems',
      recommendation: 'Add a clear H1 that describes the business and location',
    });
  }

  if (homepage.wordCount < 300) {
    issues.push({
      title: 'Thin content',
      description: `Homepage has only ${homepage.wordCount} words`,
      priority: 'critical',
      category: 'content',
      evidence: `Word count: ${homepage.wordCount}`,
      pageUrl: homepage.url,
      impact: 'Insufficient content for GEO ranking and AI answer generation',
      recommendation: 'Expand content to at least 500 words with service details',
    });
  }

  if (!homepage.hasLocalBusinessSchema && !homepage.hasOrganizationSchema) {
    issues.push({
      title: 'Missing structured data',
      description: 'No LocalBusiness or Organization schema found',
      priority: 'critical',
      category: 'schema',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'AI systems cannot reliably extract business information',
      recommendation: 'Add LocalBusiness schema with NAP, services, and service area',
    });
  }

  // High priority issues
  if (!homepage.metaDescription) {
    issues.push({
      title: 'Missing meta description',
      description: 'No meta description found',
      priority: 'high',
      category: 'technical',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'Poor click-through rates and missed GEO opportunity',
      recommendation: 'Add a compelling meta description under 160 characters',
    });
  }

  if (!homepage.hasGeoKeywords) {
    issues.push({
      title: 'No location keywords',
      description: 'No geographic keywords found on homepage',
      priority: 'high',
      category: 'geo',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'Reduced visibility for local and "near me" searches',
      recommendation: 'Include service area cities and "near me" variations',
    });
  }

  if (!homepage.hasPhone && !homepage.hasEmail) {
    issues.push({
      title: 'No contact information visible',
      description: 'No phone number or email found in HTML',
      priority: 'high',
      category: 'content',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'Users and AI systems cannot find contact details',
      recommendation: 'Display phone and email prominently in header/footer',
    });
  }

  if (!homepage.hasFaqSchema && !homepage.hasFaqContent) {
    issues.push({
      title: 'No FAQ content',
      description: 'No FAQ section or FAQ schema found',
      priority: 'high',
      category: 'geo',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'Missing opportunity for featured snippets and AI answers',
      recommendation: 'Add FAQ section with common customer questions',
    });
  }

  // Medium priority issues
  if (!homepage.hasServiceSchema) {
    issues.push({
      title: 'Missing Service schema',
      description: 'No Service structured data found',
      priority: 'medium',
      category: 'schema',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'Services not clearly defined for AI systems',
      recommendation: 'Add Service schema for each main service offered',
    });
  }

  if (!homepage.hasCanonical) {
    issues.push({
      title: 'Missing canonical tag',
      description: 'No canonical URL specified',
      priority: 'medium',
      category: 'technical',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'Potential duplicate content issues',
      recommendation: 'Add canonical tag pointing to the preferred URL',
    });
  }

  if (homepage.imagesCount > 0 && homepage.imagesWithAlt < homepage.imagesCount * 0.8) {
    issues.push({
      title: 'Images missing alt text',
      description: `${homepage.imagesCount - homepage.imagesWithAlt} of ${homepage.imagesCount} images lack alt text`,
      priority: 'medium',
      category: 'accessibility',
      evidence: `${Math.round(homepage.imagesWithAlt / homepage.imagesCount * 100)}% coverage`,
      pageUrl: homepage.url,
      impact: 'Reduced accessibility and image SEO',
      recommendation: 'Add descriptive alt text to all images',
    });
  }

  // Check all pages for issues
  for (const page of allPages) {
    if (!page.isIndexable && page.pageType !== 'other') {
      issues.push({
        title: 'Important page blocked from indexing',
        description: `${page.pageType} page has noindex`,
        priority: 'critical',
        category: 'technical',
        evidence: 'robots noindex meta tag found',
        pageUrl: page.url,
        impact: 'Page will not appear in search results',
        recommendation: 'Remove noindex if page should be indexed',
      });
    }
  }

  // Low priority issues
  if (homepage.h2Count === 0) {
    issues.push({
      title: 'No H2 subheadings',
      description: 'Homepage lacks H2 structure',
      priority: 'low',
      category: 'content',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'Reduced content structure clarity',
      recommendation: 'Add H2 headings to organize content sections',
    });
  }

  if (!homepage.hasBreadcrumbSchema && allPages.length > 1) {
    issues.push({
      title: 'Missing breadcrumb schema',
      description: 'No BreadcrumbList structured data',
      priority: 'low',
      category: 'schema',
      evidence: null,
      pageUrl: homepage.url,
      impact: 'No breadcrumb rich results in search',
      recommendation: 'Add breadcrumb schema for better navigation display',
    });
  }

  return issues;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    // GET - List user's audits
    if (req.method === "GET") {
      const url = new URL(req.url);
      const auditId = url.searchParams.get("id");

      if (auditId) {
        // Get single audit with details
        const { data: audit, error } = await supabase
          .from("geo_audits")
          .select(`
            *,
            geo_audit_issues (*),
            geo_page_signals (*)
          `)
          .eq("id", auditId)
          .eq("user_id", user.id)
          .single();

        if (error) return corsErrorResponse(req, error.message, 404);
        return corsResponse(req, audit);
      }

      // List all audits
      const { data: audits, error } = await supabase
        .from("geo_audits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) return corsErrorResponse(req, error.message, 500);
      return corsResponse(req, { audits });
    }

    // POST - Start new audit
    if (req.method === "POST") {
      const body = await req.json();
      const { site_url, website_id, project_id, audit_type = "full" } = body;

      if (!site_url) {
        return corsErrorResponse(req, "site_url is required", 400);
      }

      // Normalize URL
      let normalizedUrl = site_url.trim();
      if (!normalizedUrl.startsWith("http")) {
        normalizedUrl = "https://" + normalizedUrl;
      }

      // Create audit record
      const { data: audit, error: createError } = await supabase
        .from("geo_audits")
        .insert({
          user_id: user.id,
          site_url: normalizedUrl,
          website_id: website_id || null,
          project_id: project_id || null,
          audit_type,
          status: "running",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) return corsErrorResponse(req, createError.message, 500);

      // Fetch and analyze homepage
      const html = await fetchHtml(normalizedUrl);
      if (!html) {
        await supabase
          .from("geo_audits")
          .update({ status: "failed", error_message: "Could not fetch URL" })
          .eq("id", audit.id);
        return corsErrorResponse(req, "Could not fetch URL", 400);
      }

      const homepage = extractSignals(html, normalizedUrl);
      const allPages = [homepage];

      // For full audit, try to crawl a few more pages
      if (audit_type === "full") {
        const internalLinkMatches = html.match(/<a[^>]*href=["']([^"']*?)["']/gi) || [];
        const internalUrls = internalLinkMatches
          .map(a => {
            const match = a.match(/href=["']([^"']*?)["']/i);
            return match?.[1];
          })
          .filter((href): href is string => {
            if (!href) return false;
            if (href.startsWith("http") && !href.includes(new URL(normalizedUrl).hostname)) return false;
            if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
            return true;
          })
          .map(href => {
            if (href.startsWith("http")) return href;
            if (href.startsWith("/")) return new URL(normalizedUrl).origin + href;
            return new URL(href, normalizedUrl).href;
          })
          .filter((url, i, arr) => arr.indexOf(url) === i)
          .slice(0, 5);

        for (const pageUrl of internalUrls) {
          const pageHtml = await fetchHtml(pageUrl);
          if (pageHtml) {
            allPages.push(extractSignals(pageHtml, pageUrl));
          }
        }
      }

      // Run audit rules
      const issues = runAuditRules(homepage, allPages);

      // Save page signals
      for (const page of allPages) {
        await supabase.from("geo_page_signals").insert({
          audit_id: audit.id,
          page_url: page.url,
          page_type: page.pageType,
          title: page.title,
          meta_description: page.metaDescription,
          h1_text: page.h1,
          h2_count: page.h2Count,
          h3_count: page.h3Count,
          word_count: page.wordCount,
          has_local_business_schema: page.hasLocalBusinessSchema,
          has_organization_schema: page.hasOrganizationSchema,
          has_service_schema: page.hasServiceSchema,
          has_faq_schema: page.hasFaqSchema,
          has_breadcrumb_schema: page.hasBreadcrumbSchema,
          schema_types: page.schemaTypes,
          has_geo_keywords: page.hasGeoKeywords,
          geo_keywords_found: page.geoKeywordsFound,
          has_service_keywords: page.hasServiceKeywords,
          service_keywords_found: page.serviceKeywordsFound,
          has_phone_number: page.hasPhone,
          has_email: page.hasEmail,
          has_address: page.hasAddress,
          has_faq_content: page.hasFaqContent,
          faq_count: page.faqCount,
          has_canonical: page.hasCanonical,
          is_indexable: page.isIndexable,
          internal_links_count: page.internalLinksCount,
          external_links_count: page.externalLinksCount,
          images_count: page.imagesCount,
          images_with_alt: page.imagesWithAlt,
        });
      }

      // Save issues
      for (const issue of issues) {
        await supabase.from("geo_audit_issues").insert({
          audit_id: audit.id,
          title: issue.title,
          description: issue.description,
          priority: issue.priority,
          category: issue.category,
          evidence: issue.evidence,
          page_url: issue.pageUrl,
          impact: issue.impact,
          recommendation: issue.recommendation,
          score_impact: issue.priority === "critical" ? 20 :
                       issue.priority === "high" ? 12 :
                       issue.priority === "medium" ? 6 : 2,
        });
      }

      // Update audit with completion info
      const { data: finalAudit, error: updateError } = await supabase
        .from("geo_audits")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          pages_crawled: allPages.length,
          pages_analyzed: allPages.length,
        })
        .eq("id", audit.id)
        .select(`
          *,
          geo_audit_issues (*),
          geo_page_signals (*)
        `)
        .single();

      if (updateError) return corsErrorResponse(req, updateError.message, 500);

      return corsResponse(req, finalAudit, 201);
    }

    // DELETE - Delete an audit
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = body;

      if (!id) return corsErrorResponse(req, "Audit ID required", 400);

      const { error } = await supabase
        .from("geo_audits")
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
