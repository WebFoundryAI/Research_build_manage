import type { ComponentType } from "react";
import {
  Aperture,
  BarChart3,
  BookOpen,
  Boxes,
  Database,
  Globe,
  Layers,
  Map,
  Search,
  Sparkles,
  Target,
  TerminalSquare,
  Wand2,
} from "lucide-react";

export type ToolCategory = "web" | "research" | "keyword";

export type ToolField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea";
};

export type ToolDefinition = {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  section: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  fields: ToolField[];
  requiredSecrets: string[];
};

export const TOOL_SECTIONS: Record<ToolCategory, { label: string; sections: string[] }> = {
  web: {
    label: "Web Tools",
    sections: ["Web Scraping & Crawling"],
  },
  research: {
    label: "Research",
    sections: ["Research Tools"],
  },
  keyword: {
    label: "Keyword Tools",
    sections: ["Keyword Intelligence"],
  },
};

export const MCP_SPARK_TOOLS: ToolDefinition[] = [
  {
    id: "single-url-scrape",
    name: "Single URL Scrape",
    description: "Scrape content from any URL",
    category: "web",
    section: "Web Scraping & Crawling",
    icon: Globe,
    fields: [{ name: "url", label: "URL", placeholder: "https://example.com" }],
    requiredSecrets: ["dataforseo_login", "dataforseo_password"],
  },
  {
    id: "site-crawl",
    name: "Site Crawl",
    description: "Crawl entire websites",
    category: "web",
    section: "Web Scraping & Crawling",
    icon: Layers,
    fields: [{ name: "domain", label: "Domain", placeholder: "example.com" }],
    requiredSecrets: ["dataforseo_login", "dataforseo_password"],
  },
  {
    id: "url-map",
    name: "URL Map",
    description: "Discover all URLs on a site",
    category: "web",
    section: "Web Scraping & Crawling",
    icon: Map,
    fields: [{ name: "domain", label: "Domain", placeholder: "example.com" }],
    requiredSecrets: ["dataforseo_login", "dataforseo_password"],
  },
  {
    id: "web-search-scrape",
    name: "Web Search + Scrape",
    description: "Search the web and scrape results",
    category: "web",
    section: "Web Scraping & Crawling",
    icon: Search,
    fields: [{ name: "query", label: "Query", placeholder: "best coffee shops near me" }],
    requiredSecrets: ["dataforseo_login", "dataforseo_password"],
  },
  {
    id: "structured-extract",
    name: "Structured Extract",
    description: "Extract structured data from pages",
    category: "web",
    section: "Web Scraping & Crawling",
    icon: Database,
    fields: [
      { name: "url", label: "URL", placeholder: "https://example.com" },
      { name: "schema", label: "Schema", placeholder: "product, article, faq" },
    ],
    requiredSecrets: ["dataforseo_login", "dataforseo_password"],
  },
  {
    id: "site-cloner",
    name: "Site Cloner",
    description: "Clone websites to React code",
    category: "web",
    section: "Web Scraping & Crawling",
    icon: Boxes,
    fields: [{ name: "url", label: "URL", placeholder: "https://example.com" }],
    requiredSecrets: ["dataforseo_login", "dataforseo_password"],
  },
  {
    id: "deep-research",
    name: "Deep Research",
    description: "AI-powered deep research agent",
    category: "research",
    section: "Research Tools",
    icon: Sparkles,
    fields: [
      { name: "topic", label: "Topic", placeholder: "Local SEO for plumbers" },
      { name: "goal", label: "Goal", placeholder: "Generate findings & sources" },
    ],
    requiredSecrets: ["openai_api_key"],
  },
  {
    id: "product-research",
    name: "Product Research",
    description: "Analyze products and markets",
    category: "research",
    section: "Research Tools",
    icon: Target,
    fields: [{ name: "product", label: "Product", placeholder: "CRM for dentists" }],
    requiredSecrets: ["openai_api_key"],
  },
  {
    id: "content-analysis",
    name: "Content Analysis",
    description: "Analyze content quality",
    category: "research",
    section: "Research Tools",
    icon: BarChart3,
    fields: [{ name: "url", label: "URL", placeholder: "https://example.com/blog" }],
    requiredSecrets: ["openai_api_key"],
  },
  {
    id: "question-finder",
    name: "Question Finder",
    description: "Find questions people ask",
    category: "research",
    section: "Research Tools",
    icon: BookOpen,
    fields: [{ name: "topic", label: "Topic", placeholder: "kitchen renovation" }],
    requiredSecrets: ["dataforseo_login", "dataforseo_password"],
  },
  {
    id: "keyword-cluster",
    name: "Keyword Clustering",
    description: "Group keywords by intent",
    category: "keyword",
    section: "Keyword Intelligence",
    icon: Aperture,
    fields: [{ name: "keywords", label: "Keywords", placeholder: "Enter comma-separated keywords", type: "textarea" }],
    requiredSecrets: ["dataforseo_login", "dataforseo_password"],
  },
  {
    id: "keyword-gap",
    name: "Keyword Gap",
    description: "Find competitor keyword gaps",
    category: "keyword",
    section: "Keyword Intelligence",
    icon: Wand2,
    fields: [
      { name: "yourDomain", label: "Your domain", placeholder: "example.com" },
      { name: "competitor", label: "Competitor domain", placeholder: "competitor.com" },
    ],
    requiredSecrets: ["dataforseo_login", "dataforseo_password"],
  },
  {
    id: "serp-compare",
    name: "SERP Compare",
    description: "Compare SERP results across locales",
    category: "keyword",
    section: "Keyword Intelligence",
    icon: TerminalSquare,
    fields: [
      { name: "query", label: "Query", placeholder: "best plumbers near me" },
      { name: "locations", label: "Locations", placeholder: "New York, Austin, London" },
    ],
    requiredSecrets: ["dataforseo_login", "dataforseo_password"],
  },
];

export const DEFAULT_TOOL = MCP_SPARK_TOOLS[0];
