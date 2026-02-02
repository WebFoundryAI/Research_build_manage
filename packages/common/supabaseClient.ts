// packages/common/supabaseClient.ts
//
// This module centralises the creation of a Supabase client.  In the
// frontend application you can import this helper to get a configured
// instance of the Supabase JS client for making calls to your database
// (e.g. to fetch user profiles or website records).  The URL and key are
// loaded from environment variables at runtime.  When deploying on
// Cloudflare Pages, you can define these env vars via the Pages project
// settings.

import { createClient } from '@supabase/supabase-js';

// Provide defaults so unit tests / development do not throw immediately.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);