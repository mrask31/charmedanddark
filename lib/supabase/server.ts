import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with service role key
 * Bypasses RLS for admin operations
 * 
 * IMPORTANT: Only use in server-side code (API routes, server actions)
 * Never expose service role key to client
 */

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
