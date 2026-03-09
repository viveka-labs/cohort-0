# Nexus

AI-Native Designer Cohort -- a 4-week program turning product designers into design engineers using AI.

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
npx supabase start        # First run downloads images (~5 min)
cp .env.local.example .env.local
# Paste the URL and publishable key from `supabase start` output into .env.local
npx supabase db reset      # Apply migrations and seed data
npm run gen-types          # Generate TypeScript types
npm run dev
```

## Database Scripts

| Script       | What it does                                     |
| ------------ | ------------------------------------------------ |
| `db:push`    | Push migrations to the linked remote project     |
| `db:migrate` | Create a new migration file                      |
| `db:types`   | Generate TypeScript types from the remote project|
| `db:status`  | Show local Supabase status                       |
| `gen-types`  | Generate TypeScript types from local Supabase    |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full setup guide, branch strategy, and database workflow.
