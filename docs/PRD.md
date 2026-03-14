# Bob the Builder — Product Requirements Document

**Tagline:** _Can we ship it? Yes we can._

A community platform where builders share real work they've done with AI — the apps they launched, the features they shipped, the bugs they crushed, and the workflows they automated. Not tutorials. Not hype. Actual work, with proof.

---

## Vision

AI is dissolving job titles. A designer fixes a production bug. A PM ships a full-stack feature. A marketer builds an internal tool. A tester deploys an automation framework. The question isn't "what's your role?" anymore — it's "what did you ship?"

This is the **builder economy**. AI is the great equalizer — it gives everyone the ability to build, regardless of their background, title, or years of experience. The people who thrive aren't the ones with the fanciest credentials. They're the ones who ship.

Bob the Builder is the home for these people. A platform where anyone who shipped something with AI can show their work, share how they did it, and inspire others to ship too. Designers, PMs, engineers, testers, marketers, founders, students — everyone's a builder now.

Every post answers one question: **"What did you ship, and how did AI help you ship it?"**

_Can we ship it? Yes we can._

---

## Who It's For

**Builders** — anyone who uses AI to ship real work, regardless of their job title or technical background.

- A **designer** who fixed a CSS bug in production using Claude — no engineer needed
- A **PM** who built and shipped an internal analytics dashboard over a weekend
- A **solo dev** who launched a full SaaS app using Cursor in 3 days
- A **tester** who built an automated regression suite with AI-generated scripts
- A **marketer** who created a lead qualification tool without writing a single line manually
- An **engineer** who shipped a feature in hours that would've taken a sprint
- A **founder** who went from idea to deployed MVP in a weekend

What they have in common: they shipped something real with AI. Their title didn't stop them.

---

## Core Concepts

### Build

The atomic unit of the platform. A Build is a showcase of work done with AI. It's not a blog post or a tutorial — it's a structured submission with proof of work.

Every Build includes:

- **What** was built (title + description)
- **How** AI helped (which tools, what role AI played)
- **Proof** (screenshots, live link, repo, or demo video)

### Build Types

Builds are categorized by what kind of work was done:

| Type           | Description                       | Example                                                                           |
| -------------- | --------------------------------- | --------------------------------------------------------------------------------- |
| **App**        | A complete application or product | "Built a habit tracker app in 2 days with Claude"                                 |
| **Feature**    | A feature shipped in a product    | "Added AI-powered search to our dashboard using GPT-4"                            |
| **Fix**        | A bug squashed with AI assistance | "Fixed a race condition that stumped us for weeks — solved in one Claude session" |
| **Automation** | A workflow, script, or pipeline   | "Automated our entire deploy pipeline with AI-generated GitHub Actions"           |
| **Experiment** | A prototype, POC, or exploration  | "Explored what a voice-first todo app could look like with Claude + ElevenLabs"   |

### AI Stack

Every Build tags the AI tools used. This is a first-class concept — not just metadata. The platform tracks which tools builders are using and how.

Examples: Claude, GPT-4, Cursor, Copilot, v0, Bolt, Replit Agent, Midjourney, Stable Diffusion, Whisper, ElevenLabs, etc.

### Upvote

One upvote per user per Build. Surfaces the best work. No downvotes — this is a showcase, not a debate.

### Comment

Discussion on a Build. "How did you handle auth?" / "What prompts worked best?" / "I tried something similar, here's what I learned."

---

## User Roles

| Role        | Can Do                                                                                                                |
| ----------- | --------------------------------------------------------------------------------------------------------------------- |
| **Visitor** | Browse the feed, read Builds and comments. No account needed.                                                         |
| **Builder** | Everything a visitor can do, plus: submit Builds, comment, upvote, manage profile. Requires sign-up.                  |
| **Admin**   | Everything a builder can do, plus: feature/remove Builds, manage AI tools list, manage build types, moderate content. |

No moderator role in v1. The platform is small enough for admins to manage directly.

---

## v1 — Core

Everything needed for builders to share work and for visitors to discover it.

### Authentication

- Sign in with GitHub OAuth (primary — this is a builder community)
- Sign in with Google OAuth
- Sign out

### Submitting a Build

A builder submits a Build with:

| Field           | Required    | Details                                          |
| --------------- | ----------- | ------------------------------------------------ |
| Title           | Yes         | What you built, in one line                      |
| Description     | Yes         | What it does, the problem it solves, any context |
| Build Type      | Yes         | App, Feature, Fix, Automation, or Experiment     |
| AI Tools Used   | Yes         | Multi-select from platform list + custom entry   |
| Screenshots     | Yes (min 1) | Up to 5 images showing the work                  |
| Live URL        | No          | Link to the deployed app/feature                 |
| Repo URL        | No          | GitHub/GitLab link to source code                |
| Tech Stack Tags | No          | Next.js, React, Python, Supabase, etc.           |

- Edit own Build after submission
- Delete own Build
- Build detail page showing full content, screenshots, upvote count, and comments

### Feed

The home page is a feed of Builds.

- Default sort: Newest first
- Sort options: Newest, Most Upvoted, Most Discussed
- Filter by Build Type (App, Feature, Fix, Automation, Experiment)
- Filter by AI Tool (Claude, GPT-4, Cursor, etc.)
- Filter by Tech Stack tag
- Filters are combinable (e.g., "Apps built with Claude using Next.js")
- Featured Builds section at the top (curated by admins)

