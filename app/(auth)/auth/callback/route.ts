import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";

import { Routes } from "@/lib/constants/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback handler.
 *
 * After a user signs in with an OAuth provider (e.g. Google, GitHub),
 * Supabase redirects them here with either:
 *   - A `code` query parameter on success (PKCE flow)
 *   - An `error` + `error_description` query parameter on failure
 *
 * Expected flow:
 *   1. Check for OAuth error params — redirect to /login with the error message
 *   2. Check for `code` param — exchange it for a session
 *   3. If the exchange fails — redirect to /login with error
 *   4. If no code or error is present — redirect to /login (unexpected state)
 *   5. Redirect to "/" on success
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const code = searchParams.get("code");

  if (error) {
    const message = errorDescription ?? error;
    redirect(`${Routes.LOGIN}?error=${encodeURIComponent(message)}`);
  }

  if (!code) {
    redirect(`${Routes.LOGIN}?error=${encodeURIComponent("Missing authorization code")}`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code,
  );

  if (exchangeError) {
    redirect(
      `${Routes.LOGIN}?error=${encodeURIComponent(exchangeError.message)}`,
    );
  }

  redirect(Routes.HOME);
}
