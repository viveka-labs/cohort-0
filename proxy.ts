/**
 * Root proxy file for Next.js 16.
 *
 * Think of this like a security guard at the front door of your app.
 * Before any page loads, this file runs two checks:
 *
 *   1. Refreshes the user's login session so they stay signed in
 *   2. Redirects unauthenticated users away from protected pages
 *
 * In Next.js 16, this file replaces the old "middleware.ts" convention.
 * The function must be named "proxy" (not "middleware").
 */

import { NextResponse, type NextRequest } from "next/server";

import { Routes } from "@/lib/constants/routes";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Paths that unauthenticated users can access.
 *
 * Everything else (home, builds, profile, etc.) requires a session.
 * We check with `startsWith` so sub-paths like /auth/callback are
 * also covered.
 *
 * API routes are included here because they handle their own auth
 * (returning 401 JSON responses instead of HTML redirects).
 */
const PUBLIC_PATHS = [Routes.LOGIN, Routes.AUTH_CALLBACK, "/api"] as const;

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSession(request);

  // If the user is not logged in and is trying to access a protected
  // route, redirect them to the login page.
  if (!isAuthenticated && !isPublicPath(request.nextUrl.pathname)) {
    const loginUrl = new URL(Routes.LOGIN, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

/**
 * The matcher tells Next.js which routes should go through this proxy.
 *
 * This pattern uses a "negative lookahead" — a fancy way of saying
 * "run on everything EXCEPT these paths":
 *
 *   - _next/static  → built JS/CSS bundles (no auth needed)
 *   - _next/image   → optimized images (no auth needed)
 *   - favicon.ico   → browser tab icon
 *   - sitemap.xml   → SEO sitemap (no auth needed)
 *   - robots.txt    → search engine crawl rules (no auth needed)
 *   - *.svg/png/jpg/jpeg/gif/webp → image files in /public
 *
 * Everything else (pages, API routes, etc.) gets the session refresh.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
