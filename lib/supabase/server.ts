import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
export function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Database types
export interface Order {
  id: string;
  shopify_order_id: string;
  order_number: string;
  line_items: LineItem[];
  shipping_address: ShippingAddress;
  total_price: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  product_id: string;
  variant_id: string;
  title: string;
  variant_title?: string;
  quantity: number;
  price: number;
  image?: {
    url: string;
    alt: string;
  };
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
}

export interface WebhookLog {
  event_type: string;
  shopify_order_id: string | null;
  verification_status: 'success' | 'failed';
  processing_status: 'success' | 'failed';
  error_message?: string;
}
