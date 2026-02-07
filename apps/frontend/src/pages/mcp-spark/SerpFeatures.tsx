import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { Search, Loader2, Eye, CheckCircle, XCircle, Image, Video, ShoppingCart, MapPin, HelpCircle, Star, Newspaper } from "lucide-react";

const LOCATION_OPTIONS = [
  { code: 2840, name: "United States" },
  { code: 2826, name: "United Kingdom" },
  { code: 2124, name: "Canada" },
  { code: 2036, name: "Australia" },
];

const LANGUAGE_OPTIONS = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
];

interface SerpFeature {
  type: string;
  present: boolean;
  position?: number;
  details?: string;
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  featured_snippet: <Star className="h-4 w-4" />,
  people_also_ask: <HelpCircle className="h-4 w-4" />,
  image_pack: <Image className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  shopping: <ShoppingCart className="h-4 w-4" />,
  local_pack: <MapPin className="h-4 w-4" />,
  news: <Newspaper className="h-4 w-4" />,
  knowledge_panel: <Eye className="h-4 w-4" />,
};

export default function SerpFeatures() {
  const [keyword, setKeyword] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [languageCode, setLanguageCode] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [features, setFeatures] = useState<SerpFeature[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAnalyze = async () => {
    if (!keyword.trim()) {
      showFeedback("error", "Please enter a keyword");
      return;
    }

    setIsLoading(true);
    setFeatures([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("serp-features", {
        body: {
          keyword: keyword.trim(),
          locationCode,
          languageCode,
        },
      });

      if (error) throw error;

      if (data?.features) {
        setFeatures(data.features);
        showFeedback("success", "SERP features analyzed");
      }
    } catch (err: any) {
      console.error("SERP features error:", err);
      showFeedback("error", err.message || "Failed to analyze SERP features");
    } finally {
      setIsLoading(false);
    }
  };

  const presentFeatures = features.filter((f) => f.present);
  const absentFeatures = features.filter((f) => !f.present);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {feedback && (
        <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Eye className="h-6 w-6 text-blue-600" />
          SERP Features
        </h1>
        <p className="text-slate-400">Analyze which SERP features appear for your target keywords</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Feature Analysis</h2>
          <p className="text-sm text-slate-400">Discover featured snippets, PAA, images, videos, and more</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-600 mb-2 block">Target Keyword</label>
              <input
                placeholder="Enter keyword to analyze..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Location</label>
              <select
                value={locationCode}
                onChange={(e) => setLocationCode(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc.code} value={loc.code}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Language</label>
              <select
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Features
              </>
            )}
          </button>
        </div>
      </div>

      {features.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Present Features ({presentFeatures.length})
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {presentFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    {FEATURE_ICONS[feature.type] || <Eye className="h-4 w-4" />}
                    <span className="font-medium text-white capitalize">{feature.type.replace(/_/g, " ")}</span>
                  </div>
                  {feature.position && (
                    <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-600">Position {feature.position}</span>
                  )}
                </div>
              ))}
              {presentFeatures.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No special SERP features detected</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-400 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Absent Features ({absentFeatures.length})
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {absentFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
                  {FEATURE_ICONS[feature.type] || <Eye className="h-4 w-4" />}
                  <span className="text-slate-400 capitalize">{feature.type.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {features.length === 0 && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="text-center space-y-4">
            <Eye className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Discover SERP features</p>
            <p className="text-sm text-slate-400">Enter a keyword to see which SERP features are present</p>
          </div>
        </div>
      )}
    </div>
  );
}
