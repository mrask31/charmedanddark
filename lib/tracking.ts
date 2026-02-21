/**
 * User Behavior Tracking
 * Lightweight tracking for product views and user interactions
 */

import { getSupabaseClient } from './supabase/client';

/**
 * Track product view
 */
export async function trackProductView(productId: string, productHandle: string) {
  try {
    const supabase = getSupabaseClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Don't track anonymous users
      return;
    }

    // Generate session ID (stored in sessionStorage)
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }

    // Insert view record
    const { error } = await supabase
      .from('user_product_views')
      .insert({
        user_id: user.id,
        product_id: productId,
        product_handle: productHandle,
        session_id: sessionId,
      });

    if (error) {
      console.error('Error tracking product view:', error);
    }
  } catch (err) {
    console.error('Failed to track product view:', err);
  }
}

/**
 * Get user's recently viewed products
 */
export async function getRecentlyViewedProducts(limit: number = 10) {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_product_views')
      .select('product_handle, viewed_at')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching viewed products:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch viewed products:', err);
    return [];
  }
}
