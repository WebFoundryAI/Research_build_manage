-- Migration: Website Monitoring Integration
-- Integrates comprehensive website monitoring features from Daily-website-acesset-checking
-- Includes: status checks, SEO health, keywords, GSC integration, content tracking

-- Extend existing websites table with additional fields
ALTER TABLE websites
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS check_frequency TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Status checks table - stores availability check history
CREATE TABLE IF NOT EXISTS status_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  is_live BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- Content hashes table - tracks content changes
CREATE TABLE IF NOT EXISTS content_hashes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  content_length INTEGER,
  has_changed BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- Keywords table - stores target keywords for each website
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  location TEXT DEFAULT 'United Kingdom',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(website_id, keyword)
);

-- SEO health checks table - comprehensive SEO validation
CREATE TABLE IF NOT EXISTS seo_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  -- Robots.txt validation
  robots_txt_exists BOOLEAN DEFAULT false,
  robots_txt_valid BOOLEAN DEFAULT false,
  robots_txt_allows_crawl BOOLEAN DEFAULT false,
  robots_txt_content TEXT,
  -- Sitemap validation
  sitemap_exists BOOLEAN DEFAULT false,
  sitemap_valid BOOLEAN DEFAULT false,
  sitemap_url_count INTEGER DEFAULT 0,
  sitemap_url TEXT,
  -- SSL certificate
  ssl_valid BOOLEAN DEFAULT false,
  ssl_issuer TEXT,
  ssl_expires_at TIMESTAMPTZ,
  ssl_days_remaining INTEGER,
  -- Indexation check
  is_indexed BOOLEAN DEFAULT false,
  indexed_pages_estimate INTEGER DEFAULT 0,
  -- Overall health score (0-100)
  health_score INTEGER DEFAULT 0,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- GSC authentication table - stores OAuth tokens per user
CREATE TABLE IF NOT EXISTS gsc_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scope TEXT,
  connected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- GSC performance data - stores ranking/performance from Google Search Console
CREATE TABLE IF NOT EXISTS gsc_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  page TEXT,
  country TEXT DEFAULT 'gbr',
  device TEXT DEFAULT 'DESKTOP',
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  position REAL DEFAULT 0,
  date DATE NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- GSC coverage/indexation data
CREATE TABLE IF NOT EXISTS gsc_coverage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  indexed_pages INTEGER DEFAULT 0,
  excluded_pages INTEGER DEFAULT 0,
  error_pages INTEGER DEFAULT 0,
  warning_pages INTEGER DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- Rank tracking table - historical ranking data (for DataForSEO integration)
CREATE TABLE IF NOT EXISTS rank_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  keyword TEXT,
  rank_position INTEGER,
  search_engine TEXT DEFAULT 'google',
  location TEXT DEFAULT 'United Kingdom',
  tracked_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_status_checks_website ON status_checks(website_id);
CREATE INDEX IF NOT EXISTS idx_status_checks_date ON status_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_content_hashes_website ON content_hashes(website_id);
CREATE INDEX IF NOT EXISTS idx_keywords_website ON keywords(website_id);
CREATE INDEX IF NOT EXISTS idx_seo_health_website ON seo_health_checks(website_id);
CREATE INDEX IF NOT EXISTS idx_seo_health_date ON seo_health_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_gsc_auth_user ON gsc_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_gsc_performance_website ON gsc_performance(website_id);
CREATE INDEX IF NOT EXISTS idx_gsc_performance_date ON gsc_performance(date);
CREATE INDEX IF NOT EXISTS idx_gsc_coverage_website ON gsc_coverage(website_id);
CREATE INDEX IF NOT EXISTS idx_rank_tracking_website ON rank_tracking(website_id);
CREATE INDEX IF NOT EXISTS idx_rank_tracking_date ON rank_tracking(tracked_at);

-- Enable RLS on all new tables
ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access data for their own websites

-- Status checks policies
CREATE POLICY "Users can view their status checks"
  ON status_checks FOR SELECT
  USING (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert status checks for their websites"
  ON status_checks FOR INSERT
  WITH CHECK (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

-- Content hashes policies
CREATE POLICY "Users can view their content hashes"
  ON content_hashes FOR SELECT
  USING (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert content hashes for their websites"
  ON content_hashes FOR INSERT
  WITH CHECK (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

-- Keywords policies
CREATE POLICY "Users can manage their keywords"
  ON keywords FOR ALL
  USING (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()))
  WITH CHECK (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

-- SEO health checks policies
CREATE POLICY "Users can view their SEO health checks"
  ON seo_health_checks FOR SELECT
  USING (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert SEO health checks for their websites"
  ON seo_health_checks FOR INSERT
  WITH CHECK (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

-- GSC auth policies
CREATE POLICY "Users can manage their GSC auth"
  ON gsc_auth FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- GSC performance policies
CREATE POLICY "Users can view their GSC performance"
  ON gsc_performance FOR SELECT
  USING (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert GSC performance for their websites"
  ON gsc_performance FOR INSERT
  WITH CHECK (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

-- GSC coverage policies
CREATE POLICY "Users can view their GSC coverage"
  ON gsc_coverage FOR SELECT
  USING (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert GSC coverage for their websites"
  ON gsc_coverage FOR INSERT
  WITH CHECK (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

-- Rank tracking policies
CREATE POLICY "Users can view their rank tracking"
  ON rank_tracking FOR SELECT
  USING (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert rank tracking for their websites"
  ON rank_tracking FOR INSERT
  WITH CHECK (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid()));

-- Also ensure websites table has RLS enabled
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

-- Websites policies (if not already created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'websites' AND policyname = 'Users can manage their websites'
  ) THEN
    CREATE POLICY "Users can manage their websites"
      ON websites FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
