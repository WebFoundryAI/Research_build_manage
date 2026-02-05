import { useState, useEffect, useCallback } from 'react';
import { callEdgeFunction } from '../lib/edgeFunctions';
import {
  Search, FileSearch, Wand2, AlertTriangle, CheckCircle, AlertCircle, Info,
  ChevronDown, ChevronUp, ExternalLink, Copy, Trash2, RefreshCw
} from 'lucide-react';

type Mode = 'audit' | 'generate' | 'history';

interface AuditIssue {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  evidence: string | null;
  page_url: string | null;
  impact: string;
  recommendation: string;
}

interface PageSignal {
  id: string;
  page_url: string;
  page_type: string;
  title: string | null;
  meta_description: string | null;
  h1_text: string | null;
  word_count: number;
  has_local_business_schema: boolean;
  has_faq_schema: boolean;
  has_geo_keywords: boolean;
  geo_keywords_found: string[];
}

interface GeoAudit {
  id: string;
  site_url: string;
  overall_score: number;
  status: string;
  pages_crawled: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  created_at: string;
  geo_audit_issues?: AuditIssue[];
  geo_page_signals?: PageSignal[];
}

interface GeneratedContent {
  id: string;
  business_name: string;
  primary_city: string;
  content_type: string;
  status: string;
  meta_title: string;
  meta_description: string;
  answer_capsule: string;
  faqs: { question: string; answer: string }[];
  created_at: string;
  generated_html?: string;
  generated_markdown?: string;
}

const PRIORITY_CONFIG = {
  critical: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, label: 'Critical' },
  high: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle, label: 'High' },
  medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Info, label: 'Medium' },
  low: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Info, label: 'Low' },
};

function ScoreGauge({ score }: { score: number }) {
  let color = 'text-red-500';
  if (score >= 80) color = 'text-emerald-500';
  else if (score >= 60) color = 'text-amber-500';
  else if (score >= 40) color = 'text-orange-500';

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={`${score * 2.51} 251`}
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
      </div>
    </div>
  );
}

function IssueBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.low;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

