import { z } from "zod";

// Server-side only — never import this file in Client Components or
// browser-side code. Use lib/env.client.ts for public env vars instead.

const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().optional(),
});

// Passing the full process.env object is fine here because server-side code
// always has access to all environment variables at runtime.
export const serverEnv = serverEnvSchema.parse(process.env);
