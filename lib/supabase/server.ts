import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with service role key
 * Bypasses RLS for admin operations
 * 
 * IMPORTANT: Only use in server-side code (API routes, server actions)
 * Never expose service role key to client
 */

// Order type for database
export interface Order {
  id: string;
  shopify_order_id: string;
  order_number: string;
  line_items: any[];
  shipping_address: any;
  total_price: number;
  currency: string;
  created_at: string;
  [key: string]: any;
}

export function getSupabaseServer() {
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

// Alias for consistency
export const getSupabaseServerClient = getSupabaseServer;
