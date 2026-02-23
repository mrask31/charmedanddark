/**
 * Sanctuary Authentication Helpers
 * Check member status and apply discounts
 */

import { getSupabaseClient } from '@/lib/supabase/client';

export async function isSanctuaryMember(): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return false;
  }

  // Check if user has sanctuary_member metadata
  return session.user.user_metadata?.sanctuary_member === true;
}

export async function getSanctuarySession() {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function applyMemberDiscount(price: number): number {
  return price * 0.9; // 10% discount
}

export function formatMemberPrice(price: number): string {
  const discountedPrice = applyMemberDiscount(price);
  return discountedPrice.toFixed(2);
}
