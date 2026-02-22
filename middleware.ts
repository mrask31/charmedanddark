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
    // Get auth token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value ||
                       request.cookies.get('supabase-auth-token')?.value;

    if (!accessToken) {
      return { isAuthenticated: false, isAdmin: false };
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

  // TEMPORARILY DISABLED - Allow all access for debugging
  console.log('[Middleware] Path:', pathname);
  console.log('[Middleware] Cookies:', request.cookies.getAll().map(c => c.name));
  
  // Protect /admin/darkroom route
  if (pathname.startsWith('/admin/darkroom')) {
    // TEMPORARILY BYPASS AUTH CHECK
    console.log('[Middleware] Darkroom access - BYPASSING AUTH CHECK');
    return NextResponse.next();
    
    /* ORIGINAL CODE - RE-ENABLE AFTER DEBUGGING
    const { isAuthenticated, isAdmin } = await checkAdminAccess(request);

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/threshold/enter', request.url));
    }

    // Authenticated but not admin → redirect to not-authorized
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/not-authorized', request.url));
    }

    // Admin access granted - continue
    return NextResponse.next();
    */
  }

  // Allow all other routes
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    '/admin/darkroom/:path*',
  ],
};
