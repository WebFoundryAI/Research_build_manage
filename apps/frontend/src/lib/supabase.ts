import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // Intentionally throw during runtime so misconfiguration is obvious.
  // Cloudflare Pages: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
  // (These are safe to expose to the browser; do NOT put service role keys here.)
  console.warn('Supabase env vars missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url ?? '', anon ?? '');
