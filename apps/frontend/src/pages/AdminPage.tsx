import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth";
import { getSupabase } from "../lib/supabase";
import { callEdgeFunction } from "../lib/edgeFunctions";
import {
  Shield,
  Users,
  CreditCard,
  Activity,
  Settings,
  AlertTriangle,
  TrendingUp,
  Database,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

type ApiUsageLog = {
  id: string;
  user_id: string;
  endpoint: string;
  provider: string;
  credits_used: number;
  created_at: string;
};

type UserCredit = {
  user_id: string;
  balance: number;
  lifetime_used: number;
  updated_at: string;
};

type SystemStats = {
  totalUsers: number;
  activeToday: number;
  totalApiCalls: number;
  creditsUsedToday: number;
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-400" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, mode } = useAuth();
  const supabase = useMemo(() => getSupabase(), []);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeToday: 0,
    totalApiCalls: 0,
    creditsUsedToday: 0,
  });
  const [recentLogs, setRecentLogs] = useState<ApiUsageLog[]>([]);
  const [userCredits, setUserCredits] = useState<UserCredit[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "usage" | "settings">("overview");

  useEffect(() => {
    async function checkAdmin() {
      if (!supabase || !user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data, error } = await supabase
        .from("user_settings")
        .select("is_admin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data?.is_admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await loadDashboardData();
      setLoading(false);
    }

    checkAdmin();
  }, [supabase, user]);

  async function loadDashboardData() {
    if (!supabase) return;

    // Load API usage logs
    const { data: logs } = await supabase
      .from("api_usage_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    setRecentLogs(logs || []);

    // Load user credits
    const { data: credits } = await supabase
      .from("user_credits")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(10);

    setUserCredits(credits || []);

    // Calculate stats
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = (logs || []).filter(
      (log) => log.created_at.startsWith(today)
    );

    setStats({
      totalUsers: (credits || []).length,
      activeToday: new Set(todayLogs.map((l) => l.user_id)).size,
      totalApiCalls: (logs || []).length,
      creditsUsedToday: todayLogs.reduce((sum, l) => sum + (l.credits_used || 0), 0),
    });
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (mode === "demo" || !supabase) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-amber-500/20">
            <AlertTriangle size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <p className="text-sm text-slate-400">Demo mode - Admin features disabled</p>
          </div>
        </div>
        <p className="text-slate-500">
          Configure Supabase environment variables to enable admin functionality.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/20">
            <Shield size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Access Denied</h1>
            <p className="text-sm text-slate-400">
              You don't have permission to access the admin panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20">
              <Shield size={20} className="text-indigo-400" />
            </div>
            <h1 className="text-2xl font-semibold">Admin Panel</h1>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            System configuration, user management, and API usage monitoring.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "users", label: "Users", icon: Users },
          { id: "usage", label: "API Usage", icon: Database },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="bg-blue-500/20 text-blue-400"
            />
            <StatCard
              title="Active Today"
              value={stats.activeToday}
              icon={Activity}
              color="bg-emerald-500/20 text-emerald-400"
            />
            <StatCard
              title="API Calls (Recent)"
              value={stats.totalApiCalls}
              icon={Database}
              color="bg-purple-500/20 text-purple-400"
            />
            <StatCard
              title="Credits Used Today"
              value={stats.creditsUsedToday.toFixed(2)}
              icon={CreditCard}
              color="bg-amber-500/20 text-amber-400"
            />
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Activity size={16} className="text-slate-400" />
              Recent API Activity
            </h3>
            {recentLogs.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">
                No recent API activity
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="pb-3 font-medium">Endpoint</th>
                      <th className="pb-3 font-medium">Provider</th>
                      <th className="pb-3 font-medium">Credits</th>
                      <th className="pb-3 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {recentLogs.slice(0, 10).map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 pr-4">
                          <code className="text-xs bg-slate-800 px-2 py-1 rounded">
                            {log.endpoint.split("/").pop()}
                          </code>
                        </td>
                        <td className="py-3 pr-4 text-slate-400">{log.provider}</td>
                        <td className="py-3 pr-4">
                          <span className="text-amber-400">{log.credits_used}</span>
                        </td>
                        <td className="py-3 text-slate-500 text-xs">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            User Credits
          </h3>
          {userCredits.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">
              No user credit records found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="pb-3 font-medium">User ID</th>
                    <th className="pb-3 font-medium">Balance</th>
                    <th className="pb-3 font-medium">Lifetime Used</th>
                    <th className="pb-3 font-medium">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {userCredits.map((credit) => (
                    <tr key={credit.user_id}>
                      <td className="py-3 pr-4">
                        <code className="text-xs bg-slate-800 px-2 py-1 rounded">
                          {credit.user_id.slice(0, 8)}...
                        </code>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-emerald-400">{credit.balance}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400">
                        {credit.lifetime_used}
                      </td>
                      <td className="py-3 text-slate-500 text-xs">
                        {formatDate(credit.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === "usage" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Database size={16} className="text-slate-400" />
            Full API Usage Log
          </h3>
          {recentLogs.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">
              No API usage logs found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Endpoint</th>
                    <th className="pb-3 font-medium">Provider</th>
                    <th className="pb-3 font-medium">Credits</th>
                    <th className="pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 pr-4">
                        <code className="text-xs bg-slate-800 px-2 py-1 rounded">
                          {log.user_id.slice(0, 8)}...
                        </code>
                      </td>
                      <td className="py-3 pr-4">
                        <code className="text-xs">{log.endpoint}</code>
                      </td>
                      <td className="py-3 pr-4 text-slate-400">{log.provider}</td>
                      <td className="py-3 pr-4">
                        <span className="text-amber-400">{log.credits_used}</span>
                      </td>
                      <td className="py-3 text-slate-500 text-xs">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Settings size={16} className="text-slate-400" />
              System Configuration
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Configure credit pricing, feature flags, and system-wide settings.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Credit Pricing</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure API credit costs
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Feature Flags</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enable/disable features
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">User Roles</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage admin permissions
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">API Rate Limits</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure rate limiting
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
