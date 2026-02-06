import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
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
  ArrowLeft,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react";

const menuSections = [
  {
    title: "Web Tools",
    defaultOpen: true,
    items: [
      { title: "Tools Home", url: "/mcp-spark", icon: Home, end: true },
      { title: "Single URL Scrape", url: "/mcp-spark/scrape", icon: Globe },
      { title: "Site Crawl", url: "/mcp-spark/crawl", icon: FileSearch },
      { title: "URL Map", url: "/mcp-spark/map", icon: Map },
      { title: "Web Search + Scrape", url: "/mcp-spark/search", icon: Search },
      { title: "Structured Extract", url: "/mcp-spark/extract", icon: Database },
      { title: "Site Cloner", url: "/mcp-spark/clone", icon: Code },
    ],
  },
  {
    title: "Research",
    defaultOpen: true,
    items: [
      { title: "Deep Research", url: "/mcp-spark/deep-research", icon: Brain },
      { title: "Product Research", url: "/mcp-spark/products", icon: ShoppingCart },
      { title: "Content Analysis", url: "/mcp-spark/content-analysis", icon: FileText },
      { title: "Question Finder", url: "/mcp-spark/questions", icon: HelpCircle },
    ],
  },
  {
    title: "Keyword Tools",
    defaultOpen: true,
    items: [
      { title: "Dashboard", url: "/mcp-spark/dashboard", icon: TrendingUp },
      { title: "Search Volume", url: "/mcp-spark/search-volume", icon: TrendingUp },
      { title: "Keyword Ideas", url: "/mcp-spark/ideas", icon: Lightbulb },
      { title: "Difficulty Analysis", url: "/mcp-spark/difficulty", icon: Target },
      { title: "Keyword Clustering", url: "/mcp-spark/clustering", icon: Layers },
      { title: "Trends", url: "/mcp-spark/trends", icon: LineChart },
    ],
  },
  {
    title: "Competitor Analysis",
    defaultOpen: false,
    items: [
      { title: "Competitor Keywords", url: "/mcp-spark/competitor-keywords", icon: Users },
      { title: "SERP Competitors", url: "/mcp-spark/serp-competitors", icon: Search },
      { title: "SERP Features", url: "/mcp-spark/serp-features", icon: Eye },
      { title: "Domain Analytics", url: "/mcp-spark/domain-analytics", icon: BarChart },
    ],
  },
  {
    title: "Link Analysis",
    defaultOpen: false,
    items: [
      { title: "Backlink Analysis", url: "/mcp-spark/backlinks", icon: Link2 },
      { title: "Link Opportunities", url: "/mcp-spark/link-opportunities", icon: Unlink },
    ],
  },
  {
    title: "Local",
    defaultOpen: false,
    items: [
      { title: "Local SEO", url: "/mcp-spark/local-seo", icon: MapPin },
    ],
  },
  {
    title: "Configuration",
    defaultOpen: false,
    items: [
      { title: "Research History", url: "/mcp-spark/history", icon: History },
      { title: "Scheduled Reports", url: "/mcp-spark/scheduled-reports", icon: Calendar },
      { title: "Monitoring", url: "/mcp-spark/monitoring", icon: Activity },
      { title: "MCP Settings", url: "/mcp-spark/settings", icon: Settings },
    ],
  },
];

function SidebarSection({
  title,
  items,
  defaultOpen,
}: {
  title: string;
  items: { title: string; url: string; icon: React.ElementType; end?: boolean }[];
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const location = useLocation();

  const hasActiveItem = items.some((item) =>
    item.end ? location.pathname === item.url : location.pathname.startsWith(item.url)
  );

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
          hasActiveItem ? "text-indigo-600 bg-indigo-500/10" : "text-slate-500 hover:text-slate-600 hover:bg-slate-100"
        }`}
      >
        {title}
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && (
        <div className="mt-1 space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-600"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              <item.icon size={16} />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function McpSparkLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-[calc(100vh-73px)] -m-6">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Zap size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">MCP Spark</div>
                  <div className="text-[10px] text-slate-500">SEO Research Suite</div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            {menuSections.map((section) => (
              <SidebarSection
                key={section.title}
                title={section.title}
                items={section.items}
                defaultOpen={section.defaultOpen}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            <span className="font-semibold">MCP Spark Tools</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
