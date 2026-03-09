# Nexus -- AI-Native Designer Cohort

4-week program turning product designers into design engineers using AI.

## Audience

Product designers with near-zero frontend knowledge. Explain everything through design analogies. Avoid jargon.

## Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui (in `components/ui/`)
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **AI:** Claude API via Vercel AI SDK
- **Deploy:** Vercel

## Project Structure

```
app/
  (auth)/          # Auth route group: login, signup
  (main)/          # Main route group: home, feed, profile
  api/             # API route handlers
  layout.tsx       # Root layout
components/
  ui/              # shadcn/ui primitives (Button, Input, etc.)
  auth/            # Auth-related components
  builds/          # Build card, form, etc.
  feed/            # Feed page components
  layout/          # Shared layout components (header, nav)
  profile/         # Profile page components
lib/
  constants/       # App-wide constants (routes, mime types)
  queries/         # Server-only Supabase queries (ai-tools, builds, etc.)
  supabase/        # Supabase client setup (server.ts, client.ts, middleware.ts)
  validations/     # Zod schemas for form/API validation
  auth.ts          # Auth helper utilities
  env.client.ts    # Zod-validated public env vars (NEXT_PUBLIC_*)
  env.server.ts    # Zod-validated server-only env vars
  utils.ts         # General utilities (cn, etc.)
supabase/
  migrations/      # SQL migration files (applied in order)
  seed.sql         # Seed data for local development
  config.toml      # Local Supabase configuration
types/
  index.ts         # App-wide TypeScript types derived from database.types
```

## Architecture

### Route Groups

- `(auth)` -- Login/signup pages with their own layout
- `(main)` -- Authenticated app pages with shared navigation layout

### Server-Only Queries

All database queries live in `lib/queries/` and import `"server-only"`. They use the server Supabase client from `lib/supabase/server.ts`. Never import these in Client Components.

### Environment Variables

- Validated at startup via Zod (`lib/env.client.ts` and `lib/env.server.ts`)
- Copy `.env.local.example` to `.env.local` for local development
- `NEXT_PUBLIC_*` vars are inlined by Next.js at build time -- must be literal `process.env.NEXT_PUBLIC_*` references

### Generated Types

- `lib/supabase/database.types.ts` -- Generated from local Supabase (`npm run gen-types`)
- `types/index.ts` -- App-level type aliases derived from generated types

### Database Scripts

| Script       | Command                                                            |
| ------------ | ------------------------------------------------------------------ |
| `db:push`    | Push migrations to linked remote project                           |
| `db:migrate` | Create a new migration file                                        |
| `db:types`   | Generate TypeScript types from linked remote project               |
| `db:status`  | Show local Supabase status                                         |
| `gen-types`  | Generate TypeScript types from local Supabase                      |

## Database

- **9 tables:** profiles, ai_tools, tech_stack_tags, builds, build_screenshots, build_ai_tools, build_tech_stack_tags, comments, upvotes
- **RLS enabled** on all tables with granular policies
- **Migrations:** `supabase/migrations/` (applied in filename order)
- **Seed data:** `supabase/seed.sql` (13 AI tools, 15 tech stack tags)

## Code Style

- Keep code simple and readable -- students will read this
- Prefer explicit over clever
- Always make components responsive and accessible
- Use Tailwind utility classes, no custom CSS unless necessary
