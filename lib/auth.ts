import { redirect } from "next/navigation";

import { Routes } from "@/lib/constants/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the currently authenticated user, or null if not logged in.
 *
 * Uses `supabase.auth.getUser()` which validates the JWT against the
 * Supabase Auth server — never trust `getSession()` on the server side.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Returns the currently authenticated user, or redirects to `/login`
 * if no user is found.
 *
 * Use this in pages/actions that require authentication.
 */
export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect(Routes.LOGIN);
  }

  return user;
}
