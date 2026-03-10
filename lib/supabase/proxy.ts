import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env.client";

/**
 * Refreshes the user's auth session on every request and keeps
 * cookies in sync between the browser and server.
 *
 * Returns both the response (with refreshed cookies) and whether
 * the user is authenticated — so the proxy can gate routes without
 * making a second auth call.
 *
 * Call this from your root proxy.ts file:
 *
 *   import { updateSession } from "@/lib/supabase/proxy"
 *
 *   export async function proxy(request: NextRequest) {
 *     const { response } = await updateSession(request)
 *     return response
 *   }
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // When Supabase refreshes an auth token, it calls setAll with the new cookies.
        // We do three things here so the fresh token reaches everyone:
        // 1. Update the request — so Server Components downstream see the new token
        // 2. Rebuild the response from the updated request — required by Next.js
        // 3. Set cookies on the response — so the browser stores them for next time
        setAll(cookiesToSet) {
          // First, update the request cookies so downstream code sees them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Re-create the response so it carries the updated request cookies
          supabaseResponse = NextResponse.next({
            request,
          });

          // Then, set the cookies on the response so the browser receives them
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session so it doesn't expire.
  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard
  // to debug issues with users being randomly logged out.
  //
  // getClaims() validates the JWT — locally with asymmetric keys (RS256),
  // or via a server call with symmetric keys (HS256, the Supabase default).
  // We use getClaims() here instead of getUser() so the proxy automatically
  // becomes zero-cost if the project switches to asymmetric keys later.
  const { data } = await supabase.auth.getClaims();

  return {
    response: supabaseResponse,
    isAuthenticated: data !== null,
  };
}
