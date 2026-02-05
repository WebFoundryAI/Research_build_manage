import { useState } from "react";
import { Calendar, Clock, Plus, Trash2, Mail } from "lucide-react";

interface ScheduledReport {
  id: string;
  name: string;
  type: "keyword_tracking" | "domain_audit" | "competitor_analysis";
  frequency: "daily" | "weekly" | "monthly";
  target: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
}

export default function ScheduledReports() {
  const [reports, setReports] = useState<ScheduledReport[]>([
    {
      id: "1",
      name: "Weekly Keyword Report",
      type: "keyword_tracking",
      frequency: "weekly",
      target: "best coffee machines",
      enabled: true,
      lastRun: "2024-12-08",
      nextRun: "2024-12-15",
    },
    {
      id: "2",
      name: "Monthly Domain Audit",
      type: "domain_audit",
      frequency: "monthly",
      target: "example.com",
      enabled: false,
      nextRun: "2025-01-01",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newReport, setNewReport] = useState({
    name: "",
    type: "keyword_tracking" as "keyword_tracking" | "domain_audit" | "competitor_analysis",
    frequency: "weekly" as "daily" | "weekly" | "monthly",
    target: "",
  });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const toggleReport = (id: string) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    showFeedback("success", "Report schedule updated");
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter((r) => r.id !== id));
    showFeedback("success", "Report deleted");
  };

  const addReport = () => {
    if (!newReport.name || !newReport.target) {
      showFeedback("error", "Please fill in all fields");
      return;
    }

    const nextDate = new Date();
    if (newReport.frequency === "daily") nextDate.setDate(nextDate.getDate() + 1);
    else if (newReport.frequency === "weekly") nextDate.setDate(nextDate.getDate() + 7);
    else nextDate.setMonth(nextDate.getMonth() + 1);

    setReports([
      ...reports,
      {
        id: Date.now().toString(),
        ...newReport,
        enabled: true,
        nextRun: nextDate.toISOString().split("T")[0],
      },
    ]);

    setNewReport({ name: "", type: "keyword_tracking", frequency: "weekly", target: "" });
    setShowAddForm(false);
    showFeedback("success", "Report scheduled");
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "keyword_tracking":
        return "Keyword Tracking";
      case "domain_audit":
        return "Domain Audit";
      case "competitor_analysis":
        return "Competitor Analysis";
      default:
        return type;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {feedback && (
        <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {feedback.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Calendar className="h-6 w-6 text-blue-400" />
          Scheduled Reports
        </h1>
        <p className="text-slate-400">Automate your SEO reporting and tracking</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Your Scheduled Reports</h2>
            <p className="text-sm text-slate-400">Reports will be sent to your email automatically</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Report
          </button>
        </div>
        <div className="p-6 space-y-4">
          {showAddForm && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Report Name</label>
                  <input
                    placeholder="My Weekly Report"
                    value={newReport.name}
                    onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Target (Keyword or Domain)</label>
                  <input
                    placeholder="example.com or keyword"
                    value={newReport.target}
                    onChange={(e) => setNewReport({ ...newReport, target: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Report Type</label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport({ ...newReport, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="keyword_tracking">Keyword Tracking</option>
                    <option value="domain_audit">Domain Audit</option>
                    <option value="competitor_analysis">Competitor Analysis</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Frequency</label>
                  <select
                    value={newReport.frequency}
                    onChange={(e) => setNewReport({ ...newReport, frequency: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addReport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Create Report
                </button>
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {reports.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Report</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Type</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Frequency</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Next Run</th>
                  <th className="text-center p-3 text-slate-400 text-sm font-medium">Status</th>
                  <th className="w-24 text-center p-3 text-slate-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-800">
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-white">{report.name}</div>
                        <div className="text-xs text-slate-500">{report.target}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-xs bg-slate-700 rounded text-slate-300">{getTypeLabel(report.type)}</span>
                    </td>
                    <td className="p-3 text-slate-300 capitalize">{report.frequency}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Clock className="h-3 w-3" />
                        {report.nextRun}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleReport(report.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${report.enabled ? "bg-blue-600" : "bg-slate-700"}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${report.enabled ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => deleteReport(report.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-slate-500">
              No scheduled reports yet. Create one to automate your SEO tracking!
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Delivery
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-400">
            Reports will be delivered to your account email. You can configure email preferences in your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
