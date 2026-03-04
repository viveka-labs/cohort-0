# DesignLens — Roadmap

This document defines what gets built as the base, what bugs get planted, and what features are available for contributors to pick up. Everything is managed via GitHub Issues and GitHub Projects.

---

## Phase 1: Base Build

A working desktop-only app with the minimum functionality needed for the platform to be usable. No polish, no extras — just the skeleton.

### Authentication

- Sign up with email and password
- Log in / log out
- Google OAuth sign-in
- Password reset via email

### Boards

- Admin can create a board with name, logo, and short description
- Admin can edit board details
- Board listing page (home page)
- Board detail page showing posts within that board

### Posts

- Create a post within a board with title, description, and image(s)
- Image upload (up to 5 images per post)
- Edit own post
- Delete own post
- Post detail page showing full content and images

### User Profile

- Profile page showing display name and avatar
- Edit display name and avatar
- List of posts created by the user

### Navigation & Layout

- Global navigation with logo, board listing link, and auth controls
- Desktop-only layout
- Consistent page structure across all pages

---

## Phase 2: Bug Introduction

After the base build is stable and working, bugs are intentionally introduced across the codebase. Each bug is filed as a GitHub Issue with a difficulty label.

### Easy — Visual / CSS

These are isolated to a single component or page. Fixable by reading the component and adjusting Tailwind classes or markup.

1. **Board cards have inconsistent spacing** — Some cards in the board listing have different padding/gap than others
2. **Post title truncation is broken** — Long titles overflow instead of truncating with ellipsis on the board detail page
3. **Navigation logo is not aligned** — Logo and nav links are vertically misaligned
4. **Image aspect ratios are wrong** — Post images on the detail page stretch instead of maintaining aspect ratio
5. **Form input focus states are missing** — Text inputs on login/signup have no visible focus ring

### Medium — Component Logic

These involve understanding component state, props, or event handling. Require reading 1-2 files.

6. **Board logo upload doesn't show preview** — When admin uploads a board logo, no preview appears until after saving
7. **Post form doesn't clear after submission** — After creating a post, the form fields retain the old values
8. **Edit post doesn't populate existing data** — Clicking edit on a post opens an empty form instead of pre-filled
9. **Delete post has no confirmation** — Clicking delete immediately removes the post without asking the user
10. **Auth redirect is broken** — After login, user is sent to home page instead of the page they were trying to visit

### Hard — Backend / Data

These involve API routes, database queries, or auth logic. Require understanding how frontend and backend connect.

11. **Posts are not ordered** — Posts on the board detail page appear in random order instead of newest first
12. **Any logged-in user can edit any post** — Authorization check is missing on the edit API route
13. **Deleted posts still appear in profile** — The user profile query doesn't filter out deleted posts
14. **Board archive doesn't work** — Admin clicks archive but the board still shows in the listing
15. **Image upload fails silently** — When upload fails (e.g., file too large), no error is shown to the user

---

## Phase 3: Features

Features available for contributors to pick up. Each feature is filed as a GitHub Issue with labels for difficulty and type. Contributors assign themselves to an issue, branch, build, and raise a PR.

### Difficulty: Easy

Scoped to 1-2 files. Primarily frontend. Good for a first PR.

| # | Feature | Type | PRD Version |
|---|---|---|---|
| F1 | **Add upvoting to posts** — Upvote button on post cards and detail page, one vote per user, toggle to remove vote, display vote count | Fullstack | v1 |
| F2 | **Add dark mode toggle** — Light/dark switch in navigation, persist preference in local storage, respect system default | Frontend | v2 |
| F3 | **Add copy link to post** — Share button on post detail that copies the post URL to clipboard with toast confirmation | Frontend | v2 |
| F4 | **Add tags to posts** — Display tags on post cards and detail page from a predefined list, allow selecting tags during post creation | Fullstack | v1 |
| F5 | **Add loading skeletons** — Skeleton placeholders while boards, posts, and post detail pages are loading | Frontend | — |
| F6 | **Make navigation responsive** — Collapse nav into hamburger menu on mobile, slide-out drawer | Frontend | v1 |

### Difficulty: Medium

Spans 2-4 files. May involve both frontend and backend. Requires understanding data flow.

| # | Feature | Type | PRD Version |
|---|---|---|---|
| F7 | **Build the comment system** — Add comment on a post, edit/delete own comment, display in chronological order | Fullstack | v1 |
| F8 | **Build the user settings page** — Account settings (update email, change password), role-based sections visible per role | Fullstack | v1 |
| F9 | **Add bookmark system** — Bookmark/unbookmark posts, bookmarks tab on user profile | Fullstack | v2 |
| F10 | **Add search** — Search posts by keyword across all boards, search within a specific board | Fullstack | v2 |
| F11 | **Filter posts by tag** — Tag filter bar on board detail page, clickable tags, active state | Frontend | v2 |
| F12 | **Sort posts** — Sort by newest, most upvoted, most discussed on board detail page | Fullstack | v2 |
| F13 | **Make board detail page responsive** — Post grid adapts to mobile, images stack properly | Frontend | v1 |
| F14 | **Make post detail page responsive** — Content, images, and comments reflow on mobile | Frontend | v1 |
| F15 | **Add moderator badge** — Display a badge next to moderator usernames within their board | Frontend | v1 |

### Difficulty: Hard

Spans multiple files and layers (frontend + backend + database). Requires understanding auth, database relationships, or real-time updates.

| # | Feature | Type | PRD Version |
|---|---|---|---|
| F16 | **Build moderator role and assignment** — Admin can assign/remove moderators per board, moderators can pin/remove posts in their board | Fullstack | v1 |
| F17 | **Build threaded comments** — Reply to a comment (one level nesting), visual indentation, collapse/expand threads | Fullstack | v2 |
| F18 | **Build notification system** — In-app notifications for comments on your post and replies to your comments, bell icon with unread count, mark as read | Fullstack | v2 |
| F19 | **Add rich text editor** — Markdown support in post descriptions and comments with preview | Frontend | v2 |
| F20 | **Build board request system** — Members suggest new boards, others upvote requests, admins approve/dismiss | Fullstack | v3 |
| F21 | **Add Open Graph metadata** — Dynamic OG tags per post (title, description, image) for social sharing previews | Backend | v2 |
| F22 | **Build user reputation system** — Score based on upvotes received, reputation badge on profile, tier labels | Fullstack | v3 |
| F23 | **Build collections** — Create named collections of posts, add/remove posts, public and shareable | Fullstack | v3 |
| F24 | **Build follow system** — Follow boards and users, personalized feed based on follows | Fullstack | v3 |
| F25 | **Build report and moderation queue** — Report posts/comments, reports go to board moderator, escalate to admin, moderation log | Fullstack | v3 |

---

## GitHub Setup

### Labels

| Label | Description |
|---|---|
| `bug` | Planted bug to fix |
| `feature` | New feature to implement |
| `easy` | 1-2 files, good first issue |
| `medium` | 2-4 files, intermediate |
| `hard` | Multi-layer, advanced |
| `frontend` | UI/component work only |
| `backend` | API/database work only |
| `fullstack` | Both frontend and backend |
| `v1` | Core PRD feature |
| `v2` | Enhanced PRD feature |
| `v3` | Scale PRD feature |

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

- Bugs: `fix/short-description` (e.g., `fix/board-card-spacing`)
- Features: `feat/short-description` (e.g., `feat/comment-system`)

### PR Requirements

- Link the GitHub Issue in the PR description
- Describe what was changed and why
- Include a screenshot for any visual change
- At least one reviewer approval before merge
