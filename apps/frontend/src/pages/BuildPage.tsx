import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Copy,
  Globe,
  Hammer,
  Layers,
  Loader2,
  Plus,
  Rocket,
  Settings2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { callEdgeFunction } from "../lib/edgeFunctions";

type Service = {
  slug: string;
  name: string;
};

type Area = {
  name: string;
  slug: string;
};

type BuildForm = {
  brandName: string;
  city: string;
  address: string;
  phone: string;
  tier: string;
  radiusMiles: string;
  overrideServiceCount: string;
};

type BuildRecord = {
  id: string;
  brand_name: string;
  city: string;
  address: string;
  phone: string;
  tier: string;
  radius_miles: number;
  override_service_count?: number | null;
  services: Service[];
};

type GeneratedContent = {
  pages: Array<{
    page_type: string;
    display_name: string;
    slug: string;
    content: {
      h1: string;
      intro: string;
      cta: string;
      sections: Array<{ title: string; intent: string }>;
    };
    images: Array<{ placement: string; prompt: string }>;
  }>;
  schema: Record<string, unknown>;
  sitemap: Array<{ loc: string; priority: string }>
  robots: string;
};

type VarianceResult = {
  slug: string;
  displayName: string;
  matchedSlug: string;
  matchedDisplayName: string;
  score: number;
  status: "pass" | "warn" | "fail";
};

type RewriteDirective = {
  summary: string;
  differentiation_strategy: string;
  directives: Array<{
    section: string;
    current_issue: string;
    rewrite_instruction: string;
    suggested_angle: string;
  }>;
};

type DeployPrompt = {
  id: string;
  title: string;
  description: string;
  disabled: boolean;
  whenToPaste: string;
  whatToVerify: string[];
  prompt: string;
};

const SERVICE_CATALOG: Service[] = [
  { slug: "emergency-plumber", name: "Emergency Plumber" },
  { slug: "drain-cleaning", name: "Drain Cleaning" },
  { slug: "blocked-drains", name: "Blocked Drains" },
  { slug: "boiler-repair", name: "Boiler Repair" },
  { slug: "leak-detection", name: "Leak Detection" },
  { slug: "bathroom-plumbing", name: "Bathroom Plumbing" },
  { slug: "radiator-repair", name: "Radiator Repair" },
  { slug: "tap-repair", name: "Tap Repair" },
  { slug: "toilet-repair", name: "Toilet Repair" },
  { slug: "water-heater-repair", name: "Water Heater Repair" },
  { slug: "pipe-repair", name: "Pipe Repair" },
  { slug: "central-heating", name: "Central Heating" },
];

const PRESET_PACKS: Record<string, string[]> = {
  Austin: ["Round Rock", "Cedar Park", "Pflugerville", "Georgetown", "Leander", "Kyle", "Buda", "Lakeway", "Bee Cave", "Dripping Springs"],
  Dallas: ["Fort Worth", "Plano", "Arlington", "Irving", "Garland", "Frisco", "McKinney", "Grand Prairie", "Denton", "Richardson"],
  Houston: ["Sugar Land", "Katy", "The Woodlands", "Pearland", "League City", "Pasadena", "Baytown", "Missouri City", "Conroe", "Spring"],
  Phoenix: ["Scottsdale", "Mesa", "Chandler", "Gilbert", "Tempe", "Glendale", "Peoria", "Surprise", "Goodyear", "Avondale"],
  Denver: ["Aurora", "Lakewood", "Arvada", "Westminster", "Thornton", "Centennial", "Boulder", "Littleton", "Broomfield", "Castle Rock"],
  London: ["Croydon", "Bromley", "Barnet", "Ealing", "Enfield", "Hounslow", "Redbridge", "Brent", "Waltham Forest", "Haringey"],
  Manchester: ["Salford", "Stockport", "Bolton", "Wigan", "Oldham", "Rochdale", "Bury", "Tameside", "Trafford", "Altrincham"],
  Birmingham: ["Solihull", "Wolverhampton", "Dudley", "Walsall", "Sandwell", "Sutton Coldfield", "Edgbaston", "Erdington", "Moseley", "Kings Heath"],
};

