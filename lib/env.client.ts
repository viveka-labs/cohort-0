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
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
