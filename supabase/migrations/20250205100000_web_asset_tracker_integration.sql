-- Migration: Web Asset Tracker Integration
-- Integrates portfolio management features from web-asset-tracker repository
-- Includes: projects, tasks, KPIs, health snapshots, competitor tracking, recommendations

-- Create website_projects table (portfolio of web assets)
CREATE TABLE IF NOT EXISTS website_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  primary_domain TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'Local Lead Gen',
  build_platform TEXT[] DEFAULT ARRAY['Custom / Other']::TEXT[],
  status TEXT NOT NULL DEFAULT 'Idea / Backlog',
  priority TEXT NOT NULL DEFAULT 'Medium',
  owner TEXT,
  niche TEXT,
  notes TEXT,
  launch_date DATE,
  current_month_visitors INTEGER DEFAULT 0,
  current_month_leads INTEGER DEFAULT 0,
  current_month_revenue NUMERIC(10,2) DEFAULT 0,
  main_traffic_source TEXT DEFAULT 'Mixed / Unknown',
  monetisation_type TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_seo_review_at TIMESTAMPTZ,
  is_favourite BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  estimated_monthly_profit NUMERIC(10,2) DEFAULT 0,
  valuation_multiple INTEGER DEFAULT 30,
  estimated_asset_value NUMERIC(12,2) DEFAULT 0,
  default_location_code INTEGER,
  default_language_code TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES website_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'To Do',
  category TEXT NOT NULL DEFAULT 'Other',
  due_date DATE,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create monthly_kpis table
CREATE TABLE IF NOT EXISTS monthly_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES website_projects(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  visitors INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  revenue NUMERIC(10,2) DEFAULT 0,
  main_traffic_source_snapshot TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, year, month)
);

-- Create project_health_snapshots table (Lighthouse scores and metrics)
CREATE TABLE IF NOT EXISTS project_health_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES website_projects(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  lighthouse_performance INTEGER CHECK (lighthouse_performance >= 0 AND lighthouse_performance <= 100),
  lighthouse_seo INTEGER CHECK (lighthouse_seo >= 0 AND lighthouse_seo <= 100),
  lighthouse_accessibility INTEGER CHECK (lighthouse_accessibility >= 0 AND lighthouse_accessibility <= 100),
  lighthouse_best_practices INTEGER CHECK (lighthouse_best_practices >= 0 AND lighthouse_best_practices <= 100),
  page_count INTEGER,
  average_load_time_ms INTEGER,
  critical_issues_count INTEGER DEFAULT 0,
  warnings_count INTEGER DEFAULT 0,
  raw_summary_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create competitor_domains table
CREATE TABLE IF NOT EXISTS competitor_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES website_projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  label TEXT,
  is_primary_competitor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, domain)
);

-- Create competitor_snapshots table
CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_domain_id UUID NOT NULL REFERENCES competitor_domains(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  estimated_traffic INTEGER,
  keywords_overlap_count INTEGER,
  visibility_score NUMERIC(10,4),
  ranking_keywords_count INTEGER,
  notes TEXT,
  raw_summary_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create project_recommendations table (AI/System suggestions)
CREATE TABLE IF NOT EXISTS project_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES website_projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'System',
  title TEXT NOT NULL,
  description TEXT,
  impact_level TEXT NOT NULL DEFAULT 'Medium',
  effort_level TEXT NOT NULL DEFAULT 'Medium',
  category TEXT NOT NULL DEFAULT 'Other',
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_website_projects_user ON website_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_website_projects_status ON website_projects(status);
CREATE INDEX IF NOT EXISTS idx_website_projects_deleted ON website_projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_monthly_kpis_project ON monthly_kpis(project_id);
CREATE INDEX IF NOT EXISTS idx_monthly_kpis_date ON monthly_kpis(year, month);
CREATE INDEX IF NOT EXISTS idx_project_health_project ON project_health_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_project_health_date ON project_health_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_competitor_domains_project ON competitor_domains(project_id);
CREATE INDEX IF NOT EXISTS idx_competitor_snapshots_domain ON competitor_snapshots(competitor_domain_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_project ON project_recommendations(project_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON project_recommendations(status);

-- Enable RLS on all tables
ALTER TABLE website_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for website_projects
CREATE POLICY "Users can manage their projects"
  ON website_projects FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for project_tasks (through project ownership)
CREATE POLICY "Users can manage tasks for their projects"
  ON project_tasks FOR ALL
  USING (project_id IN (SELECT id FROM website_projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM website_projects WHERE user_id = auth.uid()));

-- RLS Policies for monthly_kpis
CREATE POLICY "Users can manage KPIs for their projects"
  ON monthly_kpis FOR ALL
  USING (project_id IN (SELECT id FROM website_projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM website_projects WHERE user_id = auth.uid()));

-- RLS Policies for project_health_snapshots
CREATE POLICY "Users can manage health snapshots for their projects"
  ON project_health_snapshots FOR ALL
  USING (project_id IN (SELECT id FROM website_projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM website_projects WHERE user_id = auth.uid()));

-- RLS Policies for competitor_domains
CREATE POLICY "Users can manage competitors for their projects"
  ON competitor_domains FOR ALL
  USING (project_id IN (SELECT id FROM website_projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM website_projects WHERE user_id = auth.uid()));

-- RLS Policies for competitor_snapshots (through competitor ownership)
CREATE POLICY "Users can manage competitor snapshots"
  ON competitor_snapshots FOR ALL
  USING (competitor_domain_id IN (
    SELECT cd.id FROM competitor_domains cd
    JOIN website_projects wp ON cd.project_id = wp.id
    WHERE wp.user_id = auth.uid()
  ))
  WITH CHECK (competitor_domain_id IN (
    SELECT cd.id FROM competitor_domains cd
    JOIN website_projects wp ON cd.project_id = wp.id
    WHERE wp.user_id = auth.uid()
  ));

-- RLS Policies for project_recommendations
CREATE POLICY "Users can manage recommendations for their projects"
  ON project_recommendations FOR ALL
  USING (project_id IN (SELECT id FROM website_projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM website_projects WHERE user_id = auth.uid()));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_website_projects_updated_at ON website_projects;
CREATE TRIGGER update_website_projects_updated_at
  BEFORE UPDATE ON website_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
