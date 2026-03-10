import { z } from "zod";

// ---------------------------------------------------------------------------
// Why literal process.env references?
//
// Next.js inlines NEXT_PUBLIC_* variables into the browser bundle at BUILD
// time, but only when they appear as *literal* expressions like:
//
//   process.env.NEXT_PUBLIC_SUPABASE_URL        // works in the browser
//
// If you pass the whole `process.env` object to Zod (or destructure it),
// Next.js can't detect the references and the values end up `undefined`
// in Client Components:
//
//   envSchema.parse(process.env)                 // breaks in the browser
//
// So each value below MUST be a literal `process.env.NEXT_PUBLIC_*` reference
// so Next.js can find and inline it during the build.
// ---------------------------------------------------------------------------

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(
      1,
      "Missing NEXT_PUBLIC_SUPABASE_URL — copy .env.local.example to .env.local",
    ),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(
      1,
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — copy .env.local.example to .env.local",
    ),
  // ---------------------------------------------------------------------------
  // Site URL fallback chain (for OAuth redirect URLs):
  //
  //   1. NEXT_PUBLIC_SITE_URL   — explicitly set in .env.local or Vercel project settings
  //   2. NEXT_PUBLIC_VERCEL_URL — auto-set by Vercel on every deployment (no protocol)
  //   3. http://localhost:3000  — local development fallback
  //
  // NEXT_PUBLIC_SITE_URL is optional so that Vercel preview deployments work
  // automatically without manual env var configuration.
  // ---------------------------------------------------------------------------
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .transform((val) => val.replace(/\/+$/, ""))
    .optional(),
  NEXT_PUBLIC_VERCEL_URL: z
    .string()
    .min(1)
    .transform((val) => val.replace(/\/+$/, ""))
    .optional(),
});

const parsedEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || undefined,
});

/**
 * Resolves the site URL using the fallback chain:
 *   NEXT_PUBLIC_SITE_URL → NEXT_PUBLIC_VERCEL_URL → localhost
 *
 * NEXT_PUBLIC_VERCEL_URL does not include the protocol, so we prepend https://.
 */
function resolveSiteUrl(): string {
  if (parsedEnv.NEXT_PUBLIC_SITE_URL) {
    return parsedEnv.NEXT_PUBLIC_SITE_URL;
  }

  if (parsedEnv.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${parsedEnv.NEXT_PUBLIC_VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: parsedEnv.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    parsedEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: resolveSiteUrl(),
};
