/**
 * Root proxy file for Next.js 16.
 *
 * Think of this like a security guard at the front door of your app.
 * Before any page loads, this file runs and refreshes the user's
 * login session so they stay signed in as they navigate around.
 *
 * In Next.js 16, this file replaces the old "middleware.ts" convention.
 * The function must be named "proxy" (not "middleware").
 */

import { updateSession } from "@/lib/supabase/proxy";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
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
