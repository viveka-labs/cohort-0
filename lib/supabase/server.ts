import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv } from "@/lib/env";

/**
 * Creates a Supabase client for use on the server (Server Components,
 * Route Handlers, and Server Actions).
 *
 * This is async because Next.js requires awaiting the cookie store.
 * The cookie handlers let Supabase read and write auth session cookies
 * on the server side.
 *
 * Usage in a Server Component:
 *   const supabase = await createClient()
 *   const { data } = await supabase.from("posts").select()
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have a proxy refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
