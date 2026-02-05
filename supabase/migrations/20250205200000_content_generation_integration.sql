-- Migration: Content Generation Integration (nexus_opencopy)
-- Integrates AI content generation features from nexus_opencopy repository
-- Includes: content projects, articles, prompts, scheduled content, AI providers

-- Content generation projects (separate from website_projects for content-specific settings)
CREATE TABLE IF NOT EXISTS content_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  target_audience TEXT,
  brand_voice TEXT,
  competitors TEXT[],
  -- Content settings
  default_word_count INTEGER DEFAULT 1500,
  default_tone TEXT DEFAULT 'professional',
  default_language TEXT DEFAULT 'en',
  -- SEO settings
  enable_seo_optimization BOOLEAN DEFAULT true,
  target_seo_score INTEGER DEFAULT 80,
  -- Publishing settings
  auto_publish BOOLEAN DEFAULT false,
  publish_webhook_url TEXT,
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI provider configurations per user
CREATE TABLE IF NOT EXISTS ai_provider_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- openai, anthropic, groq, ollama
  model TEXT NOT NULL, -- gpt-4, claude-3-opus, etc
  is_default BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  -- Capabilities
  supports_text BOOLEAN DEFAULT true,
  supports_images BOOLEAN DEFAULT false,
  max_tokens INTEGER DEFAULT 4096,
  -- The API key is stored in user_secrets table
  api_key_secret_name TEXT, -- reference to user_secrets key
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider, model)
);

-- Prompt templates
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for system templates
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general', -- article, social, email, seo, etc
  prompt_text TEXT NOT NULL,
  variables TEXT[], -- placeholders like {{keyword}}, {{tone}}
  is_system BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generated articles/content
CREATE TABLE IF NOT EXISTS generated_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES content_projects(id) ON DELETE SET NULL,
  -- Content
  title TEXT NOT NULL,
  slug TEXT,
  meta_description TEXT,
  excerpt TEXT,
  content TEXT,
  content_markdown TEXT,
  outline JSONB,
  -- Metadata
  keyword TEXT,
  word_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 0,
  -- SEO
  seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
  seo_analysis JSONB,
  -- Generation info
  ai_provider TEXT,
  ai_model TEXT,
  prompt_template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
  generation_params JSONB, -- tone, style, etc
  -- Workflow
  status TEXT NOT NULL DEFAULT 'draft', -- draft, review, approved, scheduled, published
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  publish_url TEXT,
  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content calendar / scheduled content
CREATE TABLE IF NOT EXISTS scheduled_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES content_projects(id) ON DELETE CASCADE,
  article_id UUID REFERENCES generated_articles(id) ON DELETE CASCADE,
  -- Schedule info
  title TEXT NOT NULL,
  content_type TEXT DEFAULT 'article', -- article, social_post, email
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled', -- backlog, scheduled, generating, review, published
  previous_status TEXT,
  -- Generation settings (if not yet generated)
  keyword TEXT,
  prompt_template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
  generation_params JSONB,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content generation usage/logs
CREATE TABLE IF NOT EXISTS content_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES generated_articles(id) ON DELETE SET NULL,
  -- Usage info
  action TEXT NOT NULL, -- generate, regenerate, improve, summarize
  ai_provider TEXT,
  ai_model TEXT,
  tokens_used INTEGER DEFAULT 0,
  estimated_cost NUMERIC(10,6) DEFAULT 0,
  -- Timing
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_projects_user ON content_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_provider_configs_user ON ai_provider_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_user ON prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_generated_articles_user ON generated_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_articles_project ON generated_articles(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_articles_status ON generated_articles(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_user ON scheduled_content(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_date ON scheduled_content(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_status ON scheduled_content(status);
CREATE INDEX IF NOT EXISTS idx_content_usage_logs_user ON content_usage_logs(user_id);

-- Enable RLS
ALTER TABLE content_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their content projects"
  ON content_projects FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their AI provider configs"
  ON ai_provider_configs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view system and own prompt templates"
  ON prompt_templates FOR SELECT
  USING (is_system = true OR is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage their own prompt templates"
  ON prompt_templates FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can update their own prompt templates"
  ON prompt_templates FOR UPDATE
  USING (user_id = auth.uid() AND is_system = false)
  WITH CHECK (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can delete their own prompt templates"
  ON prompt_templates FOR DELETE
  USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can manage their generated articles"
  ON generated_articles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their scheduled content"
  ON scheduled_content FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their usage logs"
  ON content_usage_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their usage logs"
  ON content_usage_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Insert default system prompt templates
INSERT INTO prompt_templates (name, description, category, prompt_text, variables, is_system, is_public)
VALUES
  ('SEO Article', 'Generate an SEO-optimized blog article', 'article',
   'Write a comprehensive, SEO-optimized article about "{{keyword}}".

Target audience: {{audience}}
Tone: {{tone}}
Word count: approximately {{word_count}} words

Requirements:
- Include an engaging introduction
- Use headers (H2, H3) to structure the content
- Include the main keyword naturally throughout
- Add a compelling conclusion with a call to action
- Optimize for readability and user engagement',
   ARRAY['keyword', 'audience', 'tone', 'word_count'], true, true),

  ('Product Description', 'Generate compelling product descriptions', 'ecommerce',
   'Write a compelling product description for:

Product: {{product_name}}
Key features: {{features}}
Target audience: {{audience}}
Tone: {{tone}}

The description should:
- Highlight key benefits
- Address customer pain points
- Include a clear call to action
- Be optimized for conversions',
   ARRAY['product_name', 'features', 'audience', 'tone'], true, true),

  ('Social Media Post', 'Generate engaging social media content', 'social',
   'Create an engaging {{platform}} post about:

Topic: {{topic}}
Tone: {{tone}}
Goal: {{goal}}

Include:
- Attention-grabbing hook
- Key message
- Call to action
- Relevant hashtags (if appropriate)',
   ARRAY['platform', 'topic', 'tone', 'goal'], true, true),

  ('Meta Description', 'Generate SEO meta descriptions', 'seo',
   'Write an SEO-optimized meta description for a page about "{{topic}}".

Requirements:
- Maximum 155 characters
- Include the main keyword: {{keyword}}
- Compelling and click-worthy
- Include a subtle call to action',
   ARRAY['topic', 'keyword'], true, true),

  ('Content Outline', 'Generate article outlines', 'planning',
   'Create a detailed content outline for an article about "{{keyword}}".

Target audience: {{audience}}
Content goal: {{goal}}

Include:
- Compelling title options (3)
- Introduction angle
- Main sections with H2 headers
- Subsections with H3 headers
- Key points to cover in each section
- Conclusion approach
- Suggested word count per section',
   ARRAY['keyword', 'audience', 'goal'], true, true);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_content_projects_updated_at ON content_projects;
CREATE TRIGGER update_content_projects_updated_at
  BEFORE UPDATE ON content_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prompt_templates_updated_at ON prompt_templates;
CREATE TRIGGER update_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_generated_articles_updated_at ON generated_articles;
CREATE TRIGGER update_generated_articles_updated_at
  BEFORE UPDATE ON generated_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_content_updated_at ON scheduled_content;
CREATE TRIGGER update_scheduled_content_updated_at
  BEFORE UPDATE ON scheduled_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
