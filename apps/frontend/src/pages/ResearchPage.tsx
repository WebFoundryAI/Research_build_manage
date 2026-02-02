import { useState } from 'react';

type Mode = 'geo' | 'audit';

export default function ResearchPage() {
  const [mode, setMode] = useState<Mode>('geo');
  const [keyword, setKeyword] = useState('blocked drain manchester');
  const [domain, setDomain] = useState('manchesterblockeddrain.co.uk');
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<string>('');

  async function run() {
    setBusy(true);
    setOut('');
    try {
      const url =
        mode === 'geo'
          ? `/geo_generate?keyword=${encodeURIComponent(keyword)}`
          : `/seo_audit?domain=${encodeURIComponent(domain)}`;
      const res = await fetch(url);
      const json = await res.json();
      setOut(JSON.stringify(json, null, 2));
    } catch (e: any) {
      setOut(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Research</h1>
        <p className="text-sm text-slate-600 mt-1">
          GEO content generation and technical SEO audit entry points (wired to Cloudflare Pages Functions).
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-soft">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMode('geo')}
            className={`px-3 py-1.5 rounded-xl text-sm border ${
              mode === 'geo' ? 'bg-slate-900 text-white border-slate-900' : 'hover:bg-slate-50'
            }`}
          >
            GEO content
          </button>
          <button
            onClick={() => setMode('audit')}
            className={`px-3 py-1.5 rounded-xl text-sm border ${
              mode === 'audit' ? 'bg-slate-900 text-white border-slate-900' : 'hover:bg-slate-50'
            }`}
          >
            SEO audit
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {mode === 'geo' ? (
            <>
              <div className="md:col-span-2">
                <div className="text-xs text-slate-500 mb-1">Seed keyword</div>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>
              <div className="md:col-span-1 flex items-end">
                <button
                  onClick={run}
                  disabled={busy}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 text-white"
                >
                  {busy ? 'Running…' : 'Generate'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2">
                <div className="text-xs text-slate-500 mb-1">Domain</div>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>
              <div className="md:col-span-1 flex items-end">
                <button
                  onClick={run}
                  disabled={busy}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 text-white"
                >
                  {busy ? 'Running…' : 'Audit'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-slate-950 text-slate-100 p-4 shadow-soft">
        <div className="text-sm font-medium">Output</div>
        <pre className="mt-3 text-xs overflow-x-auto min-h-40">{out || '—'}</pre>
      </div>
    </div>
  );
}