### Comments

- Add a comment on a Build
- Edit own comment
- Delete own comment
- Comments displayed in chronological order

### Upvoting

- Upvote a Build (one per user per Build)
- Remove own upvote
- Upvote count visible on feed cards and Build detail page

### Builder Profile

Every builder has a public profile page.

| Field        | Editable | Details                  |
| ------------ | -------- | ------------------------ |
| Display Name | Yes      | Public-facing name       |
| Avatar       | Yes      | Profile picture          |
| Bio          | Yes      | One-liner about yourself |
| GitHub       | Yes      | Link to GitHub profile   |
| Twitter/X    | Yes      | Link to Twitter profile  |
| LinkedIn     | Yes      | Link to LinkedIn profile |
| Website      | Yes      | Personal site URL        |

Profile also shows:

- All Builds submitted by this builder (newest first)
- Total upvotes received across all Builds
- Join date

### Admin

- Feature / unfeature a Build (featured Builds get a highlighted spot on the home page)
- Remove any Build or comment
- Manage the predefined AI Tools list (add, rename, remove tools)
- Manage Build Types (add, rename — core types cannot be deleted)
- Manage Tech Stack tags

### Navigation & Layout

- Top navigation: logo, feed link, "Submit Build" button (CTA), auth controls
- Responsive — mobile-first, works on all screen sizes
- Feed is the home page
- Consistent layout across all pages
- Clean, minimal design — the Builds are the focus

---

## v2 — Engage

Features that keep builders coming back and make the platform stickier.

### Threaded Comments

- Reply to a specific comment (one level deep)
- Visual indent for replies
- Collapse/expand threads

### Rich Content

- Markdown in Build descriptions and comments
- Code blocks with syntax highlighting
- Preview before publishing
- Embed video demos (YouTube, Loom links auto-embed)
- Before/after image comparisons (slider component for bug fixes and redesigns)

### Build Story

An optional long-form section on a Build where the builder explains the process:

- How they prompted the AI
- What worked, what didn't
- Key decisions and trade-offs
- Actual prompt snippets or AI conversation screenshots

This is the "behind the scenes" — the most educational part of a Build.

### Search

- Full-text search across all Builds (title, description, AI tools, tags)
- Search results page with filters
- Search suggestions / autocomplete

### Bookmarks

- Bookmark a Build to save for later
- Bookmarks page in profile
- Remove bookmark

### Notifications

- Someone commented on your Build
- Someone replied to your comment
- Your Build was featured by an admin
- Notification bell with unread count
- Mark as read (individual or all)

### Sharing & SEO

- Copy shareable link to a Build
- Open Graph tags on every Build page (title, description, first screenshot)
- Clean URLs: `/builds/[slug]`
- Twitter card and LinkedIn preview support

### Dark Mode

- Light / dark mode toggle
- Persists across sessions
- Defaults to system preference

---

## v3 — Grow

Features that turn the platform into a thriving builder community.

### Weekly Spotlight

- Builds are grouped into weekly cohorts (Monday–Sunday)
- "This Week's Top Builds" section on home page — ranked by upvotes within the current week
- Weekly archive: browse top Builds from any past week
- Weekly email recap sent to opted-in builders

### Builder Reputation

Reputation is earned through community validation:

| Action                     | Points |
| -------------------------- | ------ |
| Build receives an upvote   | +2     |
| Comment receives an upvote | +1     |
| Build gets featured        | +10    |

Tiers based on total points:

| Tier     | Badge   | Threshold |
| -------- | ------- | --------- |
| Newcomer | —       | 0         |
| Builder  | Bronze  | 25        |
| Prolific | Silver  | 100       |
| Veteran  | Gold    | 500       |
| Legend   | Diamond | 2000      |

Badge displayed next to username everywhere.

### Following

- Follow a builder to see their new Builds in your feed
- Follow a specific AI tool or tag to see related Builds
- Personalized "Following" feed tab on home page
- Unfollow at any time

### Collections

- Create a named collection (e.g., "Best Claude Builds", "AI Bug Fix Hall of Fame")
- Add/remove Builds from own collections
- Collections are public with shareable URLs
- Browse other builders' collections

### Builder Streaks

- Track consecutive weeks where a builder submitted at least one Build
- Streak count displayed on profile
- Streak badge (e.g., "4-week streak")
- Streaks encourage consistent shipping

### Enhanced Profiles

- Pinned Builds (up to 3) at top of profile
- "Top Builds" section showing most upvoted work
- AI tool badge wall — icons for every AI tool the builder has used across their Builds
- Total stats: Builds submitted, upvotes received, comments given

### Builder Analytics (own Builds only)

- View count per Build
- Upvote trend over time
- Top referral sources
- Most discussed Build

### Series

- Link multiple Builds into an ordered series (e.g., "Building a SaaS in Public — Part 1, 2, 3")
- Series navigation on Build detail page (previous / next)
- Series listed on builder's profile

### Moderation

- Report a Build or comment
- Admin review queue for reported content
- Remove content or dismiss report
- Temporary ban for repeat violators
- Community guidelines page

### Email Digest

- Weekly digest: top Builds, trending AI tools, new builders to follow
- Opt-in during sign-up, toggle in settings
