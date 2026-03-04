# DesignLens — Product Requirements Document

A platform where designers critique, discuss, and propose improvements to real-world products. Organized by company boards, powered by community discussion.

## Vision

The go-to place for structured design critique of real products. Designers post teardowns, redesign proposals, and UX improvement ideas — organized by company/product. The community discusses, debates, and refines these ideas in the open.

## Core Concepts

- **Board** — A space dedicated to a specific company or product (e.g., Spotify, Notion, Linear). Boards are created and managed by admins.
- **Post** — A design critique, teardown, or redesign proposal within a board. Includes text, images (mockups, screenshots, before/after comparisons), and tags.
- **Comment** — Discussion on a post. Supports threading so conversations stay organized.
- **Vote** — Upvote posts and comments to surface the best ideas.
- **Tag** — Labels like UX, UI, Accessibility, Mobile, Onboarding, etc. Used to categorize and filter posts within a board.

## User Roles

- **Visitor** — Can browse boards, read posts and comments. Cannot interact.
- **Member** — Can create posts, comment, vote, and manage their profile. Requires sign-up.
- **Moderator** — A member assigned by an admin to manage a specific board. Has admin-level control over that board only (pin/remove posts, moderate comments, manage board-level tags). A user can be a moderator of multiple boards.
- **Admin** — Platform-level control. Can create/edit/archive boards, assign moderators, manage global settings, and moderate any content across all boards.

---

## v1 — Core

The minimum feature set for the platform to be functional and useful.

### Authentication

- Sign up with email and password
- Log in / log out
- Google OAuth sign-in
- Password reset via email

### Boards

- Admins can create a board with name, logo, and short description
- Board listing page showing all available boards
- Board detail page showing posts within that board
- Admins can edit board name, logo, and description
- Admins can archive a board (hides from listing, existing content preserved)

### Posts

- Create a post within a board with title, description, and at least one image
- Image upload for mockups, screenshots, annotated designs
- Support for multiple images per post (up to 5)
- Assign one or more tags to a post from a predefined list
- Edit own post (title, description, images, tags)
- Delete own post
- Post detail page showing full content, images, vote count, and comments

### Comments

- Add a comment on a post
- Edit own comment
- Delete own comment
- Comments displayed in chronological order

### Voting

- Upvote a post (one vote per user per post)
- Remove own upvote
- Vote count displayed on post cards and post detail page

### User Profile

- Profile page showing user's display name and avatar
- Edit display name and avatar
- List of posts created by the user on their profile
- List of comments made by the user on their profile

### Board Moderation

- Admins can assign a member as moderator of a specific board
- Admins can remove a moderator from a board
- Moderators can pin/unpin posts within their board
- Moderators can remove posts and comments within their board
- Moderator badge displayed next to username within their board

### User Settings

- Settings page accessible from profile/navigation
- **All users:** Account settings — update email, change password, delete account
- **All users:** Appearance — (placeholder for v2 dark mode toggle)
- **Moderators:** Board management section — lists boards they moderate, quick links to moderation actions
- **Admins:** Platform section — access to board creation, moderator assignment, global tag management

### Navigation & Layout

- Global navigation with logo, board listing link, and auth controls
- Responsive layout — works on desktop and mobile
- Board listing as the home page
- Consistent page layout across all pages

---

## v2 — Enhanced

Features that make the platform engaging, discoverable, and sticky.

### Threaded Comments

- Reply to a specific comment (one level of nesting)
- Visual indentation to distinguish replies from top-level comments
- Collapse/expand a comment thread

### Rich Text

- Markdown support in post descriptions and comments
- Preview before publishing
- Inline image support within post body (beyond the main image uploads)

### Search & Discovery

- Search across all posts by keyword (title and description)
- Search within a specific board
- Filter posts by tag within a board
- Sort posts by: Newest, Most Upvoted, Most Discussed
- Trending section on home page showing posts gaining upvotes recently

### Bookmarks

- Bookmark a post to save it for later
- Bookmarks page in user profile listing all saved posts
- Remove bookmark

### Notifications

- In-app notification when someone comments on your post
- In-app notification when someone replies to your comment
- Notification bell with unread count in navigation
- Mark individual notification as read
- Mark all notifications as read

### Dark Mode

- Toggle between light and dark mode
- Persist preference across sessions
- Respect system preference as default

### Sharing

- Copy shareable link to a post
- Open Graph metadata for posts (title, description, image preview) so links look good when shared on social media

### Settings Enhancements

- **All users:** Notification preferences — toggle which notifications to receive
- **All users:** Dark mode toggle in appearance settings
- **Moderators:** Board-level stats for their boards (post count, active members, reports)
- **Moderators:** Manage board-specific tags (add, rename, remove within their board)
- **Admins:** Platform dashboard showing stats: total boards, posts, comments, members
- **Admins:** Manage the global tag list (add, rename, remove tags)
- **Admins:** View and manage all moderator assignments across boards

---

## v3 — Scale

Features that turn the platform into a thriving community.

### Board Requests

- Members can request a new board (suggest a company/product)
- Other members can upvote board requests
- Admins can approve or dismiss requests
- Board request listing page

### User Reputation

- Reputation score based on upvotes received on posts and comments
- Reputation badge displayed on profile and next to username
- Reputation tiers (e.g., Newcomer, Contributor, Trusted, Expert)

### Collections

- Create a named collection of posts (e.g., "Best Onboarding Critiques")
- Collections are public and shareable
- Add/remove posts from own collections
- Browse collections by other users

### Following

- Follow a board to see its posts in a personalized feed
- Follow a user to see their new posts in the feed
- Personalized home feed based on followed boards and users
- Unfollow at any time

### Author Analytics

- Post author can see view count on their posts
- See upvote trend over time (simple chart)
- See which of their posts got the most discussion

### Enhanced Profiles

- Bio and social links (Twitter/X, Dribbble, LinkedIn, personal site)
- Pinned posts on profile (up to 3)
- "Top contributions" section highlighting most upvoted posts

### Moderation

- Report a post or comment for violating guidelines
- Reports go to the board's moderator first; escalate to admin if unresolved
- Moderator/admin queue showing reported content for their boards
- Moderator/admin can remove reported content or dismiss the report
- Admin can temporarily ban repeat violators (platform-wide)
- Moderator can mute a user within their board
- Moderation activity log visible to admins
- Community guidelines page

### Series

- Group multiple posts into an ordered series (e.g., "Redesigning Spotify — Part 1, 2, 3")
- Series navigation within post detail (previous/next)
- Series listed on author's profile

### Email Digest

- Weekly email digest of trending posts across followed boards
- Opt-in/opt-out from profile settings