const TIER_OPTIONS = [
  { value: "tier_1", label: "Tier 1 (5-15 mi, 8 services, 5 locations)", maxAreas: 5 },
  { value: "tier_2", label: "Tier 2 (10-25 mi, 12 services, 15 locations)", maxAreas: 15 },
  { value: "tier_3", label: "Tier 3 (15-50 mi, 16 services, no locations)", maxAreas: 0 },
];

const QA_CHECKLIST = [
  { id: "inputs-validated", label: "Inputs validated", description: "Brand name, city, address, phone, tier, and radius are correct" },
  { id: "areas-confirmed", label: "Areas confirmed", description: "All location areas have been reviewed and saved" },
  { id: "content-generated", label: "Content generated", description: "AI content has been generated and reviewed for accuracy" },
  { id: "images-generated", label: "Images generated externally", description: "All image prompts have been used to generate images" },
  { id: "variance-passed", label: "Variance check passed", description: "Content similarity is within acceptable thresholds" },
  { id: "prompts-pasted", label: "Lovable prompts pasted", description: "All three deployment prompts (A, B, C) have been executed" },
  { id: "sitemap-verified", label: "Sitemap verified", description: "sitemap.xml is accessible and contains all pages" },
  { id: "schema-validated", label: "Schema validated", description: "JSON-LD schema passes Google Rich Results Test" },
  { id: "site-deployed", label: "Site deployed", description: "Site is live and all pages are accessible" },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatTier(tier: string) {
  return TIER_OPTIONS.find((option) => option.value === tier)?.label ?? tier;
}

export default function BuildPage() {
  const [activeTab, setActiveTab] = useState<"build" | "services" | "areas" | "generate" | "variance" | "deploy" | "qa">("build");
  const [build, setBuild] = useState<BuildRecord | null>(null);
  const [form, setForm] = useState<BuildForm>({
    brandName: "",
    city: "",
    address: "",
    phone: "",
    tier: "",
    radiusMiles: "",
    overrideServiceCount: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [customService, setCustomService] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaMode, setAreaMode] = useState<"manual" | "postcode" | "preset">("manual");
  const [manualAreas, setManualAreas] = useState("");
  const [centralPostcode, setCentralPostcode] = useState("");
  const [presetPack, setPresetPack] = useState("");
  const [previewAreas, setPreviewAreas] = useState<Area[]>([]);
  const [isSavingBuild, setIsSavingBuild] = useState(false);
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [isSavingAreas, setIsSavingAreas] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [varianceResults, setVarianceResults] = useState<VarianceResult[]>([]);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [rewriteDirectives, setRewriteDirectives] = useState<Record<string, RewriteDirective>>({});
  const [rewriteLoading, setRewriteLoading] = useState<string | null>(null);
  const [deployPrompts, setDeployPrompts] = useState<DeployPrompt[]>([]);
  const [deployLoading, setDeployLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qaChecks, setQaChecks] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const maxAreas = useMemo(() => {
    const tier = TIER_OPTIONS.find((option) => option.value === (build?.tier ?? form.tier));
    return tier?.maxAreas ?? 0;
  }, [build?.tier, form.tier]);

  const slotsRemaining = Math.max(maxAreas - areas.length, 0);

  useEffect(() => {
    if (activeTab !== "deploy" || !build || !generatedContent) return;
    void loadDeployPrompts();
  }, [activeTab, build, generatedContent]);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const toggleService = (service: Service) => {
    setServices((prev) => {
      const exists = prev.some((entry) => entry.slug === service.slug);
      if (exists) return prev.filter((entry) => entry.slug !== service.slug);
      return [...prev, service];
    });
  };

  const addCustomService = () => {
    const name = customService.trim();
    if (!name) return;
    const slug = slugify(name);
    if (!slug) return;
    if (services.some((service) => service.slug === slug)) {
      setCustomService("");
      return;
    }
    setServices((prev) => [...prev, { name, slug }]);
    setCustomService("");
  };

  const validateBuild = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.brandName.trim()) nextErrors.brandName = "Brand name is required";
    if (!form.city.trim()) nextErrors.city = "City is required";
    if (!form.address.trim()) nextErrors.address = "Address is required";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required";
    if (!form.tier) nextErrors.tier = "Tier is required";
    if (!form.radiusMiles || Number(form.radiusMiles) <= 0) nextErrors.radiusMiles = "Radius is required";
    if (form.overrideServiceCount && Number(form.overrideServiceCount) <= 0) {
      nextErrors.overrideServiceCount = "Service count must be positive";
    }
    if (services.length === 0) nextErrors.services = "Select at least one service";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveBuild = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!validateBuild()) return;

    setIsSavingBuild(true);
    const result = await callEdgeFunction("build-create", {
      brandName: form.brandName.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      tier: form.tier,
      radiusMiles: Number(form.radiusMiles),
      overrideServiceCount: form.overrideServiceCount ? Number(form.overrideServiceCount) : null,
      services,
    });
    setIsSavingBuild(false);

    if (!result.ok) {
      showFeedback("error", result.bodyText || "Failed to save build");
      return;
    }

    const payload = result.json as { build: BuildRecord } | undefined;
    if (payload?.build) {
      setBuild(payload.build);
      showFeedback("success", "Build saved");
      return;
    }

    showFeedback("error", "Unexpected response from build-create");
  };

  const handleSaveServices = async () => {
    if (!build) return;
    setIsSavingServices(true);
    const result = await callEdgeFunction("build-services", {
      buildId: build.id,
      services,
    });
    setIsSavingServices(false);

    if (!result.ok) {
      showFeedback("error", result.bodyText || "Failed to save services");
      return;
    }

    showFeedback("success", "Services saved");
  };

  const previewAreasFromManual = async () => {
    const names = manualAreas
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (names.length === 0) return;

    await loadAreaPreview({ mode: "manual", names });
  };

  const previewAreasFromPostcode = async () => {
    if (!centralPostcode.trim()) return;
    await loadAreaPreview({ mode: "postcode", postcode: centralPostcode.trim(), radiusMiles: Number(form.radiusMiles || build?.radius_miles || 0) });
  };

  const previewAreasFromPreset = async (pack: string) => {
    if (!pack) return;
    await loadAreaPreview({ mode: "preset", presetPack: PRESET_PACKS[pack] ?? [] });
  };

  const loadAreaPreview = async (payload: Record<string, unknown>) => {
    const result = await callEdgeFunction("build-areas", {
      buildId: build?.id ?? null,
      previewOnly: true,
      ...payload,
    });

    if (!result.ok) {
      showFeedback("error", result.bodyText || "Failed to preview areas");
      return;
    }

    const data = result.json as { areas?: Area[] } | undefined;
    setPreviewAreas(data?.areas ?? []);
  };

  const confirmAndSaveAreas = async () => {
    if (!build) return;
    if (previewAreas.length === 0) return;

    setIsSavingAreas(true);
    const result = await callEdgeFunction("build-areas", {
      buildId: build.id,
      previewOnly: false,
      areas: previewAreas,
    });
    setIsSavingAreas(false);

    if (!result.ok) {
      showFeedback("error", result.bodyText || "Failed to save areas");
      return;
    }

    const data = result.json as { areas?: Area[] } | undefined;
    setAreas(data?.areas ?? previewAreas);
    setPreviewAreas([]);
    showFeedback("success", "Areas saved");
  };

  const handleGenerateContent = async () => {
    if (!build) return;
    if (services.length === 0) {
      showFeedback("error", "Add services first");
      return;
    }

    setIsGeneratingContent(true);
    const result = await callEdgeFunction("build-generate", {
      build,
      services,
      areas,
    });
    setIsGeneratingContent(false);

    if (!result.ok) {
      showFeedback("error", result.bodyText || "Failed to generate content");
      return;
    }

    const data = result.json as { content?: GeneratedContent } | undefined;
    if (data?.content) {
      setGeneratedContent(data.content);
      showFeedback("success", "Content generated");
    }
  };

  const handleRecalculateVariance = async () => {
    if (!generatedContent) return;
    setIsRecalculating(true);
    const result = await callEdgeFunction("build-variance", {
      pages: generatedContent.pages,
    });
    setIsRecalculating(false);

    if (!result.ok) {
      showFeedback("error", result.bodyText || "Failed to recalculate variance");
      return;
    }

    const data = result.json as { results?: VarianceResult[] } | undefined;
    setVarianceResults(data?.results ?? []);
  };

  const handleGenerateDirectives = async (entry: VarianceResult) => {
    if (!generatedContent) return;
    const source = generatedContent.pages.find((page) => page.slug === entry.slug);
    const match = generatedContent.pages.find((page) => page.slug === entry.matchedSlug);
    if (!source || !match) return;

    setRewriteLoading(entry.slug);
    const result = await callEdgeFunction("build-rewrite", {
      sourcePage: source,
      matchedPage: match,
      similarityScore: entry.score,
    });
    setRewriteLoading(null);

    if (!result.ok) {
      showFeedback("error", result.bodyText || "Failed to generate directives");
      return;
    }

    const data = result.json as { directives?: RewriteDirective } | undefined;
    if (data?.directives) {
      setRewriteDirectives((prev) => ({ ...prev, [entry.slug]: data.directives! }));
      showFeedback("success", "Rewrite directives generated");
    }
  };

  const loadDeployPrompts = async () => {
    if (!build || !generatedContent) return;
    setDeployLoading(true);
    const result = await callEdgeFunction("build-deploy", {
      build,
      areas,
      services,
      content: generatedContent,
    });
    setDeployLoading(false);

    if (!result.ok) {
      showFeedback("error", result.bodyText || "Failed to load deploy prompts");
      return;
    }

    const data = result.json as { prompts?: DeployPrompt[] } | undefined;
    setDeployPrompts(data?.prompts ?? []);
  };

  const handleCopy = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      showFeedback("error", "Copy failed");
    }
  };

  const toggleQaCheck = (id: string) => {
    setQaChecks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isTabDisabled = (tab: string) => {
    if (tab === "build") return false;
    if (!build) return true;
    if (["variance", "deploy", "qa"].includes(tab)) return !generatedContent;
    return false;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {feedback && (
        <div className={`rounded-lg p-3 text-sm ${feedback.type === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2">Rank-to-Rent Builder</h1>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "build", label: "Build" },
          { id: "services", label: "Services" },
          { id: "areas", label: "Areas" },
          { id: "generate", label: "Generate" },
          { id: "variance", label: "Variance" },
          { id: "deploy", label: "Deploy", icon: Rocket },
          { id: "qa", label: "QA", icon: ClipboardCheck },
        ].map((tab) => {
          const disabled = isTabDisabled(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-700"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={disabled}
            >
              {tab.icon && <tab.icon size={14} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "build" && (
        <div className="space-y-4">
          {build ? (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Settings2 size={18} className="text-indigo-600" />
                Build Summary
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Brand Name</div>
                  <div className="font-medium">{build.brand_name}</div>
                </div>
                <div>
                  <div className="text-slate-500">City</div>
                  <div className="font-medium">{build.city}</div>
                </div>
                <div>
                  <div className="text-slate-500">Address</div>
                  <div className="font-medium">{build.address}</div>
                </div>
                <div>
                  <div className="text-slate-500">Phone</div>
                  <div className="font-medium">{build.phone}</div>
                </div>
                <div>
                  <div className="text-slate-500">Tier</div>
                  <div className="font-medium">{formatTier(build.tier)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Radius</div>
                  <div className="font-medium">{build.radius_miles} miles</div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setBuild(null);
                    setGeneratedContent(null);
                    setVarianceResults([]);
                    setRewriteDirectives({});
                    setAreas([]);
                    setPreviewAreas([]);
                    setActiveTab("build");
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Create New Build
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
              <div className="text-lg font-semibold mb-4">New Build</div>
              <form onSubmit={handleSaveBuild} className="space-y-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="brandName">Brand Name *</label>
                  <input
                    id="brandName"
                    value={form.brandName}
                    onChange={(event) => setForm((prev) => ({ ...prev, brandName: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="e.g., Pro Plumbing Services"
                  />
                  {errors.brandName && <p className="text-sm text-red-500 mt-1">{errors.brandName}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="city">City *</label>
                  <input
                    id="city"
                    value={form.city}
                    onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="e.g., Manchester"
                  />
                  {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="address">Address *</label>
                  <input
                    id="address"
                    value={form.address}
                    onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="e.g., 123 High Street, Manchester M1 1AA"
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="e.g., 0161 123 4567"
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Tier *</label>
                  <select
                    value={form.tier}
                    onChange={(event) => setForm((prev) => ({ ...prev, tier: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">Select tier</option>
                    {TIER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.tier && <p className="text-sm text-red-500 mt-1">{errors.tier}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="radius">Radius (miles) *</label>
                  <input
                    id="radius"
                    type="number"
                    value={form.radiusMiles}
                    onChange={(event) => setForm((prev) => ({ ...prev, radiusMiles: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="e.g., 10"
                    min={1}
                  />
                  {errors.radiusMiles && <p className="text-sm text-red-500 mt-1">{errors.radiusMiles}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="overrideServiceCount">Override Service Count (optional)</label>
                  <input
                    id="overrideServiceCount"
                    type="number"
                    value={form.overrideServiceCount}
                    onChange={(event) => setForm((prev) => ({ ...prev, overrideServiceCount: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Leave blank for tier default"
                    min={1}
                    max={30}
                  />
                  {errors.overrideServiceCount && <p className="text-sm text-red-500 mt-1">{errors.overrideServiceCount}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Services *</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SERVICE_CATALOG.map((service) => {
                      const selected = services.some((entry) => entry.slug === service.slug);
                      return (
                        <button
                          type="button"
                          key={service.slug}
                          onClick={() => toggleService(service)}
                          className={`rounded-full px-3 py-1.5 text-xs border ${selected ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600"}`}
                        >
                          {service.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      value={customService}
                      onChange={(event) => setCustomService(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addCustomService();
                        }
                      }}
                      placeholder="Add custom service..."
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addCustomService}
                      className="rounded-lg border border-slate-200 px-3"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {errors.services && <p className="text-sm text-slate-500 mt-1">{errors.services}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium flex items-center justify-center"
                  disabled={isSavingBuild}
                >
                  {isSavingBuild && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Build
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === "services" && build && (
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
          <div className="text-lg font-semibold">Services ({services.length})</div>
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATALOG.map((service) => {
              const selected = services.some((entry) => entry.slug === service.slug);
              return (
                <button
                  key={service.slug}
                  onClick={() => toggleService(service)}
                  className={`rounded-full px-3 py-1.5 text-xs border ${selected ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600"}`}
                >
                  {service.name}
                </button>
              );
            })}
          </div>
          {services.filter((service) => !SERVICE_CATALOG.some((entry) => entry.slug === service.slug)).length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Custom Services</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {services
                  .filter((service) => !SERVICE_CATALOG.some((entry) => entry.slug === service.slug))
                  .map((service) => (
                    <span key={service.slug} className="rounded-full bg-indigo-600 text-white px-3 py-1.5 text-xs flex items-center gap-2">
                      {service.name}
                      <button onClick={() => toggleService(service)} className="hover:text-red-200">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={customService}
              onChange={(event) => setCustomService(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomService();
                }
              }}
              placeholder="Add custom service..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button onClick={addCustomService} className="rounded-lg border border-slate-200 px-3">
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={handleSaveServices}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium"
            disabled={isSavingServices}
          >
            {isSavingServices && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Services
          </button>
        </div>
      )}

      {activeTab === "areas" && build && (
        <div className="space-y-4">
          {maxAreas === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 text-center space-y-3">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold">Location Pages Disabled</h3>
              <p className="text-sm text-slate-500">Tier 3 builds do not support location pages.</p>
            </div>
          ) : (
            <>
              {areas.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
                  <div className="text-base font-semibold">Saved Areas ({areas.length}/{maxAreas})</div>
                  <div className="flex flex-wrap gap-2">
                    {areas.map((area) => (
                      <span key={area.slug} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs">
                        {area.name}
                        <span className="text-slate-400 ml-2">/{area.slug}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold">Add Areas</div>
                    <p className="text-sm text-slate-500">{slotsRemaining} slots remaining</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {[
                    { id: "manual", label: "Manual" },
                    { id: "postcode", label: "Postcode + Radius" },
                    { id: "preset", label: "Preset Pack" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setAreaMode(tab.id as typeof areaMode);
                        setPreviewAreas([]);
                      }}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm border ${areaMode === tab.id ? "border-indigo-600 text-indigo-700" : "border-slate-200 text-slate-500"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {areaMode === "manual" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Area Names (one per line)</label>
                    <textarea
                      value={manualAreas}
                      onChange={(event) => setManualAreas(event.target.value)}
                      rows={6}
                      placeholder={`Salford\nStockport\nBolton`}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={previewAreasFromManual}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                      disabled={!manualAreas.trim()}
                    >
                      Preview Slugs
                    </button>
                  </div>
                )}

                {areaMode === "postcode" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Central Postcode</label>
                    <input
                      value={centralPostcode}
                      onChange={(event) => setCentralPostcode(event.target.value)}
                      placeholder="e.g., M1 1AA"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <p className="text-sm text-slate-500">Using radius: {build.radius_miles} miles</p>
                    <button
                      onClick={previewAreasFromPostcode}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                      disabled={!centralPostcode.trim()}
                    >
                      Generate Areas
                    </button>
                  </div>
                )}

                {areaMode === "preset" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Preset Pack</label>
                    <select
                      value={presetPack}
                      onChange={(event) => {
                        setPresetPack(event.target.value);
                        void previewAreasFromPreset(event.target.value);
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">Choose city pack</option>
                      {Object.keys(PRESET_PACKS).map((pack) => (
                        <option key={pack} value={pack}>
                          {pack} ({PRESET_PACKS[pack].length} areas)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {previewAreas.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="text-sm font-medium">Preview ({previewAreas.length} areas)</div>
                    <div className="flex flex-wrap gap-2">
                      {previewAreas.map((area) => (
                        <span key={area.slug} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs">
                          {area.name}
                          <span className="text-slate-400 ml-2">/{area.slug}</span>
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={confirmAndSaveAreas}
                      className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium"
                      disabled={isSavingAreas}
                    >
                      {isSavingAreas && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Confirm &amp; Save Areas
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "generate" && build && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Wand2 size={18} className="text-indigo-600" />
              Generate Content
            </div>
            <div className="text-sm text-slate-500">
              <p>This will generate:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Page inventory with content blocks</li>
                <li>Image prompts for each page</li>
                <li>JSON-LD schema markup</li>
                <li>Sitemap entries</li>
                <li>robots.txt</li>
              </ul>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleGenerateContent}
                className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium"
                disabled={isGeneratingContent || services.length === 0}
              >
                {isGeneratingContent && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {generatedContent ? "Regenerate" : "Generate"}
              </button>
              {services.length === 0 && <span className="text-sm text-red-500">Add services first</span>}
            </div>
          </div>

          {generatedContent && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Sparkles size={18} className="text-indigo-600" />
                Generated Content
              </div>
              <div className="space-y-4">
                <details open className="border rounded-lg">
                  <summary className="cursor-pointer px-4 py-2 flex items-center justify-between">
                    <span>Pages ({generatedContent.pages.length})</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="p-4 space-y-4">
                    {generatedContent.pages.map((page, index) => (
                      <div key={page.slug} className="border rounded p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs uppercase tracking-wide text-slate-400">{page.page_type}</span>
                            <div className="font-medium mt-1">{page.display_name}</div>
                            <div className="text-sm text-slate-400">/{page.slug}</div>
                          </div>
                          <button
                            onClick={() => handleCopy(JSON.stringify(page, null, 2), `page-${index}`)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {copiedId === `page-${index}` ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>H1:</strong> {page.content.h1}</p>
                          <p><strong>Intro:</strong> {page.content.intro}</p>
                          <p><strong>CTA:</strong> {page.content.cta}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>

                <details className="border rounded-lg">
                  <summary className="cursor-pointer px-4 py-2 flex items-center justify-between">
                    <span>Images ({generatedContent.pages.reduce((sum, page) => sum + page.images.length, 0)} total)</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-slate-500">Image guidance only. Generate or source images manually using the prompts below.</p>
                    {generatedContent.pages.map((page) => (
                      <div key={page.slug} className="border rounded p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wide text-slate-400">{page.page_type}</span>
                          <span className="font-medium">{page.display_name}</span>
                          <span className="text-sm text-slate-400">({page.images.length} images)</span>
                        </div>
                        {page.images.map((image, index) => {
                          const imageId = `${page.slug}-${image.placement}-${index + 1}.webp`;
                          return (
                            <div key={imageId} className="bg-slate-50 rounded p-3 space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wide text-slate-400">{image.placement}</span>
                                <span className="text-xs text-slate-400 font-mono">{imageId}</span>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-slate-500">Image Prompt</span>
                                  <button
                                    onClick={() => handleCopy(image.prompt, imageId)}
                                    className="text-slate-400 hover:text-slate-600"
                                  >
                                    {copiedId === imageId ? <Check size={16} /> : <Copy size={16} />}
                                  </button>
                                </div>
                                <p className="text-sm">{image.prompt}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </details>

                <details className="border rounded-lg">
                  <summary className="cursor-pointer px-4 py-2 flex items-center justify-between">
                    <span>Schema</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="p-4">
                    <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-80">{JSON.stringify(generatedContent.schema, null, 2)}</pre>
                  </div>
                </details>

                <details className="border rounded-lg">
                  <summary className="cursor-pointer px-4 py-2 flex items-center justify-between">
                    <span>Sitemap Entries ({generatedContent.sitemap.length})</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="p-4 space-y-2 text-sm">
                    {generatedContent.sitemap.map((entry) => (
                      <div key={entry.loc} className="flex items-center justify-between">
                        <span className="text-slate-600">{entry.loc}</span>
                        <span className="text-slate-400">{entry.priority}</span>
                      </div>
                    ))}
                  </div>
                </details>

                <details className="border rounded-lg">
                  <summary className="cursor-pointer px-4 py-2 flex items-center justify-between">
                    <span>robots.txt</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="p-4">
                    <pre className="text-xs bg-slate-50 p-3 rounded whitespace-pre-wrap">{generatedContent.robots}</pre>
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "variance" && generatedContent && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Layers size={18} className="text-indigo-600" />
              Content Variance Analysis
            </div>
            <div className="text-sm text-slate-500 mt-2">
              Compares generated page content for similarity. Pages with high similarity may be penalised by search engines.
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Pass (&lt;50%)</div>
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" />Warn (50-70%)</div>
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" />Fail (&gt;70%)</div>
            </div>
            <button
              onClick={handleRecalculateVariance}
              className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm"
              disabled={isRecalculating}
            >
              {isRecalculating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Recalculate
            </button>
          </div>

          {varianceResults.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
              <div className="text-base font-semibold">Results ({varianceResults.filter((item) => item.status === "pass").length} pass, {varianceResults.filter((item) => item.status === "warn").length} warn, {varianceResults.filter((item) => item.status === "fail").length} fail)</div>
              <div className="space-y-3 mt-4">
                {varianceResults.map((entry) => {
                  const directives = rewriteDirectives[entry.slug];
                  return (
                    <div key={entry.slug} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-medium">{entry.displayName}</p>
                            <p className="text-sm text-slate-400">/{entry.slug}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${entry.status === "pass" ? "bg-green-100 text-green-700" : entry.status === "warn" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                          {entry.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-2 space-y-1">
                        <p>Similarity: <span className="font-medium">{(entry.score * 100).toFixed(1)}%</span></p>
                        <p>Most similar to: <span className="font-medium">{entry.matchedDisplayName}</span> <span className="text-slate-400">(/{entry.matchedSlug})</span></p>
                      </div>
                      {(entry.status === "warn" || entry.status === "fail") && (
                        <div className="pt-3 border-t mt-3">
                          {directives ? (
                            <details className="rounded-lg border">
                              <summary className="cursor-pointer px-3 py-2 text-sm">View Rewrite Directives</summary>
                              <div className="p-3 text-sm space-y-3">
                                <div>
                                  <div className="text-xs text-slate-400">Summary</div>
                                  <p>{directives.summary}</p>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-400">Strategy</div>
                                  <p>{directives.differentiation_strategy}</p>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-400">Directives</div>
                                  <div className="space-y-2 mt-1">
                                    {directives.directives.map((directive, index) => (
                                      <div key={`${directive.section}-${index}`} className="bg-slate-50 rounded p-2 text-xs">
                                        <p><strong>Section:</strong> {directive.section}</p>
                                        <p><strong>Issue:</strong> {directive.current_issue}</p>
                                        <p><strong>Instruction:</strong> {directive.rewrite_instruction}</p>
                                        <p><strong>Angle:</strong> {directive.suggested_angle}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </details>
                          ) : (
                            <button
                              onClick={() => handleGenerateDirectives(entry)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              disabled={rewriteLoading === entry.slug}
                            >
                              {rewriteLoading === entry.slug && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Generate Rewrite Directives
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "deploy" && build && generatedContent && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
            <div className="text-lg font-semibold">Deploy Prompts</div>
            <p className="text-sm text-slate-500">Copy these self-contained prompts to deploy your site in Lovable. Execute in order: A → B → C.</p>
            <div className="flex gap-2 text-sm">
              <span className="rounded-full border border-slate-200 px-3 py-1">Pages: {generatedContent.pages.length}</span>
              <span className="rounded-full border border-slate-200 px-3 py-1">Areas: {areas.length}</span>
              <span className="rounded-full border border-slate-200 px-3 py-1">Services: {services.length}</span>
            </div>
          </div>

          {deployLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading prompts...
            </div>
          )}

          {!deployLoading && deployPrompts.map((prompt) => (
            <details key={prompt.id} className="rounded-2xl border border-slate-200 bg-white/60">
              <summary className="cursor-pointer px-6 py-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${prompt.disabled ? "bg-slate-100" : "bg-indigo-500/10"}`}>
                  <Hammer className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium">{prompt.title}</p>
                  <p className="text-sm text-slate-500">{prompt.description}</p>
                </div>
              </summary>
              <div className="px-6 pb-6">
                {prompt.disabled ? (
                  <div className="py-4 text-center text-slate-500">
                    <p>No location areas configured.</p>
                    <p className="text-sm">Add areas in the Areas tab first.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">When to paste:</p>
                      <p className="text-sm text-slate-500">{prompt.whenToPaste}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">What to verify:</p>
                      <ul className="text-sm text-slate-500 list-disc list-inside mt-2 space-y-1">
                        {prompt.whatToVerify.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Prompt Preview:</p>
                      <div className="border rounded-lg bg-slate-50 p-4 text-xs font-mono whitespace-pre-wrap">
                        {prompt.prompt}
                      </div>
                      <button
                        onClick={() => handleCopy(prompt.prompt, `prompt-${prompt.id}`)}
                        className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {copiedId === `prompt-${prompt.id}` ? "Copied" : "Copy Prompt"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}

      {activeTab === "qa" && (
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <ClipboardCheck size={18} className="text-indigo-600" />
              QA Checklist
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-sm">
              {qaChecks.size} / {QA_CHECKLIST.length}
            </span>
          </div>
          <p className="text-sm text-slate-500">Track your progress through the deployment process. This checklist is informational only and does not affect any functionality.</p>
          <div className="space-y-3">
            {QA_CHECKLIST.map((item) => (
              <label key={item.id} className="flex items-start gap-3 border rounded-lg p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qaChecks.has(item.id)}
                  onChange={() => toggleQaCheck(item.id)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
