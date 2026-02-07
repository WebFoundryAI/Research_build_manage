import React from "react";
import { useAuth } from "../lib/auth";

export default function AuthPage() {
  const { loading, user, error, signInWithGoogle } = useAuth();

  if (loading) return <div className="text-sm opacity-70">Loading…</div>;
  if (user) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="text-sm font-semibold">Already signed in</div>
        <div className="mt-1 text-xs opacity-70">{user.email ?? user.id}</div>
        <div className="mt-3 text-xs opacity-60">Use the sidebar to navigate.</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="text-sm opacity-70">Sign in with Google via Supabase OAuth.</p>

      {error ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <button
        onClick={() => signInWithGoogle()}
        className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold hover:bg-slate-700"
      >
        Continue with Google
      </button>
    </div>
  );
}
