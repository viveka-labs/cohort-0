"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

/**
 * Initiates Google OAuth sign-in using Supabase's PKCE flow.
 *
 * Builds the callback URL from the request origin, calls signInWithOAuth,
 * and redirects the browser to Google's consent screen. On success,
 * Google sends the user back to /auth/callback with an authorization code.
 */
export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(data.url);
}

/**
 * Initiates GitHub OAuth sign-in using Supabase's PKCE flow.
 *
 * Same flow as Google: build callback URL, call signInWithOAuth,
 * redirect to GitHub's authorization page.
 */
export async function signInWithGithub() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(data.url);
}
