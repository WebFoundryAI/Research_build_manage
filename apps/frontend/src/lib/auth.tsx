import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabase, getSupabaseInitError } from "./supabase";

type AppUser = {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  isAdmin?: boolean;
};

type AuthMode = "supabase";

type AuthContextValue = {
  mode: AuthMode;
  loading: boolean;
  user: AppUser | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_EMAILS = new Set(["cloudventuresonline@gmail.com"]);

function isAdminEmail(email?: string) {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.toLowerCase());
}

function withAdminFlag(user: AppUser | null): AppUser | null {
  if (!user) return null;
  return { ...user, isAdmin: isAdminEmail(user.email) };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabase(), []);
  const supabaseInitError = getSupabaseInitError();

  const mode: AuthMode = "supabase";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    async function boot() {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError(supabaseInitError?.message ?? "Supabase client is not configured.");
        setUser(null);
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
    if (!supabase) {
      setError("Supabase client is not configured.");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  async function signOut() {
    if (!supabase) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
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
