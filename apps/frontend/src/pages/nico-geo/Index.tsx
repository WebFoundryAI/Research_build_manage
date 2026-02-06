import React from "react";
import {
  Globe2,
  Sparkles,
  Search,
  FileText,
  ClipboardCheck,
  ArrowRight,
  Zap,
  Shield,
  Code,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function NicoGeoIndex() {
  const stats = [
    { label: "Content Generated", value: "127", icon: Sparkles, color: "text-teal-600" },
    { label: "Audits Completed", value: "84", icon: Search, color: "text-blue-600" },
    { label: "Improvements Made", value: "56", icon: FileText, color: "text-purple-600" },
    { label: "Active Reviews", value: "3", icon: ClipboardCheck, color: "text-amber-600" },
  ];

  const features = [
    {
      title: "Generate Content",
      description: "Transform structured business data into optimized content packages for AI-driven search",
      icon: Sparkles,
      to: "/nico-geo/generate",
      color: "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
    },
    {
      title: "Audit Content",
      description: "Analyze existing content for GEO optimization opportunities",
      icon: Search,
      to: "/nico-geo/audit",
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
    },
    {
      title: "Improve Content",
      description: "Enhance content with AI-powered recommendations and optimizations",
      icon: FileText,
      to: "/nico-geo/improve",
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    },
    {
      title: "Review Sessions",
      description: "Manage and approve content changes before deployment",
      icon: ClipboardCheck,
      to: "/nico-geo/reviews",
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    },
  ];

  const capabilities = [
    { label: "Anti-Hallucination Rules", icon: Shield, desc: "Output derived solely from input data" },
    { label: "Schema.org Markup", icon: Code, desc: "JSON-LD structured data" },
    { label: "Multiple Formats", icon: FileText, desc: "JSON, Markdown, HTML output" },
    { label: "API Access", icon: Zap, desc: "Cloudflare Worker API" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          <Globe2 className="text-teal-600" />
          Nico GEO Content Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Generative Engine Optimization - Transform business data into AI-optimized content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
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
              <div className="p-2 rounded-lg bg-slate-100">
                <feature.icon size={20} className="text-white" />
              </div>
              <ArrowRight size={18} className="text-slate-500 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold mt-4">{feature.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{feature.description}</p>
          </Link>
        ))}
      </div>

      {/* Capabilities */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Engine Capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap) => (
            <div key={cap.label} className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 mt-0.5">
                <cap.icon size={16} className="text-teal-600" />
              </div>
              <div>
                <div className="font-medium text-sm">{cap.label}</div>
                <div className="text-xs text-slate-500">{cap.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-2">API Endpoints</h2>
        <p className="text-sm text-slate-400 mb-4">
          Access the GEO engine via Cloudflare Worker API
        </p>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100">
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-600 text-xs">POST</span>
            <span className="text-slate-600">/run</span>
            <span className="text-slate-500 ml-auto">Generate, audit, or improve content</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100">
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-600 text-xs">POST</span>
            <span className="text-slate-600">/review/create</span>
            <span className="text-slate-500 ml-auto">Create review session</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100">
            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-600 text-xs">GET</span>
            <span className="text-slate-600">/review/:sessionId</span>
            <span className="text-slate-500 ml-auto">Get session details</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100">
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-600 text-xs">POST</span>
            <span className="text-slate-600">/review/:sessionId/approve</span>
            <span className="text-slate-500 ml-auto">Approve session (Pro)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
