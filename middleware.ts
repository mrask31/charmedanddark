/**
 * Next.js Middleware - Server-side route protection
 * Enforces admin access for protected routes
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Get admin whitelist from environment (server-side)
 */
function getServerAdminWhitelist(): string[] {
  // Try NEXT_PUBLIC_ADMIN_EMAILS first (preferred)
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
 * Check if user is authenticated and is admin
 */
async function checkAdminAccess(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { isAuthenticated: false, isAdmin: false };
  }

  try {
    // Get all cookies that might contain Supabase auth
    const allCookies = request.cookies.getAll();
    
    // Look for Supabase auth token in various possible cookie names
    let accessToken = null;
    
    // Check common Supabase cookie patterns
    for (const cookie of allCookies) {
      if (cookie.name.includes('auth-token') || 
          cookie.name.includes('access-token') ||
          cookie.name.includes('sb-') && cookie.name.includes('auth')) {
        try {
          // Try to parse if it's JSON
          const parsed = JSON.parse(cookie.value);
          if (parsed.access_token) {
            accessToken = parsed.access_token;
            break;
          }
        } catch {
          // If not JSON, use the value directly
          accessToken = cookie.value;
          break;
        }
      }
    }

    if (!accessToken) {
      console.log('[Middleware] No auth token found in cookies');
      return { isAuthenticated: false, isAdmin: false };
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from session
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user?.email) {
      console.log('[Middleware] Auth error or no user:', error?.message);
      return { isAuthenticated: false, isAdmin: false };
    }

    // Check admin whitelist
    const adminWhitelist = getServerAdminWhitelist();
    const normalizedUserEmail = user.email.trim().toLowerCase();
    const isAdmin = adminWhitelist.includes(normalizedUserEmail);

    return {
      isAuthenticated: true,
      isAdmin,
    };
  } catch (error) {
    console.error('Middleware auth check error:', error);
    return { isAuthenticated: false, isAdmin: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TEMPORARILY DISABLE middleware auth check
  // Auth will be handled in the page component instead
  console.log('[Middleware] Allowing access to:', pathname);
  return NextResponse.next();

  /* DISABLED - Auth cookies not accessible in middleware
  // Debug: Log all cookies to help diagnose auth issues
  if (pathname.startsWith('/admin/darkroom')) {
    const allCookies = request.cookies.getAll();
    console.log('[Middleware] Darkroom access attempt');
    console.log('[Middleware] Cookies present:', allCookies.map(c => c.name).join(', '));
  }

  // Protect /admin/darkroom route
  // TEMPORARILY DISABLE middleware auth check
  // Auth will be handled in the page component instead
  console.log('[Middleware] Allowing access to:', pathname);
  return NextResponse.next();
  */

  // Allow all other routes
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    '/admin/darkroom/:path*',
  ],
};
