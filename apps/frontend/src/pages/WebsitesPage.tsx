import { useState, useEffect, useCallback } from 'react';
import { callEdgeFunction } from '../lib/edgeFunctions';
import type { Website, WebsitesSummary, SeoHealthCheck, Keyword, SITE_CATEGORIES } from '../lib/types';
import { Plus, RefreshCw, Globe, Activity, Shield, Search, Trash2, Edit, ExternalLink, X } from 'lucide-react';

type TabId = 'overview' | 'seo' | 'keywords' | 'rankings' | 'history';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'business', label: 'Business' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'blog', label: 'Blog' },
  { value: 'portfolio', label: 'Portfolio' },
];

function StatusBadge({ isLive, statusCode }: { isLive?: boolean; statusCode?: number | null }) {
  if (isLive === undefined) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">Unknown</span>;
  }
  if (isLive) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">Live {statusCode && `(${statusCode})`}</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200">Down {statusCode && `(${statusCode})`}</span>;
}

function SeoScoreBadge({ score }: { score?: number }) {
  if (score === undefined) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">—</span>;
  }
  if (score >= 80) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">{score}</span>;
  }
  if (score >= 50) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">{score}</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200">{score}</span>;
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 mb-8">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function SeoHealthItem({ label, pass, value }: { label: string; pass: boolean; value?: string }) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-lg ${pass ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
      <span className="font-medium">{label}</span>
      <span className="text-slate-600">{value || (pass ? 'Pass' : 'Fail')}</span>
    </div>
  );
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [summary, setSummary] = useState<WebsitesSummary>({ total: 0, live: 0, down: 0, avgSeoScore: 0 });
  const [loading, setLoading] = useState(true);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [seoCheckingId, setSeoCheckingId] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Form states
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Keywords state
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeywordLocation, setNewKeywordLocation] = useState('United Kingdom');

  // SEO health state
  const [seoHealth, setSeoHealth] = useState<SeoHealthCheck | null>(null);

  // Status history state
  const [statusHistory, setStatusHistory] = useState<any[]>([]);

  const loadWebsites = useCallback(async () => {
    setLoading(true);
    const result = await callEdgeFunction('websites', {});
    if (result.ok && result.json) {
      const data = result.json as { websites: Website[]; summary: WebsitesSummary };
      setWebsites(data.websites || []);
      setSummary(data.summary || { total: 0, live: 0, down: 0, avgSeoScore: 0 });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWebsites();
  }, [loadWebsites]);

  const handleAddOrEdit = async () => {
    if (!formUrl.trim()) return;

    if (editingId) {
      await callEdgeFunction('websites', {
        id: editingId,
        name: formName || formUrl,
        url: formUrl,
        category: formCategory,
      });
    } else {
      await callEdgeFunction('websites', {
        name: formName || formUrl,
        url: formUrl,
        category: formCategory,
      });
    }

    setShowAddModal(false);
    resetForm();
    loadWebsites();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this website?')) return;
    await callEdgeFunction('websites', { id });
    loadWebsites();
    if (selectedWebsite?.id === id) {
      setShowDetailModal(false);
      setSelectedWebsite(null);
    }
  };

  const handleCheck = async (website: Website) => {
    setCheckingId(website.id);
    await callEdgeFunction('website-check', {
      website_id: website.id,
      url: website.url,
    });
    await loadWebsites();
    setCheckingId(null);
  };

  const handleSeoCheck = async (website: Website) => {
    setSeoCheckingId(website.id);
    const result = await callEdgeFunction('website-seo-health', {
      website_id: website.id,
      url: website.url,
    });
    if (result.ok && result.json) {
      setSeoHealth(result.json as SeoHealthCheck);
    }
    await loadWebsites();
    setSeoCheckingId(null);
  };

  const handleRunAllChecks = async () => {
    for (const website of websites) {
      await handleCheck(website);
    }
  };

  const openDetail = async (website: Website) => {
    setSelectedWebsite(website);
    setShowDetailModal(true);
    setActiveTab('overview');

    // Load keywords
    const keywordsResult = await callEdgeFunction('keywords', { website_id: website.id });
    if (keywordsResult.ok && keywordsResult.json) {
      setKeywords((keywordsResult.json as { keywords: Keyword[] }).keywords || []);
    }

    // Load SEO health (latest)
    if (website.seo_health_checks?.[0]) {
      setSeoHealth(website.seo_health_checks[0]);
    } else {
      setSeoHealth(null);
    }

    // Load status history
    if (website.status_checks) {
      setStatusHistory(website.status_checks);
    }
  };

  const openEdit = (website: Website) => {
    setEditingId(website.id);
    setFormName(website.name || '');
    setFormUrl(website.url);
    setFormCategory(website.category || 'general');
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormCategory('general');
    setEditingId(null);
  };

  const handleAddKeyword = async () => {
    if (!selectedWebsite || !newKeyword.trim()) return;
    await callEdgeFunction('keywords', {
      website_id: selectedWebsite.id,
      keyword: newKeyword,
      location: newKeywordLocation,
    });
    const result = await callEdgeFunction('keywords', { website_id: selectedWebsite.id });
    if (result.ok && result.json) {
      setKeywords((result.json as { keywords: Keyword[] }).keywords || []);
    }
    setNewKeyword('');
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    await callEdgeFunction('keywords', { id: keywordId });
    setKeywords(keywords.filter(k => k.id !== keywordId));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Website Monitor</h1>
          <p className="text-sm text-slate-600 mt-1">Track availability, SEO health, and performance for your website portfolio.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500 uppercase">Total Sites</div>
          <div className="text-3xl font-bold mt-1">{summary.total}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500 uppercase">Live</div>
          <div className="text-3xl font-bold mt-1 text-emerald-600">{summary.live}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500 uppercase">Down</div>
          <div className="text-3xl font-bold mt-1 text-red-600">{summary.down}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500 uppercase">Avg SEO Score</div>
          <div className="text-3xl font-bold mt-1 text-blue-600">{summary.avgSeoScore}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleRunAllChecks}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          <RefreshCw size={16} /> Run All Checks
        </button>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus size={16} /> Add Website
        </button>
      </div>

      {/* Websites Table */}
      <div className="rounded-2xl border bg-white shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading websites...</div>
        ) : websites.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No websites added yet. Click "Add Website" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="py-3 px-4 font-medium">Website</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">SEO Score</th>
                  <th className="py-3 px-4 font-medium">Response Time</th>
                  <th className="py-3 px-4 font-medium">Last Checked</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {websites.map((website) => {
                  const latestStatus = website.status_checks?.[0];
                  const latestSeo = website.seo_health_checks?.[0];
                  return (
                    <tr key={website.id} className="border-t hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openDetail(website)}
                          className="text-left hover:underline"
                        >
                          <div className="font-medium">{website.name || website.url}</div>
                          <div className="text-xs text-slate-500">{website.url}</div>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge isLive={latestStatus?.is_live} statusCode={latestStatus?.status_code} />
                      </td>
                      <td className="py-3 px-4">
                        <SeoScoreBadge score={latestSeo?.health_score} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {latestStatus?.response_time_ms ? `${latestStatus.response_time_ms}ms` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {formatDate(website.last_checked_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCheck(website)}
                            disabled={checkingId === website.id}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="Check availability"
                          >
                            {checkingId === website.id ? <RefreshCw size={16} className="animate-spin" /> : <Activity size={16} />}
                          </button>
                          <button
                            onClick={() => handleSeoCheck(website)}
                            disabled={seoCheckingId === website.id}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="Run SEO check"
                          >
                            {seoCheckingId === website.id ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
                          </button>
                          <button
                            onClick={() => openEdit(website)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(website.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title={editingId ? 'Edit Website' : 'Add Website'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name (optional)</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="My Website"
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
            <input
              type="text"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="px-4 py-2 rounded-xl border hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddOrEdit}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              {editingId ? 'Save Changes' : 'Add Website'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedWebsite(null); }}
        title={selectedWebsite?.name || selectedWebsite?.url || 'Website Details'}
      >
        {selectedWebsite && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b pb-2 overflow-x-auto">
              {(['overview', 'seo', 'keywords', 'history'] as TabId[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    activeTab === tab ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">URL</div>
                    <a href={`https://${selectedWebsite.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      {selectedWebsite.url} <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Category</div>
                    <div className="font-medium">{selectedWebsite.category || 'General'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Status</div>
                    <StatusBadge
                      isLive={selectedWebsite.status_checks?.[0]?.is_live}
                      statusCode={selectedWebsite.status_checks?.[0]?.status_code}
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Response Time</div>
                    <div className="font-medium">
                      {selectedWebsite.status_checks?.[0]?.response_time_ms
                        ? `${selectedWebsite.status_checks[0].response_time_ms}ms`
                        : '—'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCheck(selectedWebsite)}
                    disabled={checkingId === selectedWebsite.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-slate-50"
                  >
                    {checkingId === selectedWebsite.id ? <RefreshCw size={16} className="animate-spin" /> : <Activity size={16} />}
                    Check Availability
                  </button>
                  <button
                    onClick={() => handleSeoCheck(selectedWebsite)}
                    disabled={seoCheckingId === selectedWebsite.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-slate-50"
                  >
                    {seoCheckingId === selectedWebsite.id ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
                    Run SEO Check
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-3">
                {seoHealth ? (
                  <>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className="text-xs text-slate-500">Health Score</div>
                      <div className="text-4xl font-bold mt-1">
                        <SeoScoreBadge score={seoHealth.health_score} />
                      </div>
                      <div className="text-xs text-slate-500 mt-2">Last checked: {formatDate(seoHealth.checked_at)}</div>
                    </div>
                    <SeoHealthItem label="Robots.txt exists" pass={seoHealth.robots_txt_exists} />
                    <SeoHealthItem label="Robots.txt valid" pass={seoHealth.robots_txt_valid} />
                    <SeoHealthItem label="Allows crawling" pass={seoHealth.robots_txt_allows_crawl} />
                    <SeoHealthItem label="Sitemap exists" pass={seoHealth.sitemap_exists} value={seoHealth.sitemap_url || undefined} />
                    <SeoHealthItem label="Sitemap valid" pass={seoHealth.sitemap_valid} value={seoHealth.sitemap_url_count ? `${seoHealth.sitemap_url_count} URLs` : undefined} />
                    <SeoHealthItem label="SSL valid" pass={seoHealth.ssl_valid} />
                  </>
                ) : (
                  <div className="text-center p-8 text-slate-500">
                    No SEO health data yet. Run an SEO check to analyze this website.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'keywords' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    className="flex-1 px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newKeywordLocation}
                    onChange={(e) => setNewKeywordLocation(e.target.value)}
                    className="px-3 py-2 rounded-xl border"
                  >
                    <option value="United Kingdom">UK</option>
                    <option value="United States">US</option>
                    <option value="Australia">AU</option>
                    <option value="Canada">CA</option>
                  </select>
                  <button
                    onClick={handleAddKeyword}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>
                {keywords.length === 0 ? (
                  <div className="text-center p-8 text-slate-500">No keywords tracked yet.</div>
                ) : (
                  <div className="space-y-2">
                    {keywords.map((kw) => (
                      <div key={kw.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-medium">{kw.keyword}</div>
                          <div className="text-xs text-slate-500">{kw.location}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteKeyword(kw.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-2">
                {statusHistory.length === 0 ? (
                  <div className="text-center p-8 text-slate-500">No check history yet.</div>
                ) : (
                  statusHistory.slice(0, 20).map((check, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <StatusBadge isLive={check.is_live} statusCode={check.status_code} />
                        <span className="text-slate-600">{check.response_time_ms}ms</span>
                      </div>
                      <div className="text-xs text-slate-500">{formatDate(check.checked_at)}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
