import React, { useState } from "react";
import {
  FileBarChart,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Download,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";

type SummaryData = {
  trafficTotal: number;
  trafficChange: number;
  trafficTrend: "up" | "down";
  revenueTotal: number;
  revenueChange: number;
  revenueTrend: "up" | "down";
  healthAvg: number;
  healthChange: number;
  healthTrend: "up" | "down";
};

type ProjectBreakdown = {
  name: string;
  traffic: number;
  revenue: number;
  health: number;
};

type TimeRange = "7d" | "30d" | "90d" | "12m";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const summaryData: SummaryData | null = null;
  const projectsData: ProjectBreakdown[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-slate-400 mt-1">
            Portfolio analytics and performance insights
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-white font-medium text-sm transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryData ? (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users size={20} className="text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${summaryData.trafficTrend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                {summaryData.trafficTrend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {summaryData.trafficChange}%
              </div>
            </div>
            <div className="text-3xl font-bold">{summaryData.trafficTotal.toLocaleString()}</div>
            <div className="text-sm text-slate-400 mt-1">Total Traffic</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <DollarSign size={20} className="text-emerald-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${summaryData.revenueTrend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                {summaryData.revenueTrend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {summaryData.revenueChange}%
              </div>
            </div>
            <div className="text-3xl font-bold">${summaryData.revenueTotal.toLocaleString()}</div>
            <div className="text-sm text-slate-400 mt-1">Total Revenue</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Activity size={20} className="text-purple-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${summaryData.healthTrend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                {summaryData.healthTrend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(summaryData.healthChange)}%
              </div>
            </div>
            <div className="text-3xl font-bold">{summaryData.healthAvg}</div>
            <div className="text-sm text-slate-400 mt-1">Avg Health Score</div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No report data yet"
          description="Connect analytics sources to populate performance summaries."
        />
      )}

      {/* Traffic Chart Placeholder */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold mb-4">Traffic Trend</h2>
        <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
          <div className="text-center text-slate-500">
            <FileBarChart size={40} className="mx-auto mb-2" />
            <p className="text-sm">Traffic chart will be displayed here</p>
            <p className="text-xs mt-1">Connect analytics to view real data</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold mb-4">Revenue Trend</h2>
        <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
          <div className="text-center text-slate-500">
            <DollarSign size={40} className="mx-auto mb-2" />
            <p className="text-sm">Revenue chart will be displayed here</p>
            <p className="text-xs mt-1">Connect payment data to view trends</p>
          </div>
        </div>
      </div>

      {/* Project Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold">Project Breakdown</h2>
        </div>
        {projectsData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-3 font-medium text-slate-400">Project</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-right">Traffic</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-right">Health</th>
                </tr>
              </thead>
              <tbody>
                {projectsData.map((project, i) => (
                  <tr key={i} className="border-b border-slate-200 hover:bg-slate-100/30">
                    <td className="px-4 py-3 font-medium">{project.name}</td>
                    <td className="px-4 py-3 text-right">{project.traffic.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">${project.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`${project.health >= 80 ? "text-emerald-600" : project.health >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {project.health}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No project data"
              description="Connect project analytics to see per-asset performance."
            />
          </div>
        )}
      </div>
    </div>
  );
}
