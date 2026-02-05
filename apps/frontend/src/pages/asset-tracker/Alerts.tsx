import React, { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Trash2,
  Check,
  Filter,
} from "lucide-react";

type Alert = {
  id: string;
  project_name: string;
  domain: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    setLoading(true);

    const demoAlerts: Alert[] = [
      {
        id: "1",
        project_name: "SaaS Dashboard",
        domain: "app.example.com",
        type: "critical",
        title: "SSL Certificate Expiring Soon",
        message: "SSL certificate will expire in 15 days. Renew now to avoid downtime.",
        created_at: new Date().toISOString(),
        read: false,
      },
      {
        id: "2",
        project_name: "E-Commerce Store",
        domain: "shop.example.com",
        type: "warning",
        title: "High Response Time Detected",
        message: "Average response time exceeded 4 seconds over the last hour.",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      {
        id: "3",
        project_name: "E-Commerce Store",
        domain: "shop.example.com",
        type: "warning",
        title: "Backup Overdue",
        message: "Last backup was 3 days ago. Automatic backup may have failed.",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        read: true,
      },
      {
        id: "4",
        project_name: "Main Website",
        domain: "example.com",
        type: "info",
        title: "Health Check Complete",
        message: "All checks passed. Health score: 92/100.",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
      {
        id: "5",
        project_name: "Main Website",
        domain: "example.com",
        type: "info",
        title: "Traffic Milestone",
        message: "Your site has reached 45,000 monthly visitors!",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        read: true,
      },
    ];

    setAlerts(demoAlerts);
    setLoading(false);
  }

  function markAsRead(id: string) {
    setAlerts(prev => prev.map(a =>
      a.id === id ? { ...a, read: true } : a
    ));
  }

  function markAllAsRead() {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }

  function deleteAlert(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  function getAlertIcon(type: string) {
    if (type === "critical") return <XCircle size={18} className="text-red-400" />;
    if (type === "warning") return <AlertTriangle size={18} className="text-amber-400" />;
    return <CheckCircle size={18} className="text-blue-400" />;
  }

  function getAlertBg(type: string, read: boolean) {
    if (read) return "bg-slate-900/40 border-slate-800";
    if (type === "critical") return "bg-red-500/5 border-red-500/20";
    if (type === "warning") return "bg-amber-500/5 border-amber-500/20";
    return "bg-blue-500/5 border-blue-500/20";
  }

  const filteredAlerts = alerts.filter(a => {
    if (filter === "all") return true;
    if (filter === "unread") return !a.read;
    return a.type === filter;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            Alerts
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-sm rounded-full bg-red-500/20 text-red-400">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System notifications and alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-medium text-sm transition-colors"
          >
            <Check size={16} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "All" },
          { id: "unread", label: "Unread" },
          { id: "critical", label: "Critical" },
          { id: "warning", label: "Warnings" },
          { id: "info", label: "Info" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === f.id
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-2">No alerts</p>
          <p className="text-sm text-slate-500">
            {filter !== "all" ? "No alerts match this filter" : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border ${getAlertBg(alert.type, alert.read)} p-4 transition-colors`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-medium ${alert.read ? "text-slate-400" : ""}`}>
                        {alert.title}
                      </h3>
                      <p className={`text-sm mt-1 ${alert.read ? "text-slate-500" : "text-slate-400"}`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Globe size={12} />
                          {alert.project_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
