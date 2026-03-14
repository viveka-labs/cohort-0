# Bob the Builder — Roadmap

_Can we ship it? Yes we can._

This document defines what gets built as the base, what bugs get planted, and what features are available for contributors to pick up. Everything is managed via GitHub Issues and GitHub Projects.

---

## Phase 1: Base Build

A working desktop-only app with the minimum functionality needed for the platform to be usable. No polish, no extras — just the skeleton.

### Authentication

- Sign in with GitHub OAuth (primary)
- Sign in with Google OAuth
- Sign out

### Build Submission

- Submit a Build with title, description, Build Type, AI tools used, and screenshots
- Select Build Type (App, Feature, Fix, Automation, Experiment)
- Select AI tools used from predefined list (multi-select)
- Image upload (up to 5 screenshots per Build)
- Optional: live URL and repo URL
- Edit own Build
- Delete own Build
- Build detail page showing full content, screenshots, and AI tools used

### Feed

- Home page showing a feed of all Builds, newest first
- Build cards showing title, description preview, screenshot thumbnail, AI tools used, and Build Type badge
- Filter by Build Type
- Filter by AI tool

### Builder Profile

- Profile page showing display name, avatar, and bio
- Edit display name, avatar, and bio
- List of Builds submitted by the builder
- Social links (GitHub, Twitter/X, LinkedIn, website)

### Navigation & Layout

- Global navigation with logo, feed link, "Submit Build" button, and auth controls
- Desktop-only layout
- Consistent page structure across all pages

---

## Phase 2: Bug Introduction

After the base build is stable and working, bugs are intentionally introduced across the codebase. Each bug is filed as a GitHub Issue with a difficulty label.

### Easy — Visual / CSS

Isolated to a single component or page. Fixable by reading the component and adjusting Tailwind classes or markup.

1. **Build cards have inconsistent spacing** — Some cards in the feed have different padding/gap than others
2. **Build title truncation is broken** — Long titles overflow instead of truncating with ellipsis on the feed page
3. **Navigation logo is not aligned** — Logo and nav links are vertically misaligned
4. **Screenshot aspect ratios are wrong** — Build screenshots on the detail page stretch instead of maintaining aspect ratio
5. **Form input focus states are missing** — Text inputs on Build submission and profile forms have no visible focus ring

### Medium — Component Logic

Involve understanding component state, props, or event handling. Require reading 1-2 files.

6. **AI tools multi-select doesn't deselect** — Clicking a selected AI tool doesn't remove it from selection
7. **Build form doesn't clear after submission** — After submitting a Build, the form fields retain the old values
8. **Edit Build doesn't populate existing data** — Clicking edit on a Build opens an empty form instead of pre-filled
9. **Delete Build has no confirmation** — Clicking delete immediately removes the Build without asking the user
10. **Auth redirect is broken** — After login, user is sent to home page instead of the page they were trying to visit

### Hard — Backend / Data

Involve API routes, database queries, or auth logic. Require understanding how frontend and backend connect.

11. **Builds are not ordered** — Builds on the feed appear in random order instead of newest first
12. **Any logged-in user can edit any Build** — Authorization check is missing on the edit API route
13. **Deleted Builds still appear in profile** — The builder profile query doesn't filter out deleted Builds
14. **Build Type filter returns wrong results** — Filtering by "Fix" also returns Builds with type "Feature"
15. **Screenshot upload fails silently** — When upload fails (e.g., file too large), no error is shown to the user

---

## Phase 3: Features

Features available for contributors to pick up. Each feature is filed as a GitHub Issue with labels for difficulty and type. Contributors assign themselves to an issue, branch, build, and raise a PR.

### Difficulty: Easy

Scoped to 1-2 files. Primarily frontend. Good for a first PR.

| #   | Feature                                                                                                                                 | Type      | PRD Version |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| F1  | **Add upvoting to Builds** — Upvote button on Build cards and detail page, one vote per user, toggle to remove vote, display vote count | Fullstack | v1          |
| F2  | **Add dark mode toggle** — Light/dark switch in navigation, persist preference in local storage, respect system default                 | Frontend  | v2          |
| F3  | **Add copy link to Build** — Share button on Build detail that copies the Build URL to clipboard with toast confirmation                | Frontend  | v2          |
| F4  | **Add tech stack tags** — Display tech stack tags on Build cards and detail page, allow selecting tags during Build submission          | Fullstack | v1          |
| F5  | **Add loading skeletons** — Skeleton placeholders while feed, Build detail, and profile pages are loading                               | Frontend  | —           |
| F6  | **Make navigation responsive** — Collapse nav into hamburger menu on mobile, slide-out drawer                                           | Frontend  | v1          |

### Difficulty: Medium

