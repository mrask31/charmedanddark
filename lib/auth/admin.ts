/**
 * Admin authorization utilities
 * Checks if user email is in ADMIN_EMAILS environment variable
 */

import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Check if current user is an admin
 * Returns user email if admin, null otherwise
 */
export async function checkAdminAccess(): Promise<string | null> {
  const supabase = getSupabaseClient();
  
  // Get current user
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user?.email) {
    return null;
  }

  // Check if user email is in admin list
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  const adminList = adminEmails.split(',').map(email => email.trim().toLowerCase());
  
  if (adminList.includes(user.email.toLowerCase())) {
    return user.email;
  }

  return null;
}

/**
 * Check if user is authenticated (logged in)
 */
export async function checkAuthenticated(): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}
