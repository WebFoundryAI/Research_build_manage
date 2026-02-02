import { useMemo, useState } from 'react';

type Site = {
  id: string;
  domain: string;
  live: boolean;
  lastChecked: string;
  note: string;
};

const seed: Site[] = [
  { id: '1', domain: 'manchesterblockeddrain.co.uk', live: true, lastChecked: '2026-02-02 12:41', note: 'Astro rebuild' },
  { id: '2', domain: 'swindonblockeddrains.co.uk', live: true, lastChecked: '2026-02-02 12:41', note: 'Rank-to-rent' },
];

export default function WebsitesPage() {
  const [sites, setSites] = useState<Site[]>(seed);
  const [domain, setDomain] = useState('');
  const [running, setRunning] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const count = useMemo(() => sites.length, [sites.length]);

  async function runCheck(site: Site) {
    setRunning(site.id);
    setLastResult(null);
    try {
      const res = await fetch(`/monitor_check?domain=${encodeURIComponent(site.domain)}`);
      const json = await res.json();
      setLastResult(JSON.stringify(json, null, 2));
      setSites((prev) =>
        prev.map((s) =>
          s.id === site.id ? { ...s, live: Boolean(json?.ok), lastChecked: new Date().toISOString() } : s
        )
      );
    } catch (e: any) {
      setLastResult(String(e?.message ?? e));
    } finally {
      setRunning(null);
    }
  }

  function addSite() {
    const d = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!d) return;
    setSites((prev) => [
      { id: String(Date.now()), domain: d, live: false, lastChecked: '—', note: '' },
      ...prev,
    ]);
    setDomain('');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Websites</h1>
          <p className="text-sm text-slate-600 mt-1">Track live status, build health, and automation runs.</p>
        </div>
        <div className="rounded-2xl border bg-white px-4 py-2 shadow-soft text-sm">
          <span className="text-slate-500">Total</span> <span className="font-semibold">{count}</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-soft">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Add domain (e.g., example.co.uk)"
            className="flex-1 px-3 py-2 rounded-xl border"
          />
          <button onClick={addSite} className="px-4 py-2 rounded-xl bg-slate-900 text-white">
            Add site
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Domain</th>
              <th>Live</th>
              <th>Last checked</th>
              <th>Note</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="py-2 font-medium">{s.domain}</td>
                <td>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                      s.live
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {s.live ? 'up' : 'unknown'}
                  </span>
                </td>
                <td className="text-slate-600">{s.lastChecked}</td>
                <td className="text-slate-600">{s.note}</td>
                <td className="text-right">
                  <button
                    onClick={() => runCheck(s)}
                    className="px-3 py-1.5 rounded-xl border hover:bg-slate-50"
                    disabled={running === s.id}
                  >
                    {running === s.id ? 'Checking…' : 'Run check'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lastResult && (
        <div className="rounded-2xl border bg-slate-950 text-slate-100 p-4 shadow-soft">
          <div className="text-sm font-medium">Latest check payload</div>
          <pre className="mt-3 text-xs overflow-x-auto">{lastResult}</pre>
        </div>
      )}
    </div>
  );
}
