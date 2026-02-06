import { useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { MapPin, Loader2, Search, Building2, Star, Phone, ExternalLink } from "lucide-react";

const LOCATION_OPTIONS = [
  { code: 2840, name: "United States" },
  { code: 2826, name: "United Kingdom" },
  { code: 2124, name: "Canada" },
  { code: 2036, name: "Australia" },
];

interface LocalBusiness {
  title: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  hours?: string;
  position: number;
}

interface LocalKeyword {
  keyword: string;
  search_volume: number;
  competition: number;
  intent: string;
}

export default function LocalSeo() {
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [keywords, setKeywords] = useState<LocalKeyword[]>([]);
  const [activeTab, setActiveTab] = useState<"competitors" | "keywords">("competitors");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSearch = async () => {
    if (!businessType.trim() || !location.trim()) {
      showFeedback("error", "Please enter both business type and location");
      return;
    }

    setIsLoading(true);
    setBusinesses([]);
    setKeywords([]);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase.functions.invoke("local-seo-ideas", {
        body: {
          businessType: businessType.trim(),
          location: location.trim(),
          locationCode,
        },
      });

      if (error) throw error;

      if (data) {
        setBusinesses(data.businesses || []);
        setKeywords(data.keywords || []);
        showFeedback("success", "Local SEO analysis complete");
      }
    } catch (err: any) {
      console.error("Local SEO error:", err);
      showFeedback("error", err.message || "Failed to analyze local SEO");
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {feedback && (
        <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-600"}`}>
          {feedback.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <MapPin className="h-6 w-6 text-blue-600" />
          Local SEO
        </h1>
        <p className="text-slate-400">Analyze local competition and find keyword opportunities</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-white">Local Business Analysis</h2>
          <p className="text-sm text-slate-400">Enter your business type and location to analyze local competition</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Business Type</label>
              <input
                placeholder="e.g., plumber, dentist, restaurant"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Location</label>
              <input
                placeholder="e.g., New York, London, Sydney"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Country</label>
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
          </div>

          <button
            onClick={handleSearch}
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
                Analyze Local SEO
              </>
            )}
          </button>
        </div>
      </div>

      {(businesses.length > 0 || keywords.length > 0) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("competitors")}
                className={`px-4 py-2 text-sm rounded-lg flex items-center gap-1 transition-colors ${activeTab === "competitors" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-100"}`}
              >
                <Building2 className="h-4 w-4" />
                Local Competitors ({businesses.length})
              </button>
              <button
                onClick={() => setActiveTab("keywords")}
                className={`px-4 py-2 text-sm rounded-lg flex items-center gap-1 transition-colors ${activeTab === "keywords" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-100"}`}
              >
                <Search className="h-4 w-4" />
                Local Keywords ({keywords.length})
              </button>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            {activeTab === "competitors" && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 w-12 text-slate-400 text-sm font-medium">#</th>
                    <th className="text-left p-3 text-slate-400 text-sm font-medium">Business</th>
                    <th className="text-center p-3 text-slate-400 text-sm font-medium">Rating</th>
                    <th className="text-right p-3 text-slate-400 text-sm font-medium">Reviews</th>
                    <th className="text-center p-3 text-slate-400 text-sm font-medium">Category</th>
                    <th className="text-center p-3 text-slate-400 text-sm font-medium">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((biz, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-400">{biz.position}</span>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-white">{biz.title}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {biz.address}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {biz.rating ? (
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white">{biz.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-right text-slate-600">{formatNumber(biz.reviews)}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-600">{biz.category || "N/A"}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {biz.phone && (
                            <a href={`tel:${biz.phone}`} className="text-blue-600 hover:text-blue-300">
                              <Phone className="h-4 w-4" />
                            </a>
                          )}
                          {biz.website && (
                            <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-300">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "keywords" && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 text-slate-400 text-sm font-medium">Keyword</th>
                    <th className="text-right p-3 text-slate-400 text-sm font-medium">Search Volume</th>
                    <th className="text-center p-3 text-slate-400 text-sm font-medium">Competition</th>
                    <th className="text-center p-3 text-slate-400 text-sm font-medium">Intent</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-3 font-medium text-white">{kw.keyword}</td>
                      <td className="p-3 text-right text-slate-600">{formatNumber(kw.search_volume)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 text-xs rounded ${kw.competition < 0.3 ? "bg-green-500/20 text-green-400" : kw.competition < 0.6 ? "bg-yellow-500/20 text-yellow-400" : "bg-slate-200 text-slate-400"}`}>
                          {kw.competition < 0.3 ? "Low" : kw.competition < 0.6 ? "Medium" : "High"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 text-xs bg-slate-200 rounded text-slate-400">{kw.intent}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {businesses.length === 0 && keywords.length === 0 && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12">
          <div className="text-center space-y-4">
            <MapPin className="h-12 w-12 mx-auto text-slate-600" />
            <p className="font-medium text-white">Analyze local SEO</p>
            <p className="text-sm text-slate-400">Enter your business type and location to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
