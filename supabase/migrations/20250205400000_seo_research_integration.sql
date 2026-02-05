-- SEO Research Integration (from seo-mcp-spark)
-- Adds keyword research, SERP analysis, domain analytics, and DataForSEO integration

-- ============================================================================
-- API USAGE TRACKING
-- Track DataForSEO and other API usage for billing/credits
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- API details
  endpoint TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'dataforseo', -- dataforseo, openai, etc.
  method TEXT NOT NULL DEFAULT 'POST',

  -- Request/Response
  request_payload JSONB,
  response_status INTEGER,
  response_time_ms INTEGER,

  -- Credits/Cost tracking
  credits_used NUMERIC(10,4) DEFAULT 0,
  api_cost_usd NUMERIC(10,4) DEFAULT 0,

  -- Metadata
  task_id TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- USER CREDITS
-- Track user credit balance for API usage
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Credit balance
  total_credits NUMERIC(12,2) NOT NULL DEFAULT 0,
  used_credits NUMERIC(12,2) NOT NULL DEFAULT 0,
  remaining_credits NUMERIC(12,2) GENERATED ALWAYS AS (total_credits - used_credits) STORED,

  -- Plan info
  plan_type TEXT NOT NULL DEFAULT 'free', -- free, pro, enterprise
  monthly_limit NUMERIC(12,2) DEFAULT 100,

  -- Reset tracking
  credits_reset_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SEARCH HISTORY
-- Store keyword research sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS seo_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Search parameters
  search_name TEXT NOT NULL DEFAULT 'Unnamed Search',
  seed_keyword TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United Kingdom',
  country_code INTEGER NOT NULL DEFAULT 2826,
  language TEXT NOT NULL DEFAULT 'English',
  language_code TEXT NOT NULL DEFAULT 'en',

  -- Options
  fetch_keywords BOOLEAN NOT NULL DEFAULT true,
  fetch_serp BOOLEAN NOT NULL DEFAULT false,
  fetch_related BOOLEAN NOT NULL DEFAULT false,

  -- Results
  keyword_results JSONB DEFAULT '[]'::jsonb,
  serp_results JSONB DEFAULT '[]'::jsonb,
  related_keywords JSONB DEFAULT '[]'::jsonb,

  -- Stats
  keyword_count INTEGER DEFAULT 0,
  serp_count INTEGER DEFAULT 0,
  total_search_volume BIGINT DEFAULT 0,
  avg_difficulty NUMERIC(5,2),

  -- Organization
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- KEYWORD RESEARCH RESULTS
-- Detailed keyword data from DataForSEO
-- ============================================================================

CREATE TABLE IF NOT EXISTS keyword_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_id UUID REFERENCES seo_search_history(id) ON DELETE CASCADE,

  -- Keyword data
  keyword TEXT NOT NULL,
  keyword_normalized TEXT GENERATED ALWAYS AS (lower(trim(keyword))) STORED,

  -- Metrics
  search_volume INTEGER DEFAULT 0,
  cpc NUMERIC(10,2) DEFAULT 0,
  competition NUMERIC(5,4) DEFAULT 0, -- 0-1 scale
  competition_level TEXT, -- LOW, MEDIUM, HIGH
  keyword_difficulty INTEGER, -- 0-100

  -- SERP features
  serp_features JSONB DEFAULT '[]'::jsonb,

  -- Trends (monthly data)
  monthly_searches JSONB DEFAULT '[]'::jsonb,

  -- Location context
  country_code INTEGER,
  language_code TEXT,

  -- Categorization
  category TEXT,
  intent TEXT, -- informational, navigational, commercial, transactional

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- DOMAIN AUDITS
-- SEO audit results for domains
-- ============================================================================

