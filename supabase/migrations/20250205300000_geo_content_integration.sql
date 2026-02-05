-- GEO Content Generation Integration (from Nico-Geo-Content-Maker)
-- Adds GEO audit capabilities, content generation, and schema.org markup tools

-- ============================================================================
-- GEO AUDIT RESULTS
-- Stores website audit results with scoring and issue tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS geo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE SET NULL,
  project_id UUID REFERENCES website_projects(id) ON DELETE SET NULL,

  -- Audit target
  site_url TEXT NOT NULL,
  audit_type TEXT NOT NULL DEFAULT 'full', -- full, quick, deep

  -- Overall scoring
  overall_score INTEGER NOT NULL DEFAULT 0, -- 0-100
  geo_readiness_score INTEGER, -- AI/GEO specific readiness
  schema_score INTEGER, -- Schema.org implementation score
  content_score INTEGER, -- Content quality score
  technical_score INTEGER, -- Technical SEO score

  -- Page counts
  pages_crawled INTEGER NOT NULL DEFAULT 0,
  pages_analyzed INTEGER NOT NULL DEFAULT 0,

  -- Issue counts by priority
  critical_issues INTEGER NOT NULL DEFAULT 0,
  high_issues INTEGER NOT NULL DEFAULT 0,
  medium_issues INTEGER NOT NULL DEFAULT 0,
  low_issues INTEGER NOT NULL DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_audit_score CHECK (overall_score >= 0 AND overall_score <= 100),
  CONSTRAINT valid_audit_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- ============================================================================
-- GEO AUDIT ISSUES
-- Individual issues found during audits
-- ============================================================================

CREATE TABLE IF NOT EXISTS geo_audit_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES geo_audits(id) ON DELETE CASCADE,

  -- Issue details
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL, -- critical, high, medium, low
  category TEXT NOT NULL, -- schema, content, technical, geo, accessibility

  -- Evidence and impact
  evidence TEXT, -- Actual content/code found
  page_url TEXT, -- Which page has the issue
  impact TEXT, -- Business impact description
  recommendation TEXT, -- How to fix

  -- Scoring
  score_impact INTEGER NOT NULL DEFAULT 0, -- Points deducted

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_issue_priority CHECK (priority IN ('critical', 'high', 'medium', 'low'))
);

-- ============================================================================
-- GEO PAGE SIGNALS
-- Extracted signals from crawled pages
-- ============================================================================

CREATE TABLE IF NOT EXISTS geo_page_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES geo_audits(id) ON DELETE CASCADE,

  -- Page info
  page_url TEXT NOT NULL,
  page_type TEXT, -- homepage, service, location, about, contact, other

  -- Basic SEO signals
  title TEXT,
  meta_description TEXT,
  h1_text TEXT,
  h2_count INTEGER DEFAULT 0,
  h3_count INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,

  -- Schema.org detection
  has_local_business_schema BOOLEAN DEFAULT FALSE,
  has_organization_schema BOOLEAN DEFAULT FALSE,
  has_service_schema BOOLEAN DEFAULT FALSE,
  has_faq_schema BOOLEAN DEFAULT FALSE,
  has_breadcrumb_schema BOOLEAN DEFAULT FALSE,
  schema_types JSONB DEFAULT '[]'::jsonb, -- List of detected schema types

  -- GEO signals
  has_geo_keywords BOOLEAN DEFAULT FALSE,
  geo_keywords_found JSONB DEFAULT '[]'::jsonb,
  has_service_keywords BOOLEAN DEFAULT FALSE,
  service_keywords_found JSONB DEFAULT '[]'::jsonb,
  has_location_mentions BOOLEAN DEFAULT FALSE,
  location_mentions JSONB DEFAULT '[]'::jsonb,

  -- Contact/NAP signals
  has_phone_number BOOLEAN DEFAULT FALSE,
  has_email BOOLEAN DEFAULT FALSE,
  has_address BOOLEAN DEFAULT FALSE,
  nap_consistent BOOLEAN,

  -- Content signals
  has_faq_content BOOLEAN DEFAULT FALSE,
  faq_count INTEGER DEFAULT 0,
  has_reviews BOOLEAN DEFAULT FALSE,
  has_testimonials BOOLEAN DEFAULT FALSE,

  -- Technical signals
  has_canonical BOOLEAN DEFAULT FALSE,
  has_robots_meta BOOLEAN DEFAULT FALSE,
  is_indexable BOOLEAN DEFAULT TRUE,
  internal_links_count INTEGER DEFAULT 0,
  external_links_count INTEGER DEFAULT 0,
  images_count INTEGER DEFAULT 0,
  images_with_alt INTEGER DEFAULT 0,

  -- Raw data
  raw_signals JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- GEO GENERATED CONTENT
-- AI-generated content for websites
-- ============================================================================

