import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("your_supabase");

export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl!, supabaseKey!)
  : null;

export const isDbReady = isSupabaseConfigured;