CREATE TABLE IF NOT EXISTS domain_seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Domain info
  domain TEXT NOT NULL,
  domain_normalized TEXT GENERATED ALWAYS AS (lower(regexp_replace(domain, '^(https?://)?(www\.)?', ''))) STORED,

  -- Audit settings
  audit_depth INTEGER DEFAULT 100, -- pages to crawl
  audit_level TEXT DEFAULT 'standard', -- quick, standard, deep

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, crawling, analyzing, completed, failed
  task_id TEXT, -- DataForSEO task ID
  progress INTEGER DEFAULT 0, -- 0-100

  -- Domain metrics
  domain_rank INTEGER,
  organic_traffic INTEGER,
  organic_keywords INTEGER,
  backlinks_count INTEGER,
  referring_domains INTEGER,

  -- Crawl results
  pages_crawled INTEGER DEFAULT 0,
  pages_with_issues INTEGER DEFAULT 0,

  -- Issue counts
  critical_issues INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  notices INTEGER DEFAULT 0,

  -- Detailed results
  onpage_results JSONB,
  competitive_results JSONB,
  ranked_keywords JSONB,
  competitors JSONB,

  -- Errors
  error_message TEXT,
  failed_endpoints TEXT[],

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SERP TRACKING
-- Track keyword rankings over time
-- ============================================================================

CREATE TABLE IF NOT EXISTS serp_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tracking config
  keyword TEXT NOT NULL,
  domain TEXT NOT NULL,
  country_code INTEGER NOT NULL DEFAULT 2826,
  language_code TEXT NOT NULL DEFAULT 'en',

  -- Current ranking
  current_position INTEGER,
  previous_position INTEGER,
  position_change INTEGER GENERATED ALWAYS AS (
    CASE WHEN previous_position IS NOT NULL AND current_position IS NOT NULL
    THEN previous_position - current_position
    ELSE NULL END
  ) STORED,

  -- SERP details
  serp_url TEXT,
  serp_title TEXT,
  serp_description TEXT,
  featured_snippet BOOLEAN DEFAULT FALSE,

  -- Historical data
  position_history JSONB DEFAULT '[]'::jsonb,

  -- Tracking settings
  check_frequency TEXT DEFAULT 'weekly', -- daily, weekly, monthly
  is_active BOOLEAN DEFAULT TRUE,

  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- COMPETITOR DOMAINS
-- Track competitor domains for comparison
-- ============================================================================

CREATE TABLE IF NOT EXISTS seo_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES website_projects(id) ON DELETE CASCADE,

  -- Competitor info
  domain TEXT NOT NULL,
  name TEXT,
  notes TEXT,

  -- Metrics
  domain_rank INTEGER,
  organic_traffic INTEGER,
  organic_keywords INTEGER,
  backlinks_count INTEGER,

  -- Overlap analysis
  keyword_overlap INTEGER,
  common_keywords JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_analyzed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, domain)
);

-- ============================================================================
-- DATAFORSEO METADATA
-- Cache country/language codes from DataForSEO
-- ============================================================================

