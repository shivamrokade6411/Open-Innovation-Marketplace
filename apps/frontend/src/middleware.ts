/*
 * Purpose: Next.js middleware for auth and role-based route protection.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { NextRequest, NextResponse } from 'next/server';

const protectedPrefixes = ['/dashboard', '/company', '/admin', '/messages', '/notifications', '/certificates', '/settings', '/profile'];

function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Apply authentication redirects for protected and auth routes.
 * @param request Incoming Next.js request.
 * @returns Redirect or next response.
 * @throws Never throws.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value ?? '';
  const isAuthenticated = Boolean(token);

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/admin') && isAuthenticated) {
    const role = request.cookies.get('userRole')?.value ?? '';
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/company/:path*', '/admin/:path*', '/messages/:path*', '/notifications/:path*', '/certificates/:path*', '/settings/:path*', '/profile/:path*', '/login', '/register']
};
