# Contributing

Welcome! This guide explains how to set up the project depending on what you're working on.

## Which setup do I need?

| I'm working on...                  | Setup                                             |
| ---------------------------------- | ------------------------------------------------- |
| UI, components, pages              | Option A — Frontend setup (no Docker)             |
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
npm run db:start
# This downloads Supabase images the first time — takes a few minutes
# When done, it prints a URL and publishable key — you'll need these next

# 3. Set up environment variables
cp .env.local.example .env.local
# Paste the URL and publishable key from the supabase start output:
#   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
#   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>

# 4. Apply migrations and seed data
npm run db:reset

# 5. Generate TypeScript types
npm run gen-types:local

# 6. Start the development server
npm run dev
```

### Making database changes

```bash
# 1. Create a new migration file
npx supabase migration new your_migration_name

# 2. Write your SQL in the new file (supabase/migrations/...)

# 3. Test it locally
npm run db:reset

# 4. Regenerate TypeScript types
npm run gen-types:local

# 5. Commit the migration file and updated types, then open a PR
```

When you're done, stop local Supabase to free up Docker resources:

```bash
npm run db:stop
```

> **Important:** Never run `supabase db push` manually against the production project.
> Schema changes are applied to production by the team lead after a PR is merged.

---

## Branch Strategy

- Create a feature branch for your work: `your-name/issue-{number}-{short-description}`
- Open a PR against `main`
- No separate `dev` branch — keep it simple

---

## AI Documentation MCP (bob-the-builder-docs-mcp)

This project runs a local documentation server that keeps Claude Code up-to-date with the exact library versions used here. Without it, the AI will use stale training data and suggest deprecated APIs.

### For teammates (using docs)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# One-time: authenticate with GitHub Container Registry
npm run docs:login

# Pull the pre-indexed image and start the server
npm run docs:pull
npm run docs:start
```

The server runs at `http://localhost:6280`. Claude Code connects to it automatically via `.mcp.json` — no further setup needed.

To stop: `npm run docs:stop`

When the maintainer publishes an update, pull and restart:

```bash
npm run docs:pull && npm run docs:stop && npm run docs:start
```

### For the maintainer (managing docs)

```bash
# Start the local server for indexing (opens web UI at http://localhost:6280)
npm run docs:serve

# Add or update libraries via the web UI, then publish for the team
npm run docs:publish   # export DB → build Docker image → push to GHCR
```

### Scripts reference

| Command        | Role       | What it does                                       |
| -------------- | ---------- | -------------------------------------------------- |
| `docs:serve`   | Maintainer | Start local server for indexing/managing libraries |
| `docs:export`  | Maintainer | Copy indexed DB into `docs-mcp/` for building      |
| `docs:build`   | Maintainer | Build Docker image with baked-in DB                |
| `docs:login`   | Both       | Authenticate with GitHub Container Registry        |
| `docs:push`    | Maintainer | Push image to GHCR                                 |
| `docs:publish` | Maintainer | All-in-one: export + build + push                  |
| `docs:pull`    | Teammate   | Pull latest image from GHCR                        |
| `docs:start`   | Teammate   | Start the docs MCP server on `localhost:6280`      |
| `docs:stop`    | Teammate   | Stop and remove the container                      |

---

## Getting Help

Ask on Discord if you're stuck. Include what command you ran and the error message.
