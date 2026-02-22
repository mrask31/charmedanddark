/**
 * Admin authorization utilities
 * Checks if user email is in admin whitelist (NEXT_PUBLIC_ADMIN_EMAILS or ADMIN_EMAILS)
 * 
 * BULLETPROOF FEATURES:
 * - Normalizes emails (trim + lowercase)
 * - Supports both NEXT_PUBLIC_ADMIN_EMAILS and ADMIN_EMAILS env vars
 * - Self-diagnosing debug info
 */

import { getSupabaseClient } from '@/lib/supabase/client';

export interface AdminDebugInfo {
  userEmail: string | null;
  adminWhitelist: string[];
  envVarUsed: 'NEXT_PUBLIC_ADMIN_EMAILS' | 'ADMIN_EMAILS' | 'NONE';
  isAdmin: boolean;
  envVarRaw: string;
}

/**
 * Get admin email whitelist from environment variables
 * Prefers NEXT_PUBLIC_ADMIN_EMAILS, falls back to ADMIN_EMAILS
 * Returns normalized (trimmed, lowercased) email list
 */
export function getAdminWhitelist(): { emails: string[]; source: 'NEXT_PUBLIC_ADMIN_EMAILS' | 'ADMIN_EMAILS' | 'NONE'; raw: string } {
  // Try NEXT_PUBLIC_ADMIN_EMAILS first (preferred)
  const publicAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  if (publicAdminEmails && publicAdminEmails.trim()) {
    return {
      emails: publicAdminEmails
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(email => email.length > 0),
      source: 'NEXT_PUBLIC_ADMIN_EMAILS',
      raw: publicAdminEmails,
    };
  }

  // Fallback to ADMIN_EMAILS
  const adminEmails = process.env.ADMIN_EMAILS;
  if (adminEmails && adminEmails.trim()) {
    return {
      emails: adminEmails
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(email => email.length > 0),
      source: 'ADMIN_EMAILS',
      raw: adminEmails,
    };
  }

  // No env var configured
  return {
    emails: [],
    source: 'NONE',
    raw: '',
  };
}

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

  // Get admin whitelist
  const { emails: adminList } = getAdminWhitelist();
  
  // Normalize user email and check against whitelist
  const normalizedUserEmail = user.email.trim().toLowerCase();
  
  if (adminList.includes(normalizedUserEmail)) {
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

/**
 * Get admin debug information (for troubleshooting)
 * Shows current user, whitelist, and access status
 */
export async function getAdminDebugInfo(): Promise<AdminDebugInfo> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const whitelist = getAdminWhitelist();
  const userEmail = user?.email || null;
  const normalizedUserEmail = userEmail ? userEmail.trim().toLowerCase() : null;
  const isAdmin = normalizedUserEmail ? whitelist.emails.includes(normalizedUserEmail) : false;

  return {
    userEmail,
    adminWhitelist: whitelist.emails,
    envVarUsed: whitelist.source,
    isAdmin,
    envVarRaw: whitelist.raw,
  };
}