CREATE TABLE IF NOT EXISTS geo_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES website_projects(id) ON DELETE SET NULL,
  audit_id UUID REFERENCES geo_audits(id) ON DELETE SET NULL,

  -- Business input data
  business_name TEXT NOT NULL,
  primary_city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'UK',
  service_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  business_input_json JSONB, -- Full input data

  -- Content type
  content_type TEXT NOT NULL, -- full_package, titles, answer_capsule, service_desc, faqs, schema

  -- Generated outputs
  generated_json JSONB, -- Canonical JSON output
  generated_markdown TEXT, -- Markdown version
  generated_html TEXT, -- HTML fragments

  -- Specific content pieces
  meta_title TEXT,
  meta_description TEXT,
  answer_capsule TEXT, -- AI answer-ready snippet
  service_descriptions JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  schema_json_ld JSONB, -- JSON-LD structured data

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- draft, review, approved, deployed

  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  previous_version_id UUID REFERENCES geo_generated_content(id),

  -- Review workflow
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_content_status CHECK (status IN ('draft', 'review', 'approved', 'deployed'))
);

-- ============================================================================
-- GEO IMPROVEMENT SUGGESTIONS
-- AI-generated improvement suggestions for pages
-- ============================================================================

CREATE TABLE IF NOT EXISTS geo_improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES geo_audits(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,

  -- Suggestion details
  suggestion_type TEXT NOT NULL, -- title, description, h1, schema, faq, content
  current_content TEXT,
  suggested_content TEXT NOT NULL,

  -- Reasoning
  reason TEXT,
  expected_impact TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',

  -- Implementation status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, implemented
  implemented_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_suggestion_status CHECK (status IN ('pending', 'accepted', 'rejected', 'implemented'))
);

-- ============================================================================
-- GEO KEYWORDS LIBRARY
-- Common GEO and service keywords for detection
-- ============================================================================

CREATE TABLE IF NOT EXISTS geo_keywords_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  keyword_type TEXT NOT NULL, -- geo, service, intent, location
  category TEXT, -- plumber, electrician, hvac, general, etc.
  country TEXT DEFAULT 'UK',
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(keyword, keyword_type, category, country)
);

-- Insert default geo keywords
INSERT INTO geo_keywords_library (keyword, keyword_type, category, country, is_system) VALUES
  -- UK Cities
  ('london', 'geo', 'city', 'UK', true),
  ('manchester', 'geo', 'city', 'UK', true),
  ('birmingham', 'geo', 'city', 'UK', true),
  ('leeds', 'geo', 'city', 'UK', true),
  ('liverpool', 'geo', 'city', 'UK', true),
  ('bristol', 'geo', 'city', 'UK', true),
  ('sheffield', 'geo', 'city', 'UK', true),
  ('newcastle', 'geo', 'city', 'UK', true),
  ('nottingham', 'geo', 'city', 'UK', true),
  ('glasgow', 'geo', 'city', 'UK', true),
  ('edinburgh', 'geo', 'city', 'UK', true),
  ('cardiff', 'geo', 'city', 'UK', true),
  ('belfast', 'geo', 'city', 'UK', true),

  -- Location modifiers
  ('near me', 'geo', 'modifier', 'UK', true),
  ('in my area', 'geo', 'modifier', 'UK', true),
  ('local', 'geo', 'modifier', 'UK', true),
  ('nearby', 'geo', 'modifier', 'UK', true),
  ('service area', 'geo', 'modifier', 'UK', true),

  -- Service industries
  ('plumber', 'service', 'plumber', 'UK', true),
  ('plumbing', 'service', 'plumber', 'UK', true),
  ('emergency plumber', 'service', 'plumber', 'UK', true),
  ('boiler repair', 'service', 'plumber', 'UK', true),
  ('boiler installation', 'service', 'plumber', 'UK', true),
  ('heating engineer', 'service', 'plumber', 'UK', true),
  ('gas engineer', 'service', 'plumber', 'UK', true),
  ('electrician', 'service', 'electrician', 'UK', true),
  ('electrical', 'service', 'electrician', 'UK', true),
  ('hvac', 'service', 'hvac', 'UK', true),
  ('air conditioning', 'service', 'hvac', 'UK', true),

  -- Intent keywords
  ('free estimate', 'intent', 'commercial', 'UK', true),
  ('free quote', 'intent', 'commercial', 'UK', true),
  ('24/7', 'intent', 'availability', 'UK', true),
  ('emergency', 'intent', 'urgency', 'UK', true),
  ('same day', 'intent', 'urgency', 'UK', true),
  ('affordable', 'intent', 'price', 'UK', true),
  ('trusted', 'intent', 'trust', 'UK', true),
  ('certified', 'intent', 'trust', 'UK', true),
  ('licensed', 'intent', 'trust', 'UK', true)
