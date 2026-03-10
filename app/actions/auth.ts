"use server";

import { redirect } from "next/navigation";

import { Routes } from "@/lib/constants/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Signs the user out by clearing the Supabase session and redirecting
 * to the login page.
 *
 * Uses the "local" scope so only the current browser session is ended,
 * not all sessions across devices.
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    redirect(`${Routes.LOGIN}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(Routes.LOGIN);
}
