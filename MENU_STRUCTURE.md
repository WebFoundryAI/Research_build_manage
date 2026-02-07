# Super SEO Tool - Complete Menu Structure Documentation

> **Project:** Research Build Manage (Super SEO Tool)
> **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase
> **Total Routes:** 72+ unique routes across 5 major modules
> **Total Page Files:** 86 TypeScript/TSX components

---

## Table of Contents

1. [Main Sidebar Navigation](#1-main-sidebar-navigation)
2. [MCP Spark Module](#2-mcp-spark-module---27-seo--scraping-tools)
3. [Daily Checks Module](#3-daily-checks-module---website-monitoring--seo)
4. [Asset Tracker Module](#4-asset-tracker-module---portfolio-management)
5. [Nico GEO Module](#5-nico-geo-module---geo-content-engine)
6. [Nexus OpenCopy Module](#6-nexus-opencopy-module---ai-content-studio)
7. [Top-Level Standalone Pages](#7-top-level-standalone-pages)
8. [Routing Hierarchy](#8-complete-routing-hierarchy)

---

## 1. Main Sidebar Navigation

**Source:** `apps/frontend/src/components/Layout.tsx`
**Design:** Fixed left sidebar with icon + label + description, collapsible on mobile

The main sidebar is divided into **3 sections**:

### OVERVIEW

| Menu Item | Route | Icon | Description |
|-----------|-------|------|-------------|
| Dashboard | `/dashboard` | BarChart3 | Analytics & insights |

### MODULES

| Menu Item | Route | Icon | Description | Color Theme |
|-----------|-------|------|-------------|-------------|
| MCP Spark | `/mcp-spark` | Zap | 27 SEO & scraping tools | Amber |
| Daily Checks | `/daily-checks` | CalendarCheck | Website monitoring & SEO | Emerald |
| Asset Tracker | `/asset-tracker` | Package | Portfolio management | Blue |
| Nico GEO | `/nico-geo` | Globe2 | GEO content engine | Teal |
| Nexus OpenCopy | `/nexus-opencopy` | FileEdit | AI content studio | Pink |

### SETTINGS

| Menu Item | Route | Icon | Description |
|-----------|-------|------|-------------|
| Admin | `/admin` | Shield | System configuration |
| Profile | `/profile` | User | Your account |
| Settings | `/settings` | Settings | Preferences |

---

## 2. MCP Spark Module - 27 SEO & Scraping Tools

**Source:** `apps/frontend/src/pages/mcp-spark/McpSparkLayout.tsx`
**Navigation Style:** Expandable/collapsible accordion sections (7 categories)
**Total Sub-Pages:** 27

### Web Tools (expanded by default)

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Single URL Scrape | `/mcp-spark/scrape` | Globe | Scrapes content from a single URL, extracting text, metadata, and structured data for analysis |
| Site Crawl | `/mcp-spark/crawl` | FileSearch | Crawls an entire website following links, discovering all pages and their content/structure |
| URL Map | `/mcp-spark/map` | Map | Generates a visual sitemap of a website showing page hierarchy and link relationships |
| Web Search + Scrape | `/mcp-spark/search` | Search | Combines search engine queries with automatic scraping of results for bulk data collection |
| Structured Extract | `/mcp-spark/extract` | Database | Extracts structured data (tables, lists, product info) from web pages into organized formats |
| Site Cloner | `/mcp-spark/clone` | Code | Clones website HTML/CSS structure for local analysis, template reference, or migration planning |

### Research

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Deep Research | `/mcp-spark/deep-research` | Brain | AI-powered deep research that synthesizes information from multiple sources on a given topic |
| Product Research | `/mcp-spark/products` | ShoppingCart | Researches products across e-commerce platforms, analyzing pricing, reviews, and market positioning |
| Content Analysis | `/mcp-spark/content-analysis` | FileText | Analyzes existing content for quality, readability, SEO score, keyword density, and improvement opportunities |
| Question Finder | `/mcp-spark/questions` | HelpCircle | Discovers questions people are asking about a topic across forums, Q&A sites, and search engines |

### Keyword Tools

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Dashboard | `/mcp-spark/dashboard` | TrendingUp | Central keyword analytics dashboard showing overview metrics, trends, and key performance indicators |
| Search Volume | `/mcp-spark/search-volume` | TrendingUp | Looks up monthly search volume data for keywords, showing demand over time with historical trends |
| Keyword Ideas | `/mcp-spark/ideas` | Lightbulb | Generates new keyword suggestions based on seed keywords, using related terms, questions, and variations |
| Difficulty Analysis | `/mcp-spark/difficulty` | Target | Analyzes how hard it is to rank for specific keywords based on competition, domain authority, and SERP analysis |
| Keyword Clustering | `/mcp-spark/clustering` | Layers | Groups related keywords into thematic clusters for content planning and topic authority building |
| Trends | `/mcp-spark/trends` | LineChart | Tracks keyword popularity over time, identifies seasonal patterns and emerging/declining search trends |

### Competitor Analysis

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Competitor Keywords | `/mcp-spark/competitor-keywords` | Users | Discovers which keywords competitors rank for, revealing gaps and opportunities in your strategy |
| SERP Competitors | `/mcp-spark/serp-competitors` | Search | Identifies who your actual competitors are in search results for target keywords |
| SERP Features | `/mcp-spark/serp-features` | Eye | Analyzes which SERP features (featured snippets, PAA, knowledge panels) appear for target keywords |
| Domain Analytics | `/mcp-spark/domain-analytics` | BarChart | Provides comprehensive domain-level analytics including authority, traffic estimates, and ranking profiles |

### Link Analysis

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Backlink Analysis | `/mcp-spark/backlinks` | Link2 | Analyzes a site's backlink profile showing referring domains, anchor text distribution, and link quality |
| Link Opportunities | `/mcp-spark/link-opportunities` | Unlink | Finds potential link building opportunities based on competitor links, broken links, and unlinked mentions |

### Local

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Local SEO | `/mcp-spark/local-seo` | MapPin | Tools for local search optimization including local keyword tracking, GMB analysis, and citation management |

### Configuration

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Research History | `/mcp-spark/history` | History | Browse and re-access previous research sessions, saved queries, and past analysis results |
| Scheduled Reports | `/mcp-spark/scheduled-reports` | Calendar | Configure automated recurring reports delivered on schedule for ongoing monitoring |
| Monitoring | `/mcp-spark/monitoring` | Activity | Real-time monitoring dashboard for active scraping jobs, API usage, and system health |
| MCP Settings | `/mcp-spark/settings` | Settings | Configure MCP Spark module preferences, API keys, default parameters, and tool integrations |

---

## 3. Daily Checks Module - Website Monitoring & SEO

**Source:** `apps/frontend/src/pages/daily-checks/DailyChecksLayout.tsx`
**Navigation Style:** Grouped sections (no expand/collapse)
**Total Sub-Pages:** 7

### Overview

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Dashboard | `/daily-checks` | LayoutDashboard | Central overview of all daily check results, alerts, and website health status at a glance |
| Websites | `/daily-checks/websites` | Globe | Manage the list of websites being monitored, add/remove sites, and configure check frequency |

### Health Checks

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| SEO Health | `/daily-checks/seo-health` | ShieldCheck | Automated daily SEO audits checking meta tags, broken links, page speed, mobile usability, and indexability |
| Content Changes | `/daily-checks/content-changes` | FileText | Detects and logs content changes on monitored pages, tracking modifications, additions, and removals |

### Tracking

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Keywords | `/daily-checks/keywords` | Key | Tracks daily keyword ranking positions across search engines, showing movement and trends |
| GSC Rankings | `/daily-checks/rankings` | TrendingUp | Pulls ranking data directly from Google Search Console, showing impressions, clicks, and position data |

### Configuration

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Settings | `/daily-checks/settings` | Settings | Configure check schedules, notification preferences, alert thresholds, and monitoring parameters |

---

## 4. Asset Tracker Module - Portfolio Management

**Source:** `apps/frontend/src/pages/asset-tracker/AssetTrackerLayout.tsx`
**Navigation Style:** Grouped sections (no expand/collapse)
**Total Sub-Pages:** 10

### Overview

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Dashboard | `/asset-tracker` | LayoutDashboard | Portfolio-wide overview showing all projects, their health status, pending tasks, and key metrics |
| Alerts | `/asset-tracker/alerts` | Bell | View and manage alerts for project issues, deadline warnings, health check failures, and anomalies |

### Assets

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Projects | `/asset-tracker/projects` | Globe | Manage the portfolio of web projects/websites, including domains, hosting info, and project metadata |
| Board | `/asset-tracker/board` | Columns | Kanban-style board view for managing project tasks with drag-and-drop workflow visualization |
| Tasks | `/asset-tracker/tasks` | CheckSquare | List view of all tasks across projects with filtering, sorting, assignment, and status tracking |

### Monitoring

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Health | `/asset-tracker/health` | Activity | Real-time health monitoring of all assets showing uptime, performance, SSL status, and technical issues |
| Reports | `/asset-tracker/reports` | FileBarChart | Generate and view reports on project performance, task completion rates, and portfolio analytics |
| Ops Review | `/asset-tracker/ops-review` | ClipboardList | Operational review dashboard for periodic assessment of project operations and team performance |

### Management

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Trash | `/asset-tracker/trash` | Trash2 | View and restore deleted projects, tasks, and assets before permanent removal |
| Settings | `/asset-tracker/settings` | Settings | Configure asset tracker preferences, notification rules, default views, and integration settings |

---

## 5. Nico GEO Module - GEO Content Engine

**Source:** `apps/frontend/src/pages/nico-geo/NicoGeoLayout.tsx`
**Navigation Style:** Collapsible sidebar (minimizes to icon-only)
**Total Sub-Pages:** 7

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Dashboard | `/nico-geo` | Home | Overview of GEO content generation activity, recent sessions, and performance metrics |
| Generate Content | `/nico-geo/generate` | Sparkles | AI-powered content generation engine that creates GEO-optimized content for target locations and topics |
| Audit Content | `/nico-geo/audit` | Search | Audits existing content for GEO optimization, checking location relevance, local signals, and search intent alignment |
| Improve Content | `/nico-geo/improve` | FileText | Takes existing content and enhances it with GEO signals, local relevance, and search optimization improvements |
| Review Sessions | `/nico-geo/reviews` | ClipboardCheck | Browse past content generation and audit sessions, review AI outputs, and approve/reject suggestions |
| API Keys | `/nico-geo/api-keys` | Key | Manage API keys for external services used by the GEO engine (LLM providers, search APIs, etc.) |
| Settings | `/nico-geo/settings` | Settings | Configure GEO engine preferences, default locations, content templates, and generation parameters |

---

## 6. Nexus OpenCopy Module - AI Content Studio

**Source:** `apps/frontend/src/pages/nexus-opencopy/NexusOpenCopyLayout.tsx`
**Navigation Style:** Collapsible sidebar (minimizes to icon-only)
**Total Sub-Pages:** 7

| Menu Item | Route | Icon | What It Does |
|-----------|-------|------|-------------|
| Dashboard | `/nexus-opencopy` | Home | Central hub showing content pipeline status, recent articles, publishing schedule, and performance stats |
| Projects | `/nexus-opencopy/projects` | FolderKanban | Organize content into projects/campaigns, manage content briefs, and track project-level progress |
| Keywords | `/nexus-opencopy/keywords` | Search | Keyword research and selection for content creation, mapping keywords to content pieces and clusters |
| Articles | `/nexus-opencopy/articles` | FileText | AI-powered article creation, editing, and management with SEO optimization built into the writing workflow |
| Content Planner | `/nexus-opencopy/content-planner` | CalendarDays | Editorial calendar for planning, scheduling, and tracking content publication across projects |
| Integrations | `/nexus-opencopy/integrations` | Link2 | Connect to external platforms (WordPress, CMS, social media) for automated content publishing and syndication |
| Settings | `/nexus-opencopy/settings` | Settings | Configure content studio preferences, AI model settings, brand voice, style guides, and output formats |

---

## 7. Top-Level Standalone Pages

**Source:** `apps/frontend/src/App.tsx`

These pages are accessible via routes but not all appear in the main sidebar navigation:

| Page | Route | Source File | What It Does |
|------|-------|-------------|-------------|
| Auth | `/auth` | `AuthPage.tsx` | Login/signup page (public, no authentication required) |
| Dashboard | `/dashboard` | `Dashboard.tsx` | Main analytics dashboard with cross-module insights and KPIs |
| Websites | `/websites` | `WebsitesPage.tsx` | Global website management across all modules |
| Projects | `/projects` | `ProjectsPage.tsx` | Global project listing and management |
| Tasks | `/tasks` | `TasksPage.tsx` | Global task management across all projects |
| SEO Research | `/seo-research` | `SeoResearchPage.tsx` | Standalone SEO research workspace |
| Research | `/research` | `ResearchPage.tsx` | General research workspace |
| Planner | `/planner` | `PlannerPage.tsx` | Content/project planning workspace |
| Admin | `/admin` | `AdminPage.tsx` | System administration, user management, and configuration |
| Profile | `/profile` | `ProfilePage.tsx` | User profile settings, account info, and preferences |
| Settings | `/settings` | `SettingsPage.tsx` | Global application settings and preferences |

---

## 8. Complete Routing Hierarchy

```
BrowserRouter
├── /auth (public)
│
├── / (protected - wrapped in Layout)
│   ├── /dashboard
│   ├── /websites
│   ├── /projects
│   ├── /tasks
│   ├── /seo-research
│   ├── /research
│   ├── /planner
│   ├── /admin
│   ├── /profile
│   ├── /settings
│   │
│   ├── /mcp-spark/* (McpSparkLayout)
│   │   ├── index
│   │   ├── /scrape
│   │   ├── /crawl
│   │   ├── /map
│   │   ├── /search
│   │   ├── /extract
│   │   ├── /clone
│   │   ├── /deep-research
│   │   ├── /products
│   │   ├── /content-analysis
│   │   ├── /questions
│   │   ├── /dashboard
│   │   ├── /search-volume
│   │   ├── /ideas
│   │   ├── /difficulty
│   │   ├── /clustering
│   │   ├── /trends
│   │   ├── /competitor-keywords
│   │   ├── /serp-competitors
│   │   ├── /serp-features
│   │   ├── /domain-analytics
│   │   ├── /backlinks
│   │   ├── /link-opportunities
│   │   ├── /local-seo
│   │   ├── /history
│   │   ├── /scheduled-reports
│   │   ├── /monitoring
│   │   └── /settings
│   │
│   ├── /daily-checks/* (DailyChecksLayout)
│   │   ├── index
│   │   ├── /websites
│   │   ├── /seo-health
│   │   ├── /content-changes
│   │   ├── /keywords
│   │   ├── /rankings
│   │   └── /settings
│   │
│   ├── /asset-tracker/* (AssetTrackerLayout)
│   │   ├── index
│   │   ├── /alerts
│   │   ├── /projects
│   │   ├── /board
│   │   ├── /tasks
│   │   ├── /health
│   │   ├── /reports
│   │   ├── /ops-review
│   │   ├── /trash
│   │   └── /settings
│   │
│   ├── /nico-geo/* (NicoGeoLayout)
│   │   ├── index
│   │   ├── /generate
│   │   ├── /audit
│   │   ├── /improve
│   │   ├── /reviews
│   │   ├── /api-keys
│   │   └── /settings
│   │
│   └── /nexus-opencopy/* (NexusOpenCopyLayout)
│       ├── index
│       ├── /projects
│       ├── /keywords
│       ├── /articles
│       ├── /content-planner
│       ├── /integrations
│       └── /settings
│
└── * (wildcard → redirects to /dashboard)
```

---

## Summary

| Module | Sub-Pages | Purpose |
|--------|-----------|---------|
| **Main Nav** | 9 items | Dashboard, 5 modules, admin/profile/settings |
| **MCP Spark** | 27 tools | SEO research, scraping, keyword analysis, competitor intel |
| **Daily Checks** | 7 pages | Automated website monitoring and SEO health tracking |
| **Asset Tracker** | 10 pages | Project portfolio management with kanban, tasks, and reporting |
| **Nico GEO** | 7 pages | Geographically-optimized AI content generation |
| **Nexus OpenCopy** | 7 pages | AI-powered content studio with editorial planning |
| **Standalone** | 11 pages | Global views for websites, projects, tasks, research, admin |

**Grand Total: 72+ unique routes across 86 page components**
