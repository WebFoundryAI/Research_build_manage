import { useState, useEffect, useCallback } from 'react';
import { callEdgeFunction } from '../lib/edgeFunctions';
import {
  Search, Globe, TrendingUp, BarChart3, ExternalLink, Copy, Trash2,
  ChevronDown, ChevronUp, RefreshCw, Star, Filter
} from 'lucide-react';

interface KeywordResult {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  competitionLevel: string;
  keywordDifficulty: number | null;
}

interface SerpResult {
  position: number;
  url: string;
  domain: string;
  title: string;
  description: string;
  domainRank?: number;
  backlinks?: number;
}

interface SearchHistory {
  id: string;
  search_name: string;
  seed_keyword: string;
  country: string;
  keyword_count: number;
  serp_count: number;
  created_at: string;
  is_favorite: boolean;
}

interface DomainAudit {
  id: string;
  domain: string;
  status: string;
  domain_rank: number;
  organic_traffic: number;
  organic_keywords: number;
  created_at: string;
}

const LOCATIONS = [
  { code: 2826, name: 'United Kingdom' },
  { code: 2840, name: 'United States' },
  { code: 2036, name: 'Australia' },
  { code: 2124, name: 'Canada' },
  { code: 2276, name: 'Germany' },
  { code: 2250, name: 'France' },
];

function DifficultyBadge({ difficulty }: { difficulty: number | null }) {
  if (difficulty === null) return <span className="text-xs text-slate-400">-</span>;

  let color = 'bg-emerald-100 text-emerald-700';
  if (difficulty >= 70) color = 'bg-red-100 text-red-700';
  else if (difficulty >= 50) color = 'bg-orange-100 text-orange-700';
  else if (difficulty >= 30) color = 'bg-amber-100 text-amber-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {difficulty}
    </span>
  );
}

function CompetitionBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: 'bg-emerald-100 text-emerald-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${colors[level] || 'bg-slate-100'}`}>
      {level}
    </span>
  );
}

