import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _serverSupabase: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (!_serverSupabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase server environment variables are missing");
    }

    _serverSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return _serverSupabase;
}
