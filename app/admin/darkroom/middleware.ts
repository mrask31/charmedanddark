/**
 * Server-side middleware for Darkroom admin route protection
 * Enforces authentication and admin whitelist at the server level
 * 
 * This prevents URL-based access bypassing client-side checks
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Get admin whitelist from environment (server-side)
 */
function getServerAdminWhitelist(): string[] {
  // Try NEXT_PUBLIC_ADMIN_EMAILS first
  const publicAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  if (publicAdminEmails && publicAdminEmails.trim()) {
    return publicAdminEmails
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
  }

  // Fallback to ADMIN_EMAILS
  const adminEmails = process.env.ADMIN_EMAILS;
  if (adminEmails && adminEmails.trim()) {
    return adminEmails
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
  }

  return [];
}

/**
 * Server-side admin access check
 */
export async function checkServerAdminAccess(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { isAuthenticated: false, isAdmin: false, userEmail: null };
  }

  // Get auth token from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value ||
                     request.cookies.get('supabase-auth-token')?.value;

  if (!accessToken) {
    return { isAuthenticated: false, isAdmin: false, userEmail: null };
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  // Get user from session
  const { data: { user } } = await supabase.auth.getUser(accessToken);

  if (!user?.email) {
    return { isAuthenticated: false, isAdmin: false, userEmail: null };
  }

  // Check admin whitelist
  const adminWhitelist = getServerAdminWhitelist();
  const normalizedUserEmail = user.email.trim().toLowerCase();
  const isAdmin = adminWhitelist.includes(normalizedUserEmail);

  return {
    isAuthenticated: true,
    isAdmin,
    userEmail: user.email,
  };
}

/**
 * Middleware function for Darkroom route protection
 */
export async function darkroomMiddleware(request: NextRequest) {
  const { isAuthenticated, isAdmin } = await checkServerAdminAccess(request);

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/threshold/enter', request.url));
  }

  // Authenticated but not admin → redirect to not-authorized
  if (!isAdmin) {
    return NextResponse.redirect(new URL('/not-authorized', request.url));
  }

  // Admin access granted
  return NextResponse.next();
}
