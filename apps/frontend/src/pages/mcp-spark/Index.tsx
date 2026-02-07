import { Link } from "react-router-dom";
import {
  Globe,
  FileSearch,
  Map,
  Search,
  Database,
  Code,
  Brain,
  TrendingUp,
  Lightbulb,
  Target,
  HelpCircle,
  Users,
  BarChart,
  Eye,
  MapPin,
  LineChart,
  Link2,
  Unlink,
  FileText,
  ShoppingCart,
  Layers,
  History,
  Calendar,
  Activity,
  AlertTriangle,
  Zap,
} from "lucide-react";

const toolCategories = [
  {
    title: "Web Scraping & Crawling",
    description: "Extract and analyze web content at scale",
    color: "from-blue-500 to-cyan-500",
    tools: [
      { title: "Single URL Scrape", url: "/mcp-spark/scrape", icon: Globe, description: "Scrape content from any URL" },
      { title: "Site Crawl", url: "/mcp-spark/crawl", icon: FileSearch, description: "Crawl entire websites" },
      { title: "URL Map", url: "/mcp-spark/map", icon: Map, description: "Discover all URLs on a site" },
      { title: "Web Search + Scrape", url: "/mcp-spark/search", icon: Search, description: "Search the web and scrape results" },
      { title: "Structured Extract", url: "/mcp-spark/extract", icon: Database, description: "Extract structured data from pages" },
      { title: "Site Cloner", url: "/mcp-spark/clone", icon: Code, description: "Clone websites to React code" },
    ],
  },
  {
    title: "Research Tools",
    description: "AI-powered research and analysis",
    color: "from-purple-500 to-pink-500",
    tools: [
      { title: "Deep Research", url: "/mcp-spark/deep-research", icon: Brain, description: "AI-powered deep research agent" },
      { title: "Product Research", url: "/mcp-spark/products", icon: ShoppingCart, description: "Analyze products and markets" },
      { title: "Content Analysis", url: "/mcp-spark/content-analysis", icon: FileText, description: "Analyze content quality" },
      { title: "Question Finder", url: "/mcp-spark/questions", icon: HelpCircle, description: "Find questions people ask" },
    ],
  },
  {
    title: "Keyword Research",
    description: "Discover and analyze keywords",
    color: "from-amber-500 to-orange-500",
    tools: [
      { title: "Dashboard", url: "/mcp-spark/dashboard", icon: TrendingUp, description: "Keyword research overview" },
      { title: "Search Volume", url: "/mcp-spark/search-volume", icon: TrendingUp, description: "Get search volume metrics" },
      { title: "Keyword Ideas", url: "/mcp-spark/ideas", icon: Lightbulb, description: "Generate keyword ideas" },
      { title: "Difficulty Analysis", url: "/mcp-spark/difficulty", icon: Target, description: "Analyze keyword difficulty" },
      { title: "Keyword Clustering", url: "/mcp-spark/clustering", icon: Layers, description: "Cluster keywords by topic" },
      { title: "Trends", url: "/mcp-spark/trends", icon: LineChart, description: "Analyze keyword trends" },
    ],
  },
  {
    title: "Competitor Analysis",
    description: "Analyze competitor SEO strategies",
    color: "from-emerald-500 to-teal-500",
    tools: [
      { title: "Competitor Keywords", url: "/mcp-spark/competitor-keywords", icon: Users, description: "Find competitor keywords" },
      { title: "SERP Competitors", url: "/mcp-spark/serp-competitors", icon: Search, description: "Analyze SERP competitors" },
      { title: "SERP Features", url: "/mcp-spark/serp-features", icon: Eye, description: "Track SERP features" },
      { title: "Domain Analytics", url: "/mcp-spark/domain-analytics", icon: BarChart, description: "Domain-level analytics" },
    ],
  },
  {
    title: "Link Analysis",
    description: "Backlink analysis and opportunities",
    color: "from-red-500 to-rose-500",
    tools: [
      { title: "Backlink Analysis", url: "/mcp-spark/backlinks", icon: Link2, description: "Analyze backlink profiles" },
      { title: "Link Opportunities", url: "/mcp-spark/link-opportunities", icon: Unlink, description: "Find link opportunities" },
    ],
  },
  {
    title: "Local SEO",
    description: "Local search optimization",
    color: "from-indigo-500 to-violet-500",
    tools: [
      { title: "Local SEO", url: "/mcp-spark/local-seo", icon: MapPin, description: "Local SEO analysis" },
    ],
  },
  {
    title: "Configuration",
    description: "History and settings",
    color: "from-slate-500 to-slate-600",
    tools: [
      { title: "Research History", url: "/mcp-spark/history", icon: History, description: "View research history" },
      { title: "Scheduled Reports", url: "/mcp-spark/scheduled-reports", icon: Calendar, description: "Schedule automated reports" },
      { title: "Monitoring", url: "/mcp-spark/monitoring", icon: Activity, description: "Monitor keywords and sites" },
    ],
  },
];

export default function McpSparkIndex() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold">MCP Spark Tools</h1>
        </div>
        <p className="text-slate-400">
          A comprehensive suite of web scraping, keyword research, and SEO analysis tools powered by DataForSEO and Firecrawl APIs.
        </p>
      </div>

      {/* Tool Categories */}
      <div className="space-y-8">
        {toolCategories.map((category) => (
          <div key={category.title}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{category.title}</h2>
              <p className="text-sm text-slate-500">{category.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.tools.map((tool) => (
                <Link
                  key={tool.url}
                  to={tool.url}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-100 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color} bg-opacity-20`}>
                      <tool.icon size={20} className="text-white" />
                    </div>
                    <h3 className="font-medium group-hover:text-slate-900 transition-colors">
                      {tool.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* API Notice */}
      <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
          <div>
            <div className="font-medium text-amber-600 mb-1">API Keys Required</div>
            <p className="text-sm text-slate-400">
              Web scraping tools require a Firecrawl API key. Keyword and SEO tools require DataForSEO credentials.
              Configure your API keys in Settings → API Keys to enable all features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
