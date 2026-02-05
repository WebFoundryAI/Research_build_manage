import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth";
import { getSupabase } from "../lib/supabase";
import { User, Mail, Building2, Save, AlertTriangle, CheckCircle } from "lucide-react";

type ProfileForm = {
  display_name: string;
  company_name: string;
};

type Status = "idle" | "loading" | "saving" | "success" | "error";

export default function ProfilePage() {
  const { user, mode } = useAuth();
  const supabase = useMemo(() => getSupabase(), []);

  const [form, setForm] = useState<ProfileForm>({
    display_name: "",
    company_name: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!supabase || !user) return;
      setStatus("loading");
      setMessage(null);
      const { data, error } = await supabase
        .from("user_settings")
        .select("display_name, company_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      setForm({
        display_name: data?.display_name ?? "",
        company_name: data?.company_name ?? "",
      });
      setStatus("idle");
    }

    loadProfile();
  }, [supabase, user]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    if (form.display_name.trim().length > 80 || form.company_name.trim().length > 120) {
      setStatus("error");
      setMessage("Display name or company name is too long.");
      return;
    }
    setStatus("saving");
    setMessage(null);
    const payload = {
      user_id: user.id,
      display_name: form.display_name.trim() || null,
      company_name: form.company_name.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("user_settings").upsert(payload);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Profile saved successfully.");
    setTimeout(() => {
      setStatus("idle");
      setMessage(null);
    }, 2000);
  }

  if (mode === "demo" || !supabase) {
    return (
      <div className="max-w-2xl">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <AlertTriangle size={24} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Profile</h1>
              <p className="text-sm text-slate-400">Demo mode - Profile editing disabled</p>
            </div>
          </div>
          <p className="text-slate-500">
            Configure Supabase environment variables to enable profile management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <User size={20} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-semibold">Profile</h1>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Manage your personal details used across SEO workflows.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={saveProfile} className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-800">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-semibold shadow-lg shadow-indigo-500/20">
              {form.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-medium text-lg">{form.display_name || "Your Name"}</p>
              <p className="text-sm text-slate-400">{user?.email || "email@example.com"}</p>
              {form.company_name && (
                <p className="text-xs text-slate-500 mt-1">{form.company_name}</p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <User size={14} className="text-slate-500" />
                Display Name
              </span>
              <input
                value={form.display_name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, display_name: event.target.value }))
                }
                placeholder="Jane Founder"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <p className="text-xs text-slate-500">How you'll appear across the platform</p>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Building2 size={14} className="text-slate-500" />
                Company Name
              </span>
              <input
                value={form.company_name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, company_name: event.target.value }))
                }
                placeholder="WebFoundryAI"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <p className="text-xs text-slate-500">Your company or organization</p>
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Mail size={14} className="text-slate-500" />
              Email Address
            </span>
            <input
              value={user?.email ?? ""}
              readOnly
              className="w-full rounded-xl border border-slate-700 bg-slate-800/30 px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500">Email is managed through authentication</p>
          </label>
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {message && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                  status === "error"
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                }`}
              >
                {status === "error" ? (
                  <AlertTriangle size={14} />
                ) : (
                  <CheckCircle size={14} />
                )}
                {message}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={status === "saving" || status === "loading"}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {status === "saving" ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Account Info */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-sm font-semibold mb-4">Account Information</h3>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="rounded-xl border border-slate-700 p-4">
            <p className="text-slate-500 text-xs mb-1">User ID</p>
            <code className="text-xs bg-slate-800 px-2 py-1 rounded">
              {user?.id?.slice(0, 8)}...{user?.id?.slice(-4)}
            </code>
          </div>
          <div className="rounded-xl border border-slate-700 p-4">
            <p className="text-slate-500 text-xs mb-1">Auth Provider</p>
            <p className="font-medium">Supabase Auth</p>
          </div>
        </div>
      </div>
    </div>
  );
}
