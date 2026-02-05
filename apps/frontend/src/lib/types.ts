// Shared types for the monitoring platform

export interface Website {
  id: string;
  user_id: string;
  name: string;
  url: string;
  category: string;
  check_frequency: string;
  is_active: boolean;
  status: number | null;
  response_time_ms: number | null;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  status_checks?: StatusCheck[];
  seo_health_checks?: SeoHealthCheck[];
  keywords?: Keyword[];
}

export interface StatusCheck {
  id: string;
  website_id: string;
  is_live: boolean;
  response_time_ms: number | null;
  status_code: number | null;
  error_message: string | null;
  checked_at: string;
}

export interface SeoHealthCheck {
  id: string;
  website_id: string;
  robots_txt_exists: boolean;
  robots_txt_valid: boolean;
  robots_txt_allows_crawl: boolean;
  robots_txt_content: string | null;
  sitemap_exists: boolean;
  sitemap_valid: boolean;
  sitemap_url_count: number;
  sitemap_url: string | null;
  ssl_valid: boolean;
  ssl_issuer: string | null;
  ssl_expires_at: string | null;
  ssl_days_remaining: number | null;
  is_indexed: boolean;
  indexed_pages_estimate: number;
  health_score: number;
  checked_at: string;
}

export interface Keyword {
  id: string;
  website_id: string;
  keyword: string;
  location: string;
  is_active: boolean;
  created_at: string;
}

export interface GscPerformance {
  id: string;
  website_id: string;
  query: string;
  page: string | null;
  country: string;
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
  fetched_at: string;
}

export interface WebsitesSummary {
  total: number;
  live: number;
  down: number;
  avgSeoScore: number;
}

export type SiteCategory = 'general' | 'plumber' | 'business' | 'ecommerce' | 'blog' | 'portfolio';

export const SITE_CATEGORIES: { value: SiteCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'business', label: 'Business' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'blog', label: 'Blog' },
  { value: 'portfolio', label: 'Portfolio' },
];
