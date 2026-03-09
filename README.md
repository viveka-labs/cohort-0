# Bob The Builder

AI is dissolving job titles. A designer fixes a production bug. A PM ships a full-stack feature. A marketer builds an internal tool. A tester deploys an automation framework. The question isn't "what's your role?" anymore — it's "what did you ship?"

This is the **builder economy**. AI is the great equalizer — it gives everyone the ability to build, regardless of their background, title, or years of experience. The people who thrive aren't the ones with the fanciest credentials. They're the ones who ship.

Bob the Builder is the home for these people. A platform where anyone who shipped something with AI can show their work, share how they did it, and inspire others to ship too. Designers, PMs, engineers, testers, marketers, founders, students — everyone's a builder now.

Every post answers one question: **"What did you ship, and how did AI help you ship it?"**

_Can we ship it? Yes we can._

AI-Native Designer Cohort Product -- a 4-week program turning product designers into design engineers using AI.
Built with Next.js, Tailwind CSS, shadcn/ui, and Supabase.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (only for local Supabase)

## Quickstart

### Option A -- Frontend Only (no Docker)

Connect to the shared production Supabase project.

```bash
npm install
cp .env.local.example .env.local
# Ask the team lead for Supabase credentials and paste them in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Option B -- Local Supabase (Docker required)

Use this when working on database schema, migrations, or RLS policies.

```bash
npm install
npm run db:start          # First run downloads images (~5 min)
cp .env.local.example .env.local
# Paste the URL and publishable key from `npm run db:start` output into .env.local
npm run db:reset             # Apply migrations + seed data locally
npm run gen-types:local      # Generate TypeScript types
npm run dev
# When done: npm run db:stop
```

## Database Scripts

| Script            | Target | What it does                                                      |
| ----------------- | ------ | ----------------------------------------------------------------- |
| `db:start`        | Local  | Start local Supabase (Docker containers)                          |
| `db:stop`         | Local  | Stop local Supabase and remove containers                         |
| `db:reset`        | Local  | Wipe and re-apply all migrations + seed data                      |
| `db:push`         | Prod   | Apply pending migrations to prod (team lead only)                 |
| `db:status`       | Local  | Show local Supabase status                                        |
| `gen-types:local` | Local  | Generate TypeScript types from local Supabase                     |
| `gen-types:prod`  | Prod   | Generate TypeScript types from prod (needs `SUPABASE_PROJECT_ID`) |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full setup guide, branch strategy, and database workflow.
