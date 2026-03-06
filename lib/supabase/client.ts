import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env.client";

/**
 * Creates a Supabase client for use in the browser (Client Components).
 *
 * Think of this like a "logged-in connection" to your database that runs
 * in the user's browser. It automatically handles cookies for auth sessions.
 *
 * Usage in a Client Component:
 *   const supabase = createClient()
 *   const { data } = await supabase.from("posts").select()
 */
export function createClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
