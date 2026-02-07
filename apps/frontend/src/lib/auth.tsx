import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabaseInitError, supabaseClient } from "./supabaseClient";

type AppUser = {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
};

type AuthContextValue = {
  loading: boolean;
  user: AppUser | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => supabaseClient, []);
  const supabaseInitError = getSupabaseInitError();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    async function boot() {
      setLoading(true);
      setError(null);

      if (!supabase) {
        if (supabaseInitError) setError(supabaseInitError.message);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase!.auth.getSession();
        const s = data.session;
        setUser(
          s?.user
            ? { id: s.user.id, email: s.user.email ?? undefined }
            : null
        );

        const { data: sub } = supabase!.auth.onAuthStateChange((_evt, session) => {
          setUser(
            session?.user
              ? { id: session.user.id, email: session.user.email ?? undefined }
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
  }, [supabase, supabaseInitError]);

  async function signInWithGoogle() {
    if (!supabase) {
      const message = supabaseInitError?.message ?? "Supabase is not configured.";
      setError(message);
      return;
    }

    await supabase!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  async function signOut() {
    if (!supabase) return;
    await supabase!.auth.signOut();
    setUser(null);
  }

  const value: AuthContextValue = { loading, user, error, signInWithGoogle, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
