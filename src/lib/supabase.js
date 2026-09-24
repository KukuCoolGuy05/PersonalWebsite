import { createClient } from '@supabase/supabase-js';

// Set these in .env.local (see SETUP.md). The publishable/anon key is safe to ship
// to the browser — row-level security in supabase/schema.sql protects the data.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
