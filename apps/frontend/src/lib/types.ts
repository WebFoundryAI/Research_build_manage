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

// Portfolio Management Types (from web-asset-tracker)

export type ProjectType =
  | 'Local Lead Gen'
  | 'Affiliate / Content'
  | 'SaaS / App'
  | 'E-commerce'
  | 'Internal Tool';

export type BuildPlatform =
  | 'Lovable.dev'
  | '10Web'
  | 'WordPress'
  | 'Webflow'
  | 'Custom / Other';

export type ProjectStatus =
  | 'Idea / Backlog'
  | 'Planning'
  | 'In Build'
  | 'Pre-Launch QA'
  | 'Live – Needs Improving'
  | 'Live – Stable'
  | 'On Hold'
  | 'Archived';

export type Priority = 'Low' | 'Medium' | 'High';

export type TrafficSource =
  | 'Organic'
  | 'Paid'
  | 'Direct'
  | 'Referral'
  | 'Mixed / Unknown';

export type MonetisationType =
  | 'Local leads'
  | 'AdSense'
  | 'Amazon'
  | 'Other affiliate'
  | 'SaaS subscriptions'
  | 'E-commerce'
  | 'Other';

export type TaskStatus = 'To Do' | 'In Progress' | 'Done' | 'Blocked';

export type TaskCategory = 'Content' | 'SEO' | 'Tech' | 'Design' | 'Operations' | 'Other';

export interface WebsiteProject {
  id: string;
  user_id: string;
  project_name: string;
  primary_domain: string;
  project_type: ProjectType;
  build_platform: BuildPlatform[];
  status: ProjectStatus;
  priority: Priority;
  owner: string | null;
  niche: string | null;
  notes: string | null;
  launch_date: string | null;
  current_month_visitors: number;
  current_month_leads: number;
  current_month_revenue: number;
  main_traffic_source: TrafficSource;
  monetisation_type: MonetisationType[];
  last_seo_review_at: string | null;
  is_favourite: boolean;
  is_featured: boolean;
  estimated_monthly_profit: number;
  valuation_multiple: number;
  estimated_asset_value: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  project_tasks?: ProjectTask[];
  project_health_snapshots?: ProjectHealthSnapshot[];
  monthly_kpis?: MonthlyKpi[];
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: TaskCategory;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  website_projects?: { id: string; project_name: string };
}

export interface MonthlyKpi {
  id: string;
  project_id: string;
  year: number;
  month: number;
  visitors: number;
  leads: number;
  revenue: number;
  main_traffic_source_snapshot: TrafficSource | null;
  notes: string | null;
  created_at: string;
}

export interface ProjectHealthSnapshot {
  id: string;
  project_id: string;
  snapshot_date: string;
  lighthouse_performance: number | null;
  lighthouse_seo: number | null;
  lighthouse_accessibility: number | null;
  lighthouse_best_practices: number | null;
  page_count: number | null;
  average_load_time_ms: number | null;
  critical_issues_count: number;
  warnings_count: number;
  raw_summary_json: unknown;
  created_at: string;
}

export interface PortfolioStats {
  totalProjects: number;
  activeProjects: number;
  totalMonthlyVisitors: number;
  totalMonthlyLeads: number;
  totalMonthlyRevenue: number;
  totalEstimatedValue: number;
  openTasks: number;
}

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'Local Lead Gen', label: 'Local Lead Gen' },
  { value: 'Affiliate / Content', label: 'Affiliate / Content' },
  { value: 'SaaS / App', label: 'SaaS / App' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'Internal Tool', label: 'Internal Tool' },
];

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'Idea / Backlog', label: 'Idea / Backlog' },
  { value: 'Planning', label: 'Planning' },
  { value: 'In Build', label: 'In Build' },
  { value: 'Pre-Launch QA', label: 'Pre-Launch QA' },
  { value: 'Live – Needs Improving', label: 'Live – Needs Improving' },
  { value: 'Live – Stable', label: 'Live – Stable' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Archived', label: 'Archived' },
];

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
  { value: 'Blocked', label: 'Blocked' },
];

export const TASK_CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'Content', label: 'Content' },
  { value: 'SEO', label: 'SEO' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Design', label: 'Design' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Other', label: 'Other' },
];
