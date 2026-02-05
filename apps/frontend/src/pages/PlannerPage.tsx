import { useState, useEffect, useCallback } from 'react';
import { callEdgeFunction } from '../lib/edgeFunctions';
import { FileText, Wand2, Copy, Trash2, Eye, ChevronDown, ChevronUp, Sparkles, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  prompt_text: string;
  variables: string[];
  is_system: boolean;
  is_public: boolean;
}

interface GeneratedArticle {
  id: string;
  title: string;
  content: string;
  word_count: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  seo_score: number | null;
  meta_description: string | null;
  target_keywords: string[];
  ai_provider: string;
  ai_model: string;
  tokens_used: number;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
  { value: 'review', label: 'Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  { value: 'published', label: 'Published', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-700', icon: AlertCircle },
];

function StatusBadge({ status }: { status: string }) {
  const option = STATUS_OPTIONS.find(o => o.value === status);
  const Icon = option?.icon || FileText;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${option?.color || 'bg-slate-100'}`}>
      <Icon size={12} />
      {option?.label || status}
    </span>
  );
}

function SeoScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  let color = 'bg-red-100 text-red-700';
  if (score >= 80) color = 'bg-emerald-100 text-emerald-700';
  else if (score >= 60) color = 'bg-amber-100 text-amber-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      SEO: {score}
    </span>
  );
}

export default function PlannerPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [articles, setArticles] = useState<GeneratedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generation form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [wordCount, setWordCount] = useState(800);
  const [customPrompt, setCustomPrompt] = useState('');

  // View state
  const [activeTab, setActiveTab] = useState<'generate' | 'articles' | 'templates'>('generate');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    const result = await callEdgeFunction('prompt-templates');
    if (result.ok && result.json) {
      const data = result.json as { templates: PromptTemplate[] };
      setTemplates(data.templates || []);
    }
  }, []);

  const loadArticles = useCallback(async () => {
    const result = await callEdgeFunction('articles');
    if (result.ok && result.json) {
      const data = result.json as { articles: GeneratedArticle[] };
      setArticles(data.articles || []);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadTemplates(), loadArticles()]);
      setLoading(false);
    };
    load();
  }, [loadTemplates, loadArticles]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);

    const template = templates.find(t => t.id === selectedTemplate);
    const prompt = template?.prompt_text || customPrompt || `Write a comprehensive article about: ${topic}`;

    const result = await callEdgeFunction('content-generate', {
      prompt,
      topic,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      tone,
      word_count: wordCount,
      template_id: selectedTemplate || undefined,
    });

    if (result.ok && result.json) {
      setSuccess('Article generated successfully!');
      setTopic('');
      setKeywords('');
      setCustomPrompt('');
      loadArticles();
      setActiveTab('articles');
    } else {
      setError(result.error || 'Failed to generate content');
    }

    setGenerating(false);
  };

  const handleUpdateStatus = async (articleId: string, newStatus: string) => {
    const result = await callEdgeFunction('articles', { id: articleId, status: newStatus });
    if (result.ok) {
      loadArticles();
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Delete this article?')) return;
    const result = await callEdgeFunction('articles', { id: articleId, _delete: true });
    if (result.ok) {
      loadArticles();
      setExpandedArticle(null);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setSuccess('Content copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupedTemplates = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, PromptTemplate[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Content Generator</h1>
        <p className="text-sm text-slate-600 mt-1">Generate AI-powered articles, blog posts, and marketing copy.</p>
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
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'generate' ? 'bg-white border border-b-0 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Wand2 size={16} className="inline mr-2" />
          Generate
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'articles' ? 'bg-white border border-b-0 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <FileText size={16} className="inline mr-2" />
          Articles ({articles.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'templates' ? 'bg-white border border-b-0 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Sparkles size={16} className="inline mr-2" />
          Templates ({templates.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : (
        <>
          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="rounded-2xl border bg-white p-6 shadow-soft">
                  <h2 className="font-semibold mb-4">Generate New Content</h2>

                  <div className="space-y-4">
                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Template (optional)</label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-sm"
                      >
                        <option value="">Custom prompt...</option>
                        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                          <optgroup key={category} label={category}>
                            {categoryTemplates.map(t => (
                              <option key={t.id} value={t.id}>
                                {t.name} {t.is_system && '(System)'}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Topic */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Topic / Title *</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 10 Best Practices for React Performance"
                        className="w-full px-3 py-2 rounded-xl border text-sm"
                      />
                    </div>

                    {/* Keywords */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Keywords (comma-separated)</label>
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g., react, performance, optimization"
                        className="w-full px-3 py-2 rounded-xl border text-sm"
                      />
                    </div>

                    {/* Tone & Word Count */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tone</label>
                        <select
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border text-sm"
                        >
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="friendly">Friendly</option>
                          <option value="authoritative">Authoritative</option>
                          <option value="conversational">Conversational</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Word Count</label>
                        <input
                          type="number"
                          value={wordCount}
                          onChange={(e) => setWordCount(parseInt(e.target.value) || 800)}
                          min={200}
                          max={5000}
                          step={100}
                          className="w-full px-3 py-2 rounded-xl border text-sm"
                        />
                      </div>
                    </div>

                    {/* Custom Prompt (if no template) */}
                    {!selectedTemplate && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Custom Instructions</label>
                        <textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="Additional instructions for the AI..."
                          rows={3}
                          className="w-full px-3 py-2 rounded-xl border text-sm"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleGenerate}
                      disabled={generating || !topic.trim()}
                      className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <>
                          <span className="animate-spin">&#9696;</span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 size={18} />
                          Generate Content
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar - Recent Articles */}
              <div className="space-y-4">
                <div className="rounded-2xl border bg-white p-4 shadow-soft">
                  <h3 className="font-semibold text-sm mb-3">Recent Articles</h3>
                  {articles.slice(0, 5).length === 0 ? (
                    <p className="text-sm text-slate-500">No articles yet. Generate your first one!</p>
                  ) : (
                    <div className="space-y-2">
                      {articles.slice(0, 5).map(article => (
                        <div
                          key={article.id}
                          className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                          onClick={() => {
                            setExpandedArticle(article.id);
                            setActiveTab('articles');
                          }}
                        >
                          <div className="text-sm font-medium truncate">{article.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={article.status} />
                            <span className="text-xs text-slate-500">{article.word_count} words</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border bg-white p-4 shadow-soft">
                  <h3 className="font-semibold text-sm mb-3">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-xl font-bold">{articles.length}</div>
                      <div className="text-xs text-slate-500">Total</div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50">
                      <div className="text-xl font-bold text-emerald-600">
                        {articles.filter(a => a.status === 'published').length}
                      </div>
                      <div className="text-xs text-slate-500">Published</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50">
                      <div className="text-xl font-bold text-amber-600">
                        {articles.filter(a => a.status === 'draft').length}
                      </div>
                      <div className="text-xs text-slate-500">Drafts</div>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50">
                      <div className="text-xl font-bold text-blue-600">
                        {articles.reduce((sum, a) => sum + a.word_count, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">Total Words</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              {articles.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No articles yet.</p>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Generate Your First Article
                  </button>
                </div>
              ) : (
                articles.map(article => (
                  <div key={article.id} className="rounded-2xl border bg-white shadow-soft overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-slate-50"
                      onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{article.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <StatusBadge status={article.status} />
                            <SeoScoreBadge score={article.seo_score} />
                            <span className="text-xs text-slate-500">{article.word_count} words</span>
                            <span className="text-xs text-slate-500">{article.ai_model}</span>
                            <span className="text-xs text-slate-500">{formatDate(article.created_at)}</span>
                          </div>
                          {article.target_keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {article.target_keywords.map((kw, i) => (
                                <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyContent(article.content);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                            title="Copy content"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteArticle(article.id);
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                          {expandedArticle === article.id ? (
                            <ChevronUp size={20} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={20} className="text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedArticle === article.id && (
                      <div className="border-t p-4 bg-slate-50">
                        <div className="flex items-center gap-3 mb-4">
                          <label className="text-sm font-medium">Status:</label>
                          <select
                            value={article.status}
                            onChange={(e) => handleUpdateStatus(article.id, e.target.value)}
                            className="px-3 py-1.5 rounded-lg border text-sm"
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>

                        {article.meta_description && (
                          <div className="mb-4 p-3 rounded-lg bg-white border">
                            <div className="text-xs font-medium text-slate-500 mb-1">Meta Description</div>
                            <p className="text-sm">{article.meta_description}</p>
                          </div>
                        )}

                        <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg border">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: article.content
                                .replace(/\n\n/g, '</p><p>')
                                .replace(/\n/g, '<br>')
                                .replace(/^/, '<p>')
                                .replace(/$/, '</p>')
                            }}
                          />
                        </div>

                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleCopyContent(article.content)}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 flex items-center gap-2"
                          >
                            <Copy size={16} />
                            Copy Full Content
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">
                  <Sparkles size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No templates available.</p>
                </div>
              ) : (
                templates.map(template => (
                  <div key={template.id} className="rounded-2xl border bg-white p-4 shadow-soft">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <span className="text-xs text-slate-500">{template.category}</span>
                      </div>
                      {template.is_system && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">System</span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-slate-600 mt-2">{template.description}</p>
                    )}
                    {template.variables.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-slate-500 mb-1">Variables:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((v, i) => (
                            <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">
                              {`{${v}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setActiveTab('generate');
                      }}
                      className="mt-4 w-full px-3 py-2 rounded-lg bg-slate-100 text-sm hover:bg-slate-200"
                    >
                      Use Template
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
