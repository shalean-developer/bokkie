import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/supabase/config";

let browserClient: SupabaseClient | null = null;

/**
 * Create a Supabase client for client-side use.
 * This should only be used in Client Components.
 */
export function createClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}




























