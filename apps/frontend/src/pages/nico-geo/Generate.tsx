import React, { useState } from "react";
import {
  Sparkles,
  Play,
  Download,
  Copy,
  Check,
  FileJson,
  FileText,
  Code,
  AlertCircle,
} from "lucide-react";

export default function NicoGeoGenerate() {
  const [businessInput, setBusinessInput] = useState({
    business: { name: "" },
    location: {
      primaryCity: "",
      country: "",
      serviceAreas: [""],
    },
    services: { primary: [""] },
    constraints: { noHallucinations: true },
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"json" | "markdown" | "html">("json");
  const [copied, setCopied] = useState(false);

  function updateServiceArea(index: number, value: string) {
    const newAreas = [...businessInput.location.serviceAreas];
    newAreas[index] = value;
    setBusinessInput({
      ...businessInput,
      location: { ...businessInput.location, serviceAreas: newAreas },
    });
  }

  function addServiceArea() {
    setBusinessInput({
      ...businessInput,
      location: {
        ...businessInput.location,
        serviceAreas: [...businessInput.location.serviceAreas, ""],
      },
    });
  }

  function updatePrimaryService(index: number, value: string) {
    const newServices = [...businessInput.services.primary];
    newServices[index] = value;
    setBusinessInput({
      ...businessInput,
      services: { ...businessInput.services, primary: newServices },
    });
  }

  function addPrimaryService() {
    setBusinessInput({
      ...businessInput,
      services: {
        ...businessInput.services,
        primary: [...businessInput.services.primary, ""],
      },
    });
  }

  async function handleGenerate() {
    setGenerating(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    setResult({
      status: "success",
      mode: "generate",
      summary: {
        titleGenerated: true,
        metaDescription: true,
        answerCapsulesCount: 3,
        faqsCount: 5,
        schemaGenerated: true,
      },
      results: {
        title: `${businessInput.business.name} - ${businessInput.services.primary[0]} in ${businessInput.location.primaryCity}`,
        metaDescription: `Professional ${businessInput.services.primary.join(", ")} services in ${businessInput.location.serviceAreas.join(", ")}. Contact ${businessInput.business.name} today.`,
        answerCapsules: [
          {
            question: `What services does ${businessInput.business.name} offer?`,
            answer: `${businessInput.business.name} provides ${businessInput.services.primary.join(", ")} services.`,
          },
        ],
        faqs: businessInput.services.primary.map((service) => ({
          question: `How can I get ${service} services?`,
          answer: `Contact ${businessInput.business.name} to schedule your ${service} consultation.`,
        })),
        schemaOrg: {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: businessInput.business.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: businessInput.location.primaryCity,
            addressCountry: businessInput.location.country,
          },
        },
      },
    });
    setGenerating(false);
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          <Sparkles className="text-teal-400" />
          Generate GEO Content
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Transform structured business data into optimized content packages
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold mb-4">Business Input</h2>

            {/* Business Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={businessInput.business.name}
                onChange={(e) =>
                  setBusinessInput({
                    ...businessInput,
                    business: { ...businessInput.business, name: e.target.value },
                  })
                }
                placeholder="Acme Services LLC"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Primary City *
              </label>
              <input
                type="text"
                value={businessInput.location.primaryCity}
                onChange={(e) =>
                  setBusinessInput({
                    ...businessInput,
                    location: { ...businessInput.location, primaryCity: e.target.value },
                  })
                }
                placeholder="Austin"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Country *
              </label>
              <input
                type="text"
                value={businessInput.location.country}
                onChange={(e) =>
                  setBusinessInput({
                    ...businessInput,
                    location: { ...businessInput.location, country: e.target.value },
                  })
                }
                placeholder="USA"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Service Areas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Service Areas *
              </label>
              {businessInput.location.serviceAreas.map((area, i) => (
                <input
                  key={i}
                  type="text"
                  value={area}
                  onChange={(e) => updateServiceArea(i, e.target.value)}
                  placeholder="e.g., Austin, Round Rock"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 mb-2"
                />
              ))}
              <button
                onClick={addServiceArea}
                className="text-sm text-teal-400 hover:text-teal-300"
              >
                + Add service area
              </button>
            </div>

            {/* Primary Services */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Primary Services *
              </label>
              {businessInput.services.primary.map((service, i) => (
                <input
                  key={i}
                  type="text"
                  value={service}
                  onChange={(e) => updatePrimaryService(i, e.target.value)}
                  placeholder="e.g., Consulting, Web Design"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 mb-2"
                />
              ))}
              <button
                onClick={addPrimaryService}
                className="text-sm text-teal-400 hover:text-teal-300"
              >
                + Add service
              </button>
            </div>

            {/* Constraints */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <AlertCircle size={16} className="text-teal-400" />
              <span className="text-sm text-teal-400">
                Anti-hallucination mode enabled - output derived solely from input
              </span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !businessInput.business.name}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors disabled:opacity-60"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Generate Content
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Output</h2>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">
                    <Download size={14} />
                    Export
                  </button>
                </div>
              )}
            </div>

            {result ? (
              <>
                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  {[
                    { id: "json", label: "JSON", icon: FileJson },
                    { id: "markdown", label: "Markdown", icon: FileText },
                    { id: "html", label: "HTML", icon: Code },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === tab.id
                          ? "bg-teal-500/20 text-teal-400"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="rounded-lg bg-slate-800/50 p-4 overflow-auto max-h-[500px]">
                  <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                    {JSON.stringify(result.results, null, 2)}
                  </pre>
                </div>

                {/* Summary */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="text-lg font-semibold text-emerald-400">
                      {result.summary.answerCapsulesCount}
                    </div>
                    <div className="text-xs text-slate-500">Answer Capsules</div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                    <div className="text-lg font-semibold text-blue-400">
                      {result.summary.faqsCount}
                    </div>
                    <div className="text-xs text-slate-500">FAQs Generated</div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                    <div className="text-lg font-semibold text-purple-400">
                      {result.summary.schemaGenerated ? "Yes" : "No"}
                    </div>
                    <div className="text-xs text-slate-500">Schema.org</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <FileJson size={48} className="mb-4 opacity-50" />
                <p>Fill in business details and click Generate</p>
                <p className="text-sm mt-1">Output will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