export default function ResearchPage() {
  const [mode, setMode] = useState<Mode>('audit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Audit state
  const [auditUrl, setAuditUrl] = useState('');
  const [currentAudit, setCurrentAudit] = useState<GeoAudit | null>(null);
  const [auditHistory, setAuditHistory] = useState<GeoAudit[]>([]);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  // Generate state
  const [businessName, setBusinessName] = useState('');
  const [primaryCity, setPrimaryCity] = useState('');
  const [services, setServices] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [contentHistory, setContentHistory] = useState<GeneratedContent[]>([]);

  const loadAuditHistory = useCallback(async () => {
    const result = await callEdgeFunction('geo-audit');
    if (result.ok && result.json) {
      const data = result.json as { audits: GeoAudit[] };
      setAuditHistory(data.audits || []);
    }
  }, []);

  const loadContentHistory = useCallback(async () => {
    const result = await callEdgeFunction('geo-content');
    if (result.ok && result.json) {
      const data = result.json as { contents: GeneratedContent[] };
      setContentHistory(data.contents || []);
    }
  }, []);

  useEffect(() => {
    loadAuditHistory();
    loadContentHistory();
  }, [loadAuditHistory, loadContentHistory]);

  const runAudit = async () => {
    if (!auditUrl.trim()) {
      setError('Please enter a URL to audit');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setCurrentAudit(null);

    const result = await callEdgeFunction('geo-audit', {
      site_url: auditUrl,
      audit_type: 'full',
    });

    if (result.ok && result.json) {
      setCurrentAudit(result.json as GeoAudit);
      setSuccess('Audit completed successfully!');
      loadAuditHistory();
    } else {
      setError(result.error || 'Audit failed');
    }

    setLoading(false);
  };

  const generateContent = async () => {
    if (!businessName.trim() || !primaryCity.trim() || !services.trim()) {
      setError('Business name, city, and at least one service are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setGeneratedContent(null);

    const result = await callEdgeFunction('geo-content', {
      business_name: businessName,
      primary_city: primaryCity,
      primary_services: services.split(',').map(s => s.trim()).filter(Boolean),
      service_areas: serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
      phone: phone || undefined,
      email: email || undefined,
      use_ai: useAI,
      content_type: 'full_package',
    });

    if (result.ok && result.json) {
      setGeneratedContent(result.json as GeneratedContent);
      setSuccess('Content generated successfully!');
      loadContentHistory();
    } else {
      setError(result.error || 'Generation failed');
    }

    setLoading(false);
  };

  const deleteAudit = async (auditId: string) => {
    if (!confirm('Delete this audit?')) return;
    await callEdgeFunction('geo-audit', { id: auditId, _method: 'DELETE' });
    loadAuditHistory();
    if (currentAudit?.id === auditId) setCurrentAudit(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Research & SEO Tools</h1>
        <p className="text-sm text-slate-600 mt-1">
          GEO audit and content generation for local business websites.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setMode('audit')}
          className={`px-4 py-2 text-sm rounded-t-lg flex items-center gap-2 ${mode === 'audit' ? 'bg-white border border-b-0 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <FileSearch size={16} />
          GEO Audit
        </button>
        <button
          onClick={() => setMode('generate')}
          className={`px-4 py-2 text-sm rounded-t-lg flex items-center gap-2 ${mode === 'generate' ? 'bg-white border border-b-0 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Wand2 size={16} />
          Generate Content
        </button>
        <button
          onClick={() => setMode('history')}
          className={`px-4 py-2 text-sm rounded-t-lg flex items-center gap-2 ${mode === 'history' ? 'bg-white border border-b-0 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Search size={16} />
          History ({auditHistory.length + contentHistory.length})
        </button>
      </div>

      {/* Audit Mode */}
      {mode === 'audit' && (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <h2 className="font-semibold mb-4">Run GEO Audit</h2>
            <div className="flex gap-3">
              <input
                type="url"
                value={auditUrl}
                onChange={(e) => setAuditUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 rounded-xl border text-sm"
              />
              <button
                onClick={runAudit}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Auditing...
                  </>
                ) : (
                  <>
                    <FileSearch size={16} />
                    Run Audit
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Analyzes GEO readiness, schema markup, content quality, and provides improvement suggestions.
            </p>
          </div>

          {currentAudit && (
            <div className="space-y-4">
              {/* Score Overview */}
              <div className="rounded-2xl border bg-white p-6 shadow-soft">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ScoreGauge score={currentAudit.overall_score} />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{currentAudit.site_url}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {currentAudit.pages_crawled} pages analyzed
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <div className="text-center px-4 py-2 rounded-lg bg-red-50">
                        <div className="text-xl font-bold text-red-600">{currentAudit.critical_issues}</div>
                        <div className="text-xs text-red-600">Critical</div>
                      </div>
                      <div className="text-center px-4 py-2 rounded-lg bg-orange-50">
                        <div className="text-xl font-bold text-orange-600">{currentAudit.high_issues}</div>
                        <div className="text-xs text-orange-600">High</div>
                      </div>
                      <div className="text-center px-4 py-2 rounded-lg bg-amber-50">
                        <div className="text-xl font-bold text-amber-600">{currentAudit.medium_issues}</div>
                        <div className="text-xs text-amber-600">Medium</div>
                      </div>
                      <div className="text-center px-4 py-2 rounded-lg bg-blue-50">
                        <div className="text-xl font-bold text-blue-600">{currentAudit.low_issues}</div>
                        <div className="text-xs text-blue-600">Low</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues List */}
              {currentAudit.geo_audit_issues && currentAudit.geo_audit_issues.length > 0 && (
                <div className="rounded-2xl border bg-white p-6 shadow-soft">
                  <h3 className="font-semibold mb-4">Issues Found ({currentAudit.geo_audit_issues.length})</h3>
                  <div className="space-y-3">
                    {currentAudit.geo_audit_issues.map((issue) => (
                      <div key={issue.id} className="border rounded-xl overflow-hidden">
                        <div
                          className="p-4 cursor-pointer hover:bg-slate-50 flex items-start justify-between gap-4"
                          onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <IssueBadge priority={issue.priority} />
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{issue.category}</span>
                            </div>
                            <h4 className="font-medium mt-2">{issue.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
                          </div>
                          {expandedIssue === issue.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        {expandedIssue === issue.id && (
                          <div className="border-t p-4 bg-slate-50 space-y-3">
                            {issue.evidence && (
                              <div>
                                <div className="text-xs font-medium text-slate-500">Evidence</div>
                                <code className="text-sm bg-slate-200 px-2 py-1 rounded">{issue.evidence}</code>
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-medium text-slate-500">Impact</div>
                              <p className="text-sm">{issue.impact}</p>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-slate-500">Recommendation</div>
                              <p className="text-sm text-emerald-700">{issue.recommendation}</p>
                            </div>
                            {issue.page_url && (
                              <a
                                href={issue.page_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                              >
                                <ExternalLink size={14} />
                                View Page
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Generate Mode */}
      {mode === 'generate' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <h2 className="font-semibold mb-4">Business Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Plumbing Ltd"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Primary City *</label>
                <input
                  type="text"
                  value={primaryCity}
                  onChange={(e) => setPrimaryCity(e.target.value)}
                  placeholder="Manchester"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Services * (comma-separated)</label>
                <input
                  type="text"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="Plumbing, Boiler Repair, Emergency Plumber"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Service Areas (comma-separated)</label>
                <input
                  type="text"
                  value={serviceAreas}
                  onChange={(e) => setServiceAreas(e.target.value)}
                  placeholder="Salford, Stockport, Bolton"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0161 123 4567"
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@example.com"
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Enhance with AI (uses OpenAI)</span>
              </label>
              <button
                onClick={generateContent}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Generate GEO Content
                  </>
                )}
              </button>
            </div>
          </div>

          {generatedContent && (
            <div className="rounded-2xl border bg-white p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Generated Content</h2>
                <button
                  onClick={() => copyToClipboard(generatedContent.generated_markdown || '')}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                  title="Copy markdown"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="text-xs font-medium text-slate-500 mb-1">Meta Title</div>
                  <p className="text-sm font-medium">{generatedContent.meta_title}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="text-xs font-medium text-slate-500 mb-1">Meta Description</div>
                  <p className="text-sm">{generatedContent.meta_description}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <div className="text-xs font-medium text-blue-600 mb-1">Answer Capsule (for AI)</div>
                  <p className="text-sm">{generatedContent.answer_capsule}</p>
                </div>
                {generatedContent.faqs && generatedContent.faqs.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2">FAQs</div>
                    <div className="space-y-2">
                      {generatedContent.faqs.slice(0, 3).map((faq, i) => (
                        <details key={i} className="border rounded-lg">
                          <summary className="p-2 text-sm font-medium cursor-pointer">{faq.question}</summary>
                          <p className="p-2 pt-0 text-sm text-slate-600">{faq.answer}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Mode */}
      {mode === 'history' && (
        <div className="space-y-6">
          {/* Audit History */}
          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <h2 className="font-semibold mb-4">Recent Audits ({auditHistory.length})</h2>
            {auditHistory.length === 0 ? (
              <p className="text-sm text-slate-500">No audits yet. Run your first audit above.</p>
            ) : (
              <div className="space-y-3">
                {auditHistory.slice(0, 10).map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        audit.overall_score >= 80 ? 'bg-emerald-100 text-emerald-600' :
                        audit.overall_score >= 60 ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {audit.overall_score}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{audit.site_url}</div>
                        <div className="text-xs text-slate-500">
                          {formatDate(audit.created_at)} | {audit.pages_crawled} pages | {audit.critical_issues + audit.high_issues + audit.medium_issues + audit.low_issues} issues
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const result = await callEdgeFunction('geo-audit', { id: audit.id });
                          if (result.ok && result.json) {
                            setCurrentAudit(result.json as GeoAudit);
                            setMode('audit');
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                        title="View details"
                      >
                        <Search size={16} />
                      </button>
                      <button
                        onClick={() => deleteAudit(audit.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content History */}
          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <h2 className="font-semibold mb-4">Generated Content ({contentHistory.length})</h2>
            {contentHistory.length === 0 ? (
              <p className="text-sm text-slate-500">No content generated yet.</p>
            ) : (
              <div className="space-y-3">
                {contentHistory.slice(0, 10).map((content) => (
                  <div key={content.id} className="p-3 border rounded-xl hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{content.business_name}</div>
                        <div className="text-xs text-slate-500">
                          {content.primary_city} | {formatDate(content.created_at)}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        content.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        content.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {content.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{content.meta_description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
