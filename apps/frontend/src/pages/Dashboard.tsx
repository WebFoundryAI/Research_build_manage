import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

const lineData = [
  { day: "Mon", impressions: 1200, clicks: 34 },
  { day: "Tue", impressions: 1800, clicks: 41 },
  { day: "Wed", impressions: 1400, clicks: 38 },
  { day: "Thu", impressions: 2200, clicks: 55 },
  { day: "Fri", impressions: 2600, clicks: 63 },
  { day: "Sat", impressions: 1900, clicks: 46 },
  { day: "Sun", impressions: 2400, clicks: 59 },
];

const barData = [
  { name: "Live", value: 18 },
  { name: "Staging", value: 6 },
  { name: "Broken", value: 3 },
];

const sites = [
  { domain: "manchesterblockeddrain.co.uk", live: true, gsc: "connected", ga: "pending", lastCheck: "2h ago" },
  { domain: "bristolemergencyplumber.co.uk", live: true, gsc: "pending", ga: "pending", lastCheck: "6h ago" },
  { domain: "swindonblockeddrains.co.uk", live: false, gsc: "pending", ga: "pending", lastCheck: "—" },
];

function Card({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-xs opacity-70">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs opacity-60">{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm opacity-70">
          Unified monitoring for sites, SEO signals, research, and planned work.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card title="Total sites" value="27" sub="tracked in registry" />
        <Card title="Live" value="18" sub="passing uptime checks" />
        <Card title="Impressions (7d)" value="13.5k" sub="sample data (wire GSC next)" />
        <Card title="Clicks (7d)" value="336" sub="sample data (wire GSC next)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-sm font-semibold">Search trend (7d)</div>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="impressions" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="clicks" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-sm font-semibold">Fleet status</div>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Websites</div>
          <div className="text-xs opacity-60">Next: wire Functions → registry → checks</div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left opacity-70">
              <tr>
                <th className="py-2 pr-4">Domain</th>
                <th className="py-2 pr-4">Live</th>
                <th className="py-2 pr-4">GSC</th>
                <th className="py-2 pr-4">GA4</th>
                <th className="py-2 pr-4">Last check</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.domain} className="border-t border-slate-800/60">
                  <td className="py-2 pr-4 font-medium">{s.domain}</td>
                  <td className="py-2 pr-4">{s.live ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{s.gsc}</td>
                  <td className="py-2 pr-4">{s.ga}</td>
                  <td className="py-2 pr-4">{s.lastCheck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
