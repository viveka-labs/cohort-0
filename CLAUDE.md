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
- **Deploy:** Vercel (project: `bob-the-builder` in `innovativegamers-projects` scope)

## Environments

Three-environment model: **Local**, **Dev**, and **Prod**.

| Environment | Supabase Project Ref      | Branch | Vercel URL                               |
| ----------- | ------------------------- | ------ | ---------------------------------------- |
| Local       | Docker (`supabase start`) | --     | `http://localhost:3000`                  |
| Dev         | `fpbglwvzpmqmtdtrhuhc`    | `dev`  | `https://dev.bob-the-builder.vercel.app` |
| Prod        | `nktwfzcadffzfthslckx`    | `main` | `https://bob-the-builder.vercel.app`     |

### Branch Workflow

```
feature/* ──> dev ──> main
```

- **`dev`** is the default PR target. All feature branches merge into `dev`.
- **`main`** is the production branch. Only `dev` merges into `main` (promotion).
- Vercel deploys `dev` to Preview and `main` to Production automatically.

### Migration Workflow

1. Create and test migrations locally (`db:reset` + `gen-types:local`)
2. After merging to `dev`, apply to the dev project (`db:push` linked to dev)
3. After promoting to `main`, apply to prod (`db:push` linked to prod)

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
  supabase/        # Supabase client setup (server.ts, client.ts, proxy.ts)
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
- Copy `.env.example` to `.env` for local development
- `NEXT_PUBLIC_*` vars are inlined by Next.js at build time -- must be literal `process.env.NEXT_PUBLIC_*` references

### Generated Types

- `lib/supabase/database.types.ts` -- Generated from local Supabase (`npm run gen-types:local`)
- `types/index.ts` -- App-level type aliases derived from generated types

### Database Scripts

| Script            | Target | What it does                                                         |
| ----------------- | ------ | -------------------------------------------------------------------- |
| `db:start`        | Local  | Start local Supabase (Docker containers)                             |
| `db:stop`         | Local  | Stop local Supabase and remove containers                            |
| `db:reset`        | Local  | Wipe and re-apply all migrations + seed data                         |
| `db:push`         | Remote | Apply pending migrations to linked remote project (team lead only)   |
| `db:status`       | Local  | Show local Supabase status and connection info                       |
| `gen-types:local` | Local  | Generate TypeScript types from local Supabase                        |
| `gen-types:dev`   | Dev    | Generate TypeScript types from dev Supabase (`fpbglwvzpmqmtdtrhuhc`) |
| `gen-types:prod`  | Prod   | Generate TypeScript types from prod (`SUPABASE_PROJECT_ID` required) |

Local workflow: `db:start` → `db:reset` → `gen-types:local` → `npm run dev` → `db:stop` when done.

> `db:push` targets whichever remote project is linked. The team lead links to dev or prod as needed before running this command.

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
