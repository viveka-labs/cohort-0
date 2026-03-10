"use server";

import { redirect } from "next/navigation";

import { Routes } from "@/lib/constants/routes";
import { clientEnv } from "@/lib/env.client";
import { createClient } from "@/lib/supabase/server";

/**
 * Initiates an OAuth sign-in flow with the given provider using
 * Supabase's PKCE flow.
 *
 * Builds the callback URL from NEXT_PUBLIC_SITE_URL, calls
 * signInWithOAuth, and redirects the browser to the provider's
 * consent screen. On success, the provider sends the user back
 * to /auth/callback with an authorization code.
 */
async function signInWithProvider(provider: "google" | "github") {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${clientEnv.NEXT_PUBLIC_SITE_URL}${Routes.AUTH_CALLBACK}`,
    },
  });

  if (error) {
    redirect(`${Routes.LOGIN}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(data.url);
}

export async function signInWithGoogle() {
  return signInWithProvider("google");
}

export async function signInWithGithub() {
  return signInWithProvider("github");
}
