import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client for auth and public queries
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Product type for Supabase physical objects
export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  description_lines?: string[] | null;
  price: number; // Backward compatibility
  base_price?: number | null;
  house_price?: number | null;
  stock_quantity: number;
  category: string | null;
  image_url?: string | null;
  images?: Array<{ url: string; position: number; alt?: string }> | null; // Multi-image array
  variants?: Array<ProductVariant> | null; // Variant support
  is_variant_parent?: boolean;
  options?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  sync_source?: string | null;
  last_synced_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  house_price?: number;
  stock_quantity: number;
  image_indices?: number[]; // Maps to images array positions
  options?: Record<string, string>; // e.g., { color: "Black", style: "Moth" }
}
