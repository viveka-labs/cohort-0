import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback handler.
 *
 * After a user signs in with an OAuth provider (e.g. Google, GitHub),
 * Supabase redirects them here with a `code` query parameter.
 * This route exchanges that code for a session and then redirects
 * the user to the home page.
 *
 * Expected flow:
 *   1. Read the `code` search param from the incoming request URL
 *   2. Call `supabase.auth.exchangeCodeForSession(code)` to establish the session
 *   3. Redirect the user to "/" on success
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  redirect("/");
}
