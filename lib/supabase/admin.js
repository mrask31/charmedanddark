import { createClient } from '@supabase/supabase-js';

// Admin client — server-side ONLY, bypasses RLS
// NEVER import this file in a client component or expose it to the browser
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
