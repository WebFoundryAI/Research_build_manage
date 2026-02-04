import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth";
import { getSupabase } from "../lib/supabase";

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
    setMessage("Profile saved.");
    setTimeout(() => setStatus("idle"), 1200);
  }

  if (mode === "demo" || !supabase) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Supabase is not configured in demo mode. Configure Supabase env vars to
          persist profile settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your personal details used across SEO workflows.
        </p>
      </div>

      <form
        onSubmit={saveProfile}
        className="rounded-2xl border bg-white p-6 shadow-soft space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Display name</span>
            <input
              value={form.display_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, display_name: event.target.value }))
              }
              placeholder="Jane Founder"
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Company name</span>
            <input
              value={form.company_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, company_name: event.target.value }))
              }
              placeholder="WebFoundryAI"
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Email</span>
          <input
            value={user?.email ?? ""}
            readOnly
            className="w-full rounded-xl border px-3 py-2 bg-slate-50 text-slate-500"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "saving" || status === "loading"}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Save profile"}
          </button>
          {message && (
            <span
              className={`text-sm ${
                status === "error" ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
