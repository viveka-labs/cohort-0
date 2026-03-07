# Contributing

Welcome! This guide explains how to set up the project depending on what you're working on.

## Which setup do I need?

| I'm working on... | Setup |
|---|---|
| UI, components, pages | Option A — Frontend setup (no Docker) |
| Database, migrations, RLS policies | Option B — Local Supabase setup (Docker required) |

---

## Option A — Frontend Setup (~5 minutes)

No Docker needed. You'll connect to the shared production Supabase project.

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Ask the team lead on Discord for the Supabase credentials and paste them in

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're good to go.

---

## Option B — Local Supabase Setup (~15 minutes)

Use this when working on database schema, migrations, or RLS policies. Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# 1. Install dependencies
npm install

# 2. Start Docker Desktop (open the app), then start local Supabase
npx supabase start
# This downloads Supabase images the first time — takes a few minutes
# When done, it prints a URL and publishable key — you'll need these next

# 3. Set up environment variables
cp .env.local.example .env.local
# Paste the URL and publishable key from the supabase start output:
#   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
#   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>

# 4. Apply migrations and seed data
npx supabase db reset

# 5. Generate TypeScript types
npm run gen-types

# 6. Start the development server
npm run dev
```

### Making database changes

```bash
# 1. Create a new migration file
npx supabase migration new your_migration_name

# 2. Write your SQL in the new file (supabase/migrations/...)

# 3. Test it locally
npx supabase db reset

# 4. Regenerate TypeScript types
npm run gen-types

# 5. Commit the migration file and updated types, then open a PR
```

> **Important:** Never run `supabase db push` manually against the production project.
> Schema changes are applied to production by the team lead after a PR is merged.

---

## Branch Strategy

- Create a feature branch for your work: `your-name/issue-{number}-{short-description}`
- Open a PR against `main`
- No separate `dev` branch — keep it simple

---

## Getting Help

Ask on Discord if you're stuck. Include what command you ran and the error message.
