import { useState } from 'react';
import { supabase } from '@common/supabaseClient';

/**
 * AuthPage provides a simple interface for users to sign in with Google
 * using Supabase auth.  When the user is not logged in, a button will
 * trigger the OAuth flow.  If the user is logged in, their email and a
 * sign‑out button are shown.  You must configure Google OAuth in your
 * Supabase project and provide the environment variables VITE_SUPABASE_URL
 * and VITE_SUPABASE_ANON_KEY in your Cloudflare Pages project settings.
 */
export default function AuthPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      alert('Error signing in: ' + error.message);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Error signing out: ' + error.message);
    } else {
      setUserEmail(null);
    }
  }

  // Listen for auth changes.  When mounted, subscribe to changes in auth state
  supabase.auth.onAuthStateChange((_event, session) => {
    const email = session?.user?.email ?? null;
    setUserEmail(email);
  });

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to Super SEO Tool</h1>
      {userEmail ? (
        <div className="text-center">
          <p className="mb-2">Signed in as {userEmail}</p>
          <button
            onClick={signOut}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}