import React from "react";
import {
  FileEdit,
  FolderKanban,
  Search,
  FileText,
  CalendarDays,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function NexusOpenCopyIndex() {
  const stats = [
    { label: "Total Projects", value: "8", icon: FolderKanban, color: "text-pink-400" },
    { label: "Keywords Tracked", value: "156", icon: Search, color: "text-blue-400" },
    { label: "Articles Generated", value: "342", icon: FileText, color: "text-emerald-400" },
    { label: "Avg SEO Score", value: "78", icon: TrendingUp, color: "text-amber-400" },
  ];

  const features = [
    {
      title: "Manage Projects",
      description: "Create and organize your content projects with custom settings",
      icon: FolderKanban,
      to: "/nexus-opencopy/projects",
      color: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    },
    {
      title: "Keyword Research",
      description: "Track keywords, analyze difficulty and volume, generate content",
      icon: Search,
      to: "/nexus-opencopy/keywords",
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
    },
    {
      title: "Article Library",
      description: "View and manage all generated articles with SEO scoring",
      icon: FileText,
      to: "/nexus-opencopy/articles",
      color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    },
    {
      title: "Content Planner",
      description: "Plan and schedule your content calendar",
      icon: CalendarDays,
      to: "/nexus-opencopy/content-planner",
      color: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
    },
  ];

  const recentArticles = [
    {
      title: "Complete Guide to React Hooks",
      project: "Tech Blog",
      score: 85,
      status: "published",
      date: "2 hours ago",
    },
    {
      title: "SEO Best Practices for 2025",
      project: "Marketing Site",
      score: 92,
      status: "in_review",
      date: "5 hours ago",
    },
    {
      title: "Getting Started with TypeScript",
      project: "Tech Blog",
      score: 78,
      status: "generating",
      date: "1 day ago",
    },
  ];

  function getStatusColor(status: string) {
    if (status === "published") return "bg-emerald-500/20 text-emerald-400";
    if (status === "in_review") return "bg-amber-500/20 text-amber-400";
    return "bg-blue-500/20 text-blue-400";
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          <FileEdit className="text-pink-400" />
          Nexus OpenCopy
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          AI-powered content generation and SEO optimization platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800/50">
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <Link
            key={feature.to}
            to={feature.to}
            className={`group rounded-xl border bg-gradient-to-br ${feature.color} p-5 transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-slate-800/50">
                <feature.icon size={20} className="text-white" />
              </div>
              <ArrowRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold mt-4">{feature.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{feature.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Articles */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Articles</h2>
          <Link
            to="/nexus-opencopy/articles"
            className="text-sm text-pink-400 hover:text-pink-300 flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-3">
          {recentArticles.map((article, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800">
                  <FileText size={16} className="text-pink-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">{article.title}</div>
                  <div className="text-xs text-slate-500">{article.project}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className={getScoreColor(article.score)} />
                  <span className={`text-sm font-medium ${getScoreColor(article.score)}`}>
                    {article.score}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(article.status)}`}>
                  {article.status.replace("_", " ")}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={12} />
                  {article.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-pink-400 flex items-center gap-2">
              <Sparkles size={18} />
              Quick Generate
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Start generating content from your existing keywords
            </p>
          </div>
          <Link
            to="/nexus-opencopy/keywords"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium transition-colors"
          >
            Go to Keywords
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
