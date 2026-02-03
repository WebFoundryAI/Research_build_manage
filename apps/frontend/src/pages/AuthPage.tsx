import React from "react";
import { useAuth } from "../lib/auth";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.649 32.657 29.246 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.038 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.038 6.053 29.268 4 24 4 16.318 4 9.656 7.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.225 0-9.617-3.325-11.29-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.231-2.231 4.118-4.084 5.57h.001l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/>
    </svg>
  );
}

export default function AuthPage() {
  const { mode, loading, user, error, signInWithGoogle } = useAuth();

  if (loading) return <div className="min-h-[100dvh] grid place-items-center text-sm opacity-70">Loading…</div>;

  if (user) {
    return (
      <div className="min-h-[100dvh] grid place-items-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="text-sm font-semibold">Already signed in</div>
          <div className="mt-1 text-xs opacity-70">{user.email ?? user.id}</div>
          <div className="mt-4 text-xs opacity-60">Use the sidebar to navigate.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {mode === "demo"
              ? "Supabase isn’t configured, so the app is running in Demo Mode."
              : "Continue with Google to access the dashboard."}
          </p>
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-200">
            {error}
          </div>
        ) : null}

        <button
          onClick={() => signInWithGoogle()}
          className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {mode === "demo" ? null : <GoogleIcon />}
          {mode === "demo" ? "Enter Demo" : "Continue with Google"}
        </button>

        <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          {mode === "demo" ? "Demo Mode is intended for UI review only." : "Single sign-on via Supabase OAuth."}
        </div>
      </div>
    </div>
  );
}
