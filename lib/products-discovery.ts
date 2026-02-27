/**
 * Product Discovery - Enhanced product queries for curated grid experience
 * Feature: product-discovery-threshold
 */

import { getSupabaseServerClient } from './supabase/server';
import { transformSupabaseProduct, UnifiedProduct } from './products';

/**
 * Fetch products for discovery grid with featured status
 * Includes date validation for featured_until and orders by featured status
 */
export async function getDiscoveryProducts(): Promise<UnifiedProduct[]> {
  try {
    const supabase = getSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*, is_featured, featured_until, featured_reason')
      .gt('stock_quantity', 0) // Only in-stock products
      .or(`is_featured.is.null,is_featured.eq.false,and(is_featured.eq.true,or(featured_until.is.null,featured_until.gt.${new Date().toISOString()}))`)
      .order('is_featured', { ascending: false, nullsFirst: false })
      .order('title', { ascending: true });

    if (error) {
      console.error('[ProductDiscovery] Query failed:', error);
      return [];
    }

    return (data || []).map(transformSupabaseProduct);
  } catch (error) {
    console.error('[ProductDiscovery] Fetch failed:', error);
    return [];
  }
}

/**
 * Calculate House pricing (10% off, rounded)
 * Enforces the Dual Pricing Law
 */
export function calculateHousePrice(standardPrice: number): number {
  return Math.round(standardPrice * 0.9);
}
