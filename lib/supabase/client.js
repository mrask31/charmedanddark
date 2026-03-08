import { createClient } from '@supabase/supabase-js';

// Public client — safe for client-side, respects RLS
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
