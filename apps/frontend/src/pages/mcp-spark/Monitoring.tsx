import { useState } from "react";
import { Activity, Globe, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Plus, Trash2, RefreshCw } from "lucide-react";

interface MonitoredDomain {
  id: string;
  domain: string;
  lastCheck: string;
  status: "up" | "down" | "checking";
  uptime: number;
  rankChange: number;
  keywords: number;
}

export default function Monitoring() {
  const [domains, setDomains] = useState<MonitoredDomain[]>([]);

  const [newDomain, setNewDomain] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const addDomain = () => {
    if (!newDomain.trim()) {
      showFeedback("error", "Please enter a domain");
      return;
    }

    const domain = newDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

    if (domains.some((d) => d.domain === domain)) {
      showFeedback("error", "Domain already being monitored");
      return;
    }

    const newEntry: MonitoredDomain = {
      id: Date.now().toString(),
      domain,
      lastCheck: new Date().toISOString(),
      status: "up",
      uptime: 0,
      rankChange: 0,
      keywords: 0,
    };

    setDomains([...domains, newEntry]);
    setNewDomain("");
    showFeedback("success", `Added ${domain} to monitoring`);

  };

  const removeDomain = (id: string) => {
    setDomains(domains.filter((d) => d.id !== id));
    showFeedback("success", "Domain removed from monitoring");
  };

  const refreshAll = async () => {
    setIsRefreshing(true);
    setDomains(domains.map((d) => ({ ...d, lastCheck: new Date().toISOString() })));

    setIsRefreshing(false);
    showFeedback("success", "All domains refreshed");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "up":
        return (
          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Up
          </span>
        );
      case "down":
        return (
          <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-600 rounded flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Down
          </span>
        );
      case "checking":
        return (
          <span className="px-2 py-0.5 text-xs bg-slate-200 text-slate-400 rounded flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Checking
          </span>
        );
      default:
        return <span className="px-2 py-0.5 text-xs bg-slate-200 text-slate-400 rounded">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {feedback && (
        <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Activity className="h-6 w-6 text-blue-600" />
          Monitoring
        </h1>
        <p className="text-slate-400">Track domain health and ranking changes</p>
      </div>

      {/* Add Domain */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Add Domain to Monitor</h2>
          <p className="text-sm text-slate-400">Track uptime and SEO metrics for your domains</p>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDomain()}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={addDomain} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="h-4 w-4" />
              Add Domain
            </button>
            <button
              onClick={refreshAll}
              disabled={isRefreshing}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh All
            </button>
          </div>
        </div>
      </div>

      {/* Monitored Domains */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Monitored Domains</h2>
          <p className="text-sm text-slate-400">{domains.length} domains being tracked</p>
        </div>
        <div className="p-6">
          {domains.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Domain</th>
                  <th className="text-center p-3 text-slate-400 text-sm font-medium">Status</th>
                  <th className="text-center p-3 text-slate-400 text-sm font-medium">Uptime</th>
                  <th className="text-center p-3 text-slate-400 text-sm font-medium">Rank Change</th>
                  <th className="text-right p-3 text-slate-400 text-sm font-medium">Keywords</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Last Check</th>
                  <th className="w-16 text-center p-3 text-slate-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain.id} className="border-b border-slate-200">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-white">{domain.domain}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">{getStatusBadge(domain.status)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${domain.uptime}%` }} />
                        </div>
                        <span className="text-sm text-slate-600">{domain.uptime}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {domain.rankChange !== 0 && (
                        <div className={`flex items-center justify-center gap-1 ${domain.rankChange > 0 ? "text-green-400" : "text-red-600"}`}>
                          {domain.rankChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span>{Math.abs(domain.rankChange)}</span>
                        </div>
                      )}
                      {domain.rankChange === 0 && <span className="text-slate-500">-</span>}
                    </td>
                    <td className="p-3 text-right text-slate-600">{domain.keywords}</td>
                    <td className="p-3 text-sm text-slate-500">{formatDate(domain.lastCheck)}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => removeDomain(domain.id)} className="p-2 text-red-600 hover:text-red-300 hover:bg-slate-100 rounded transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-slate-500">
              No domains being monitored. Add a domain to start tracking!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