Spans 2-4 files. May involve both frontend and backend. Requires understanding data flow.

| #   | Feature                                                                                                                            | Type      | PRD Version |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| F7  | **Build the comment system** — Add comment on a Build, edit/delete own comment, display in chronological order                     | Fullstack | v1          |
| F8  | **Add featured Builds section** — Admin can feature/unfeature Builds, featured section at top of home feed                         | Fullstack | v1          |
| F9  | **Add bookmark system** — Bookmark/unbookmark Builds, bookmarks tab on builder profile                                             | Fullstack | v2          |
| F10 | **Add search** — Search Builds by keyword across the platform (title, description, AI tools)                                       | Fullstack | v2          |
| F11 | **Filter Builds by AI tool** — AI tool filter bar on feed page, clickable tool badges, active state, combinable with other filters | Frontend  | v1          |
| F12 | **Sort Builds** — Sort by newest, most upvoted, most discussed on feed page                                                        | Fullstack | v1          |
| F13 | **Make feed page responsive** — Build card grid adapts to mobile, screenshots stack properly                                       | Frontend  | v1          |
| F14 | **Make Build detail page responsive** — Content, screenshots, and comments reflow on mobile                                        | Frontend  | v1          |
| F15 | **Add builder stats to profile** — Total Builds submitted, total upvotes received, join date displayed on profile                  | Fullstack | v1          |

### Difficulty: Hard

Spans multiple files and layers (frontend + backend + database). Requires understanding auth, database relationships, or complex state.

| #   | Feature                                                                                                                                                                               | Type      | PRD Version |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| F16 | **Build admin controls** — Admin can manage AI tools list, manage Build Types, manage tech stack tags, remove any Build or comment                                                    | Fullstack | v1          |
| F17 | **Build threaded comments** — Reply to a comment (one level nesting), visual indentation, collapse/expand threads                                                                     | Fullstack | v2          |
| F18 | **Build notification system** — In-app notifications for comments on your Build, replies to your comments, and when your Build is featured; bell icon with unread count, mark as read | Fullstack | v2          |
| F19 | **Add rich text editor** — Markdown support in Build descriptions and comments with preview, code block syntax highlighting                                                           | Frontend  | v2          |
| F20 | **Build the Build Story feature** — Optional long-form section on a Build for process breakdown, prompt snippets, AI conversation screenshots                                         | Fullstack | v2          |
| F21 | **Add Open Graph metadata** — Dynamic OG tags per Build (title, description, screenshot) for social sharing previews on Twitter and LinkedIn                                          | Backend   | v2          |
| F22 | **Build the Weekly Spotlight** — Weekly cycle grouping, "This Week's Top Builds" section, weekly archive, weekly leaderboard                                                          | Fullstack | v3          |
| F23 | **Build builder reputation system** — Score based on upvotes received, reputation badge on profile, tier labels (Newcomer → Legend)                                                   | Fullstack | v3          |
| F24 | **Build collections** — Create named collections of Builds, add/remove Builds, public and shareable                                                                                   | Fullstack | v3          |
| F25 | **Build follow system** — Follow builders and tags, personalized "Following" feed tab                                                                                                 | Fullstack | v3          |
| F26 | **Build builder streaks** — Track consecutive weeks of shipping, streak count and badge on profile                                                                                    | Fullstack | v3          |
| F27 | **Build report and moderation queue** — Report Builds/comments, admin review queue, remove or dismiss, temporary bans                                                                 | Fullstack | v3          |

---

## GitHub Setup

### Labels

| Label       | Description                 |
| ----------- | --------------------------- |
| `bug`       | Planted bug to fix          |
| `feature`   | New feature to implement    |
| `easy`      | 1-2 files, good first issue |
| `medium`    | 2-4 files, intermediate     |
| `hard`      | Multi-layer, advanced       |
| `frontend`  | UI/component work only      |
| `backend`   | API/database work only      |
| `fullstack` | Both frontend and backend   |
| `v1`        | Core PRD feature            |
| `v2`        | Engage PRD feature          |
| `v3`        | Grow PRD feature            |

### Issue Format

Every issue (bug or feature) follows a consistent format:

**Bug issues include:**

- What the expected behavior is
- What the actual (broken) behavior is
- Which page/component is affected
- Screenshot if applicable

**Feature issues include:**

- What the feature does (from PRD)
- Acceptance criteria (checklist of what "done" looks like)
- Which pages/components are involved
- Link to relevant PRD section

### Branch Naming

- Bugs: `fix/short-description` (e.g., `fix/build-card-spacing`)
- Features: `feat/short-description` (e.g., `feat/comment-system`)

### PR Requirements

- Link the GitHub Issue in the PR description
- Describe what was changed and why
- Include a screenshot for any visual change
- At least one reviewer approval before merge