export default function SeoResearchPage() {
  const [activeTab, setActiveTab] = useState<'keywords' | 'serp' | 'domain' | 'history'>('keywords');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Keyword research state
  const [keywords, setKeywords] = useState('');
  const [locationCode, setLocationCode] = useState(2826);
  const [keywordResults, setKeywordResults] = useState<KeywordResult[]>([]);
  const [keywordStats, setKeywordStats] = useState({ total: 0, totalVolume: 0, avgDifficulty: 0 });

  // SERP analysis state
  const [serpKeyword, setSerpKeyword] = useState('');
  const [serpResults, setSerpResults] = useState<SerpResult[]>([]);
  const [serpStats, setSerpStats] = useState({ organicResults: 0, totalResults: 0 });

  // Domain audit state
  const [auditDomain, setAuditDomain] = useState('');
  const [domainAudits, setDomainAudits] = useState<DomainAudit[]>([]);
  const [currentAudit, setCurrentAudit] = useState<DomainAudit | null>(null);

  // History state
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  const loadHistory = useCallback(async () => {
    const result = await callEdgeFunction('keyword-research');
    if (result.ok && result.json) {
      const data = result.json as { searches: SearchHistory[] };
      setSearchHistory(data.searches || []);
    }
  }, []);

  const loadDomainAudits = useCallback(async () => {
    const result = await callEdgeFunction('domain-seo-audit');
    if (result.ok && result.json) {
      const data = result.json as { audits: DomainAudit[] };
      setDomainAudits(data.audits || []);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    loadDomainAudits();
  }, [loadHistory, loadDomainAudits]);

  const runKeywordResearch = async () => {
    const keywordList = keywords.split('\n').map(k => k.trim()).filter(Boolean);
    if (keywordList.length === 0) {
      setError('Please enter at least one keyword');
      return;
    }

    setLoading(true);
    setError(null);
    setKeywordResults([]);

    const result = await callEdgeFunction('keyword-research', {
      keywords: keywordList,
      location_code: locationCode,
      language_code: 'en',
      fetch_difficulty: true,
    });

    if (result.ok && result.json) {
      const data = result.json as {
        keywords: KeywordResult[];
        stats: { total: number; totalVolume: number; avgDifficulty: number };
      };
      setKeywordResults(data.keywords || []);
      setKeywordStats(data.stats || { total: 0, totalVolume: 0, avgDifficulty: 0 });
      setSuccess(`Found ${data.keywords?.length || 0} keywords`);
      loadHistory();
    } else {
      setError(result.error || 'Keyword research failed');
    }

    setLoading(false);
  };

  const runSerpAnalysis = async () => {
    if (!serpKeyword.trim()) {
      setError('Please enter a keyword');
      return;
    }

    setLoading(true);
    setError(null);
    setSerpResults([]);

    const result = await callEdgeFunction('serp-analysis', {
      keyword: serpKeyword,
      location_code: locationCode,
      language_code: 'en',
      depth: 20,
      enrich_domains: true,
    });

    if (result.ok && result.json) {
      const data = result.json as {
        results: SerpResult[];
        stats: { organicResults: number; totalResults: number };
      };
      setSerpResults(data.results || []);
      setSerpStats(data.stats || { organicResults: 0, totalResults: 0 });
      setSuccess(`Analyzed ${data.results?.length || 0} results`);
    } else {
      setError(result.error || 'SERP analysis failed');
    }

    setLoading(false);
  };

  const runDomainAudit = async () => {
    if (!auditDomain.trim()) {
      setError('Please enter a domain');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await callEdgeFunction('domain-seo-audit', {
      domain: auditDomain,
      location_code: locationCode,
    });

    if (result.ok && result.json) {
      setCurrentAudit(result.json as DomainAudit);
      setSuccess('Domain audit completed');
      loadDomainAudits();
    } else {
      setError(result.error || 'Domain audit failed');
    }

    setLoading(false);
  };

  const copyKeywords = () => {
    const text = keywordResults.map(k => k.keyword).join('\n');
    navigator.clipboard.writeText(text);
    setSuccess('Keywords copied to clipboard');
    setTimeout(() => setSuccess(null), 2000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">SEO Research</h1>
        <p className="text-sm text-slate-600 mt-1">
          Keyword research, SERP analysis, and domain audits powered by DataForSEO.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('keywords')}
          className={`px-4 py-2 text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'keywords' ? 'bg-white border border-b-0 font-medium' : 'text-slate-600'}`}
        >
          <Search size={16} />
          Keywords
        </button>
        <button
          onClick={() => setActiveTab('serp')}
          className={`px-4 py-2 text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'serp' ? 'bg-white border border-b-0 font-medium' : 'text-slate-600'}`}
        >
          <TrendingUp size={16} />
          SERP
        </button>
        <button
          onClick={() => setActiveTab('domain')}
          className={`px-4 py-2 text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'domain' ? 'bg-white border border-b-0 font-medium' : 'text-slate-600'}`}
        >
          <Globe size={16} />
          Domain Audit
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm rounded-t-lg flex items-center gap-2 ${activeTab === 'history' ? 'bg-white border border-b-0 font-medium' : 'text-slate-600'}`}
        >
          <BarChart3 size={16} />
          History ({searchHistory.length})
        </button>
      </div>

      {/* Location Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Location:</label>
        <select
          value={locationCode}
          onChange={(e) => setLocationCode(parseInt(e.target.value))}
          className="px-3 py-2 rounded-xl border text-sm"
        >
          {LOCATIONS.map(loc => (
            <option key={loc.code} value={loc.code}>{loc.name}</option>
          ))}
        </select>
      </div>

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <h2 className="font-semibold mb-4">Keyword Research</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Seed Keywords (one per line)</label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="plumber manchester&#10;emergency plumber&#10;boiler repair"
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>
              <button
                onClick={runKeywordResearch}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                {loading ? 'Researching...' : 'Find Keywords'}
              </button>
            </div>
          </div>

          {keywordResults.length > 0 && (
            <div className="rounded-2xl border bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Results ({keywordResults.length})</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">
                    Total Volume: {formatNumber(keywordStats.totalVolume)}
                  </span>
                  <button onClick={copyKeywords} className="p-2 rounded-lg hover:bg-slate-100">
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Keyword</th>
                      <th className="text-right py-2 px-3">Volume</th>
                      <th className="text-right py-2 px-3">CPC</th>
                      <th className="text-center py-2 px-3">Competition</th>
                      <th className="text-center py-2 px-3">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywordResults.slice(0, 50).map((kw, i) => (
                      <tr key={i} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium">{kw.keyword}</td>
                        <td className="py-2 px-3 text-right">{formatNumber(kw.searchVolume)}</td>
                        <td className="py-2 px-3 text-right">${kw.cpc.toFixed(2)}</td>
                        <td className="py-2 px-3 text-center">
                          <CompetitionBadge level={kw.competitionLevel} />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <DifficultyBadge difficulty={kw.keywordDifficulty} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SERP Tab */}
      {activeTab === 'serp' && (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <h2 className="font-semibold mb-4">SERP Analysis</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={serpKeyword}
                onChange={(e) => setSerpKeyword(e.target.value)}
                placeholder="Enter keyword to analyze"
                className="flex-1 px-3 py-2 rounded-xl border text-sm"
              />
              <button
                onClick={runSerpAnalysis}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                Analyze
              </button>
            </div>
          </div>

          {serpResults.length > 0 && (
            <div className="rounded-2xl border bg-white p-6 shadow-soft">
              <h3 className="font-semibold mb-4">Top {serpResults.length} Results</h3>
              <div className="space-y-3">
                {serpResults.map((result, i) => (
                  <div key={i} className="p-4 border rounded-xl hover:bg-slate-50">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold">
                        {result.position}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {result.title || result.url}
                          <ExternalLink size={12} />
                        </a>
                        <div className="text-xs text-emerald-600 mt-0.5">{result.domain}</div>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{result.description}</p>
                        {(result.domainRank || result.backlinks) && (
                          <div className="flex gap-4 mt-2 text-xs text-slate-500">
                            {result.domainRank && <span>Rank: {result.domainRank}</span>}
                            {result.backlinks && <span>Backlinks: {formatNumber(result.backlinks)}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Domain Audit Tab */}
      {activeTab === 'domain' && (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <h2 className="font-semibold mb-4">Domain SEO Audit</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={auditDomain}
                onChange={(e) => setAuditDomain(e.target.value)}
                placeholder="example.com"
                className="flex-1 px-3 py-2 rounded-xl border text-sm"
              />
              <button
                onClick={runDomainAudit}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Globe size={16} />}
                Audit
              </button>
            </div>
          </div>

          {currentAudit && (
            <div className="rounded-2xl border bg-white p-6 shadow-soft">
              <h3 className="font-semibold mb-4">{currentAudit.domain}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 text-center">
                  <div className="text-2xl font-bold">{currentAudit.domain_rank || '-'}</div>
                  <div className="text-xs text-slate-500">Domain Rank</div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(currentAudit.organic_traffic || 0)}
                  </div>
                  <div className="text-xs text-slate-500">Organic Traffic</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatNumber(currentAudit.organic_keywords || 0)}
                  </div>
                  <div className="text-xs text-slate-500">Keywords</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {currentAudit.status}
                  </div>
                  <div className="text-xs text-slate-500">Status</div>
                </div>
              </div>
            </div>
          )}

          {domainAudits.length > 0 && (
            <div className="rounded-2xl border bg-white p-6 shadow-soft">
              <h3 className="font-semibold mb-4">Recent Audits</h3>
              <div className="space-y-2">
                {domainAudits.map(audit => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 cursor-pointer"
                    onClick={() => setCurrentAudit(audit)}
                  >
                    <div>
                      <div className="font-medium">{audit.domain}</div>
                      <div className="text-xs text-slate-500">{formatDate(audit.created_at)}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Traffic: {formatNumber(audit.organic_traffic || 0)}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        audit.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {audit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border bg-white p-6 shadow-soft">
          <h2 className="font-semibold mb-4">Search History</h2>
          {searchHistory.length === 0 ? (
            <p className="text-sm text-slate-500">No searches yet. Run keyword research to get started.</p>
          ) : (
            <div className="space-y-3">
              {searchHistory.map(search => (
                <div key={search.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50">
                  <div>
                    <div className="font-medium">{search.search_name}</div>
                    <div className="text-sm text-slate-600">{search.seed_keyword}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {search.keyword_count} keywords | {formatDate(search.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {search.is_favorite && <Star size={16} className="text-amber-500 fill-amber-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
