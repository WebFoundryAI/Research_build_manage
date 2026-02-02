import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const trend = [
  { day: 'Mon', audits: 12, up: 98.9 },
  { day: 'Tue', audits: 18, up: 99.1 },
  { day: 'Wed', audits: 21, up: 99.4 },
  { day: 'Thu', audits: 16, up: 99.3 },
  { day: 'Fri', audits: 25, up: 99.7 },
  { day: 'Sat', audits: 14, up: 99.2 },
  { day: 'Sun', audits: 19, up: 99.5 },
];

const recent = [
  { ts: '2026-02-02 12:55', type: 'SEO Audit', target: 'manchesterblockeddrain.co.uk', status: 'ok' },
  { ts: '2026-02-02 12:41', type: 'Asset Check', target: 'swindonblockeddrains.co.uk', status: 'warn' },
  { ts: '2026-02-02 11:20', type: 'GEO Content', target: 'blocked-drains-manchester', status: 'ok' },
];

function Card({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-soft">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-slate-500 mt-2">{note}</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">
          Portfolio health, research throughput, and automation activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Tracked sites" value="12" note="monitored in last 24h" />
        <Card title="Uptime" value="99.5%" note="7-day rolling average" />
        <Card title="Audits" value="125" note="completed this week" />
        <Card title="Credits" value="1,420" note="cost model stub (admin)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="text-sm font-medium">Audit volume</div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: 0, right: 16, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="audits" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="text-sm font-medium">Uptime trend</div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: 0, right: 16, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[98, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="up" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Recent activity</div>
            <div className="text-xs text-slate-500">Latest automation runs (stub)</div>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Time</th>
                <th>Type</th>
                <th>Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.ts} className="border-t">
                  <td className="py-2">{r.ts}</td>
                  <td>{r.type}</td>
                  <td className="font-medium">{r.target}</td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                        r.status === 'ok'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
