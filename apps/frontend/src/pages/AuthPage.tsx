import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && user) nav('/dashboard', { replace: true });
  }, [loading, user, nav]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 shadow-soft p-6">
        <div className="text-xl font-semibold">Research • Build • Manage</div>
        <div className="text-sm text-slate-300 mt-1">
          Sign in with Google to access the unified SEO & automation workspace.
        </div>

        <div className="mt-6">
          <button
            onClick={() => signInWithGoogle()}
            className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 font-medium hover:opacity-95"
            disabled={loading}
          >
            Continue with Google
          </button>
          <div className="text-xs text-slate-400 mt-3">
            Google-only login (no email/password). Admin controls live under /admin.
          </div>
        </div>
      </div>
    </div>
  );
}
