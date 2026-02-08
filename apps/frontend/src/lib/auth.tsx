import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabase, getSupabaseInitError } from "./supabase";

type AppUser = {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  isAdmin?: boolean;
};

type AuthMode = "supabase" | "demo";

type AuthContextValue = {
  mode: AuthMode;
  loading: boolean;
  user: AppUser | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_KEY = "rbm_demo_user";
const ADMIN_EMAILS = new Set(["cloudventuresonline@gmail.com"]);

function isAdminEmail(email?: string) {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.toLowerCase());
}

function withAdminFlag(user: AppUser | null): AppUser | null {
  if (!user) return null;
  return { ...user, isAdmin: isAdminEmail(user.email) };
}

function getDemoUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    return raw ? withAdminFlag(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function setDemoUser(u: AppUser | null) {
  try {
    if (!u) localStorage.removeItem(DEMO_KEY);
    else localStorage.setItem(DEMO_KEY, JSON.stringify(withAdminFlag(u)));
  } catch {
    // localStorage may be unavailable (e.g. private browsing)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabase(), []);
  const supabaseInitError = getSupabaseInitError();

  const mode: AuthMode = supabase ? "supabase" : "demo";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    async function boot() {
      setLoading(true);
      setError(null);

      if (mode === "demo") {
        if (supabaseInitError) setError(supabaseInitError.message);
        setUser(getDemoUser());
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase!.auth.getSession();
        const s = data.session;
        setUser(
          s?.user
            ? withAdminFlag({ id: s.user.id, email: s.user.email ?? undefined })
            : null
        );

        const { data: sub } = supabase!.auth.onAuthStateChange((_evt, session) => {
          setUser(
            session?.user
              ? withAdminFlag({ id: session.user.id, email: session.user.email ?? undefined })
              : null
          );
        });

        unsub = () => sub.subscription.unsubscribe();
      } catch (e: any) {
        setError(e?.message ? String(e.message) : String(e));
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    boot();
    return () => { if (unsub) unsub(); };
  }, [mode, supabase, supabaseInitError]);

  async function signInWithGoogle() {
    if (mode === "demo") {
      const demo = { id: "demo-user", email: "demo@local", name: "Demo User" };
      const demoUser = withAdminFlag(demo);
      setDemoUser(demoUser);
      setUser(demoUser);
      return;
    }

    await supabase!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  async function signOut() {
    if (mode === "demo") {
      setDemoUser(null);
      setUser(null);
      return;
    }
    await supabase!.auth.signOut();
    setUser(null);
  }

  const value: AuthContextValue = { mode, loading, user, error, signInWithGoogle, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
