import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSupabase } from "../../lib/supabase";
import { LayoutDashboard, Activity, Zap, Coins, BarChart3, Search, Target, TrendingUp, Users } from "lucide-react";

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  created_at: string;
}

interface Stats {
  totalSearches: number;
  totalAudits: number;
  creditsUsed: number;
  creditsRemaining: number;
}

const quickActions = [
  { title: "Search Volume", url: "/mcp-spark/search-volume", icon: TrendingUp, description: "Get keyword metrics" },
  { title: "Keyword Ideas", url: "/mcp-spark/ideas", icon: Search, description: "Generate keyword ideas" },
  { title: "Difficulty Analysis", url: "/mcp-spark/difficulty", icon: Target, description: "Analyze keyword difficulty" },
  { title: "Competitor Keywords", url: "/mcp-spark/competitor-keywords", icon: Users, description: "Find competitor keywords" },
];

export default function KeywordDashboard() {
  const [recentSearches, setRecentSearches] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSearches: 0,
    totalAudits: 0,
    creditsUsed: 0,
    creditsRemaining: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: searches } = await supabase
        .from("search_history")
        .select("id, seed_keyword, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (searches) {
        setRecentSearches(
          searches.map((s) => ({
            id: s.id,
            type: "search",
            title: s.seed_keyword,
            created_at: s.created_at,
          }))
        );
      }

      const { count: searchCount } = await supabase
        .from("search_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: auditCount } = await supabase
        .from("seo_audits")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        totalSearches: searchCount || 0,
        totalAudits: auditCount || 0,
        creditsUsed: 0,
        creditsRemaining: 0,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <LayoutDashboard className="h-6 w-6 text-blue-400" />
          Dashboard
        </h1>
        <p className="text-slate-400">Overview of your SEO research activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Total Searches</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalSearches}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-400">Total Audits</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalAudits}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-slate-400">Credits Used</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.creditsUsed}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-slate-400">Credits Remaining</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.creditsRemaining}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Quick Actions
            </h2>
            <p className="text-sm text-slate-400">Jump into your tools</p>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.url}
                to={action.url}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors">
                  <action.icon className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{action.title}</div>
                  <div className="text-xs text-slate-500">{action.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Recent Activity
            </h2>
            <p className="text-sm text-slate-400">Latest research activity</p>
          </div>
          <div className="p-4">
            {isLoading ? (
              <p className="text-slate-500 text-center py-8">Loading...</p>
            ) : recentSearches.length > 0 ? (
              <div className="space-y-2">
                {recentSearches.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-white">{activity.title}</span>
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(activity.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