CREATE TABLE IF NOT EXISTS dataforseo_locations (
  id SERIAL PRIMARY KEY,
  location_code INTEGER NOT NULL UNIQUE,
  location_name TEXT NOT NULL,
  location_type TEXT, -- Country, State, City, etc.
  country_iso_code TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataforseo_languages (
  id SERIAL PRIMARY KEY,
  language_code TEXT NOT NULL UNIQUE,
  language_name TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert common locations
INSERT INTO dataforseo_locations (location_code, location_name, location_type, country_iso_code) VALUES
  (2826, 'United Kingdom', 'Country', 'GB'),
  (2840, 'United States', 'Country', 'US'),
  (2036, 'Australia', 'Country', 'AU'),
  (2124, 'Canada', 'Country', 'CA'),
  (2276, 'Germany', 'Country', 'DE'),
  (2250, 'France', 'Country', 'FR'),
  (2724, 'Spain', 'Country', 'ES'),
  (2380, 'Italy', 'Country', 'IT'),
  (2528, 'Netherlands', 'Country', 'NL'),
  (2056, 'Belgium', 'Country', 'BE'),
  (2372, 'Ireland', 'Country', 'IE'),
  (2554, 'New Zealand', 'Country', 'NZ')
ON CONFLICT (location_code) DO NOTHING;

-- Insert common languages
INSERT INTO dataforseo_languages (language_code, language_name) VALUES
  ('en', 'English'),
  ('de', 'German'),
  ('fr', 'French'),
  ('es', 'Spanish'),
  ('it', 'Italian'),
  ('nl', 'Dutch'),
  ('pt', 'Portuguese'),
  ('pl', 'Polish'),
  ('ru', 'Russian'),
  ('ja', 'Japanese'),
  ('zh', 'Chinese')
ON CONFLICT (language_code) DO NOTHING;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage_logs(provider);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON seo_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON seo_search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_keyword ON seo_search_history(seed_keyword);

CREATE INDEX IF NOT EXISTS idx_keyword_research_user ON keyword_research(user_id);
CREATE INDEX IF NOT EXISTS idx_keyword_research_search ON keyword_research(search_id);
CREATE INDEX IF NOT EXISTS idx_keyword_research_keyword ON keyword_research(keyword_normalized);
CREATE INDEX IF NOT EXISTS idx_keyword_research_volume ON keyword_research(search_volume DESC);

CREATE INDEX IF NOT EXISTS idx_domain_audits_user ON domain_seo_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_audits_domain ON domain_seo_audits(domain_normalized);
CREATE INDEX IF NOT EXISTS idx_domain_audits_status ON domain_seo_audits(status);

CREATE INDEX IF NOT EXISTS idx_serp_tracking_user ON serp_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_serp_tracking_keyword ON serp_tracking(keyword);
CREATE INDEX IF NOT EXISTS idx_serp_tracking_domain ON serp_tracking(domain);

CREATE INDEX IF NOT EXISTS idx_seo_competitors_user ON seo_competitors(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_competitors_project ON seo_competitors(project_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_seo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE serp_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_competitors ENABLE ROW LEVEL SECURITY;

-- API Usage policies
CREATE POLICY "Users can view own API usage"
  ON api_usage_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API usage"
  ON api_usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Credits policies
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON user_credits FOR UPDATE USING (auth.uid() = user_id);

-- Search History policies
CREATE POLICY "Users can manage own search history"
  ON seo_search_history FOR ALL USING (auth.uid() = user_id);

-- Keyword Research policies
CREATE POLICY "Users can manage own keyword research"
  ON keyword_research FOR ALL USING (auth.uid() = user_id);

-- Domain Audits policies
CREATE POLICY "Users can manage own domain audits"
  ON domain_seo_audits FOR ALL USING (auth.uid() = user_id);

-- SERP Tracking policies
CREATE POLICY "Users can manage own SERP tracking"
  ON serp_tracking FOR ALL USING (auth.uid() = user_id);

-- Competitors policies
CREATE POLICY "Users can manage own competitors"
  ON seo_competitors FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to deduct credits after API call
CREATE OR REPLACE FUNCTION deduct_user_credits(
  p_user_id UUID,
  p_amount NUMERIC
)
RETURNS BOOLEAN AS $$
DECLARE
  current_remaining NUMERIC;
BEGIN
  -- Get current remaining credits
  SELECT remaining_credits INTO current_remaining
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Check if user has enough credits
  IF current_remaining IS NULL OR current_remaining < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE user_credits
  SET used_credits = used_credits + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize user credits
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, total_credits, plan_type)
  VALUES (NEW.id, 50, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create credits on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_credits();

-- Function to update search stats
CREATE OR REPLACE FUNCTION update_search_stats()
RETURNS TRIGGER AS $$
BEGIN
  NEW.keyword_count := jsonb_array_length(COALESCE(NEW.keyword_results, '[]'::jsonb));
  NEW.serp_count := jsonb_array_length(COALESCE(NEW.serp_results, '[]'::jsonb));
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_stats
  BEFORE UPDATE ON seo_search_history
  FOR EACH ROW EXECUTE FUNCTION update_search_stats();