ON CONFLICT (keyword, keyword_type, category, country) DO NOTHING;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_geo_audits_user ON geo_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_geo_audits_website ON geo_audits(website_id);
CREATE INDEX IF NOT EXISTS idx_geo_audits_project ON geo_audits(project_id);
CREATE INDEX IF NOT EXISTS idx_geo_audits_status ON geo_audits(status);
CREATE INDEX IF NOT EXISTS idx_geo_audits_created ON geo_audits(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_geo_audit_issues_audit ON geo_audit_issues(audit_id);
CREATE INDEX IF NOT EXISTS idx_geo_audit_issues_priority ON geo_audit_issues(priority);
CREATE INDEX IF NOT EXISTS idx_geo_audit_issues_category ON geo_audit_issues(category);

CREATE INDEX IF NOT EXISTS idx_geo_page_signals_audit ON geo_page_signals(audit_id);
CREATE INDEX IF NOT EXISTS idx_geo_page_signals_type ON geo_page_signals(page_type);

CREATE INDEX IF NOT EXISTS idx_geo_generated_content_user ON geo_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_geo_generated_content_project ON geo_generated_content(project_id);
CREATE INDEX IF NOT EXISTS idx_geo_generated_content_status ON geo_generated_content(status);

CREATE INDEX IF NOT EXISTS idx_geo_improvement_suggestions_audit ON geo_improvement_suggestions(audit_id);
CREATE INDEX IF NOT EXISTS idx_geo_improvement_suggestions_status ON geo_improvement_suggestions(status);

CREATE INDEX IF NOT EXISTS idx_geo_keywords_type ON geo_keywords_library(keyword_type);
CREATE INDEX IF NOT EXISTS idx_geo_keywords_category ON geo_keywords_library(category);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE geo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_audit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_page_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_keywords_library ENABLE ROW LEVEL SECURITY;

-- Geo Audits policies
CREATE POLICY "Users can view own audits"
  ON geo_audits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create audits"
  ON geo_audits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audits"
  ON geo_audits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own audits"
  ON geo_audits FOR DELETE
  USING (auth.uid() = user_id);

-- Audit Issues policies (access through audit ownership)
CREATE POLICY "Users can view issues for own audits"
  ON geo_audit_issues FOR SELECT
  USING (audit_id IN (SELECT id FROM geo_audits WHERE user_id = auth.uid()));

CREATE POLICY "Users can create issues for own audits"
  ON geo_audit_issues FOR INSERT
  WITH CHECK (audit_id IN (SELECT id FROM geo_audits WHERE user_id = auth.uid()));

-- Page Signals policies
CREATE POLICY "Users can view signals for own audits"
  ON geo_page_signals FOR SELECT
  USING (audit_id IN (SELECT id FROM geo_audits WHERE user_id = auth.uid()));

CREATE POLICY "Users can create signals for own audits"
  ON geo_page_signals FOR INSERT
  WITH CHECK (audit_id IN (SELECT id FROM geo_audits WHERE user_id = auth.uid()));

-- Generated Content policies
CREATE POLICY "Users can view own generated content"
  ON geo_generated_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create generated content"
  ON geo_generated_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated content"
  ON geo_generated_content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated content"
  ON geo_generated_content FOR DELETE
  USING (auth.uid() = user_id);

-- Improvement Suggestions policies
CREATE POLICY "Users can view suggestions for own audits"
  ON geo_improvement_suggestions FOR SELECT
  USING (audit_id IN (SELECT id FROM geo_audits WHERE user_id = auth.uid()));

CREATE POLICY "Users can update suggestions for own audits"
  ON geo_improvement_suggestions FOR UPDATE
  USING (audit_id IN (SELECT id FROM geo_audits WHERE user_id = auth.uid()));

-- Keywords Library policies
CREATE POLICY "Anyone can view system keywords"
  ON geo_keywords_library FOR SELECT
  USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can create custom keywords"
  ON geo_keywords_library FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own keywords"
  ON geo_keywords_library FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate audit score from issues
CREATE OR REPLACE FUNCTION calculate_audit_score(audit_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_deduction INTEGER := 0;
  final_score INTEGER;
BEGIN
  SELECT COALESCE(SUM(
    CASE priority
      WHEN 'critical' THEN 20
      WHEN 'high' THEN 12
      WHEN 'medium' THEN 6
      WHEN 'low' THEN 2
      ELSE 0
    END
  ), 0) INTO total_deduction
  FROM geo_audit_issues
  WHERE audit_id = audit_uuid;

  final_score := GREATEST(0, 100 - total_deduction);

  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update audit score after issues change
CREATE OR REPLACE FUNCTION update_audit_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE geo_audits
  SET
    overall_score = calculate_audit_score(COALESCE(NEW.audit_id, OLD.audit_id)),
    critical_issues = (SELECT COUNT(*) FROM geo_audit_issues WHERE audit_id = COALESCE(NEW.audit_id, OLD.audit_id) AND priority = 'critical'),
    high_issues = (SELECT COUNT(*) FROM geo_audit_issues WHERE audit_id = COALESCE(NEW.audit_id, OLD.audit_id) AND priority = 'high'),
    medium_issues = (SELECT COUNT(*) FROM geo_audit_issues WHERE audit_id = COALESCE(NEW.audit_id, OLD.audit_id) AND priority = 'medium'),
    low_issues = (SELECT COUNT(*) FROM geo_audit_issues WHERE audit_id = COALESCE(NEW.audit_id, OLD.audit_id) AND priority = 'low')
  WHERE id = COALESCE(NEW.audit_id, OLD.audit_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_audit_score
AFTER INSERT OR UPDATE OR DELETE ON geo_audit_issues
FOR EACH ROW EXECUTE FUNCTION update_audit_score();
