import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client (anon key only).
 * Safe for client components — Row Level Security enforces data isolation.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
