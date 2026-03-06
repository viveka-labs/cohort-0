import { z } from "zod";

// ---------------------------------------------------------------------------
// Why two separate env objects?
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
// So we split the config into:
//   - clientEnv  — uses literal references, safe in both browser and server
//   - serverEnv  — uses process.env object, server-side only
// ---------------------------------------------------------------------------

// --- Client env (safe in browser + server) --------------------------------

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

// Each value MUST be a literal `process.env.NEXT_PUBLIC_*` reference so
// Next.js can find and inline it during the build.
export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

// --- Server env (server-side only) ----------------------------------------

const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().optional(),
});

// Passing the full process.env object is fine here because server-side code
// always has access to all environment variables at runtime.
export const serverEnv = serverEnvSchema.parse(process.env);
