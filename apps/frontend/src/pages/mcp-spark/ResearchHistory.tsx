import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabase";
import { History, Search, BarChart, MessageSquare, Globe } from "lucide-react";

interface HistoryItem {
  id: string;
  type: "search" | "audit" | "conversation";
  title: string;
  description?: string;
  created_at: string;
  status?: string;
}

export default function ResearchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "search" | "audit" | "conversation">("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchHistory = async () => {
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

      const items: HistoryItem[] = [];

      // Fetch searches
      const { data: searches } = await supabase
        .from("search_history")
        .select("id, seed_keyword, created_at, keyword_count, serp_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (searches) {
        items.push(
          ...searches.map((s) => ({
            id: s.id,
            type: "search" as const,
            title: s.seed_keyword,
            description: `${s.keyword_count || 0} keywords, ${s.serp_count || 0} SERP results`,
            created_at: s.created_at,
          }))
        );
      }

      // Fetch audits
      const { data: audits } = await supabase
        .from("seo_audits")
        .select("id, domain, created_at, status, overall_score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (audits) {
        items.push(
          ...audits.map((a) => ({
            id: a.id,
            type: "audit" as const,
            title: a.domain,
            description: a.overall_score ? `Score: ${a.overall_score}%` : undefined,
            created_at: a.created_at,
            status: a.status,
          }))
        );
      }

      // Fetch conversations
      const { data: conversations } = await supabase
        .from("niche_conversations")
        .select("id, title, created_at, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (conversations) {
        items.push(
          ...conversations.map((c) => ({
            id: c.id,
            type: "conversation" as const,
            title: c.title,
            created_at: c.created_at,
            status: c.status,
          }))
        );
      }

      // Sort by date
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setHistory(items);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      showFeedback("error", "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "search":
        return <Search className="h-4 w-4 text-blue-600" />;
      case "audit":
        return <BarChart className="h-4 w-4 text-green-400" />;
      case "conversation":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "search":
        return <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-600 rounded">Keyword Search</span>;
      case "audit":
        return <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">SEO Audit</span>;
      case "conversation":
        return <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-600 rounded">Niche AI</span>;
      default:
        return <span className="px-2 py-0.5 text-xs bg-slate-200 text-slate-400 rounded">{type}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredHistory = filter === "all" ? history : history.filter((h) => h.type === filter);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {feedback && (
        <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <History className="h-6 w-6 text-blue-600" />
          Research History
        </h1>
        <p className="text-slate-400">View and restore your previous research sessions</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Activity History</h2>
            <p className="text-sm text-slate-400">All your keyword searches, audits, and conversations</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "search", "audit", "conversation"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === f ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-400 hover:bg-slate-100"}`}
              >
                {f === "all" ? "All" : f === "search" ? "Searches" : f === "audit" ? "Audits" : "AI Chats"}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <p className="text-slate-500 text-center py-8">Loading...</p>
          ) : filteredHistory.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Type</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Title</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Details</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Date</th>
                  <th className="text-center p-3 text-slate-400 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="border-b border-slate-200">
                    <td className="p-3">{getTypeBadge(item.type)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="font-medium text-white">{item.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 text-sm">{item.description || "-"}</td>
                    <td className="p-3 text-sm text-slate-400">{formatDate(item.created_at)}</td>
                    <td className="p-3 text-center">
                      {item.status && (
                        <span className={`px-2 py-0.5 text-xs rounded ${item.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-slate-200 text-slate-400"}`}>
                          {item.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-slate-500">
              No history found. Start researching to see your activity here!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
