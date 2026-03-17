# Issue

One command for managing the student cohort challenge backlog. Three modes: plant bugs in code, report bugs, and report features — all as GitHub Issues.

## Agents Used

| Agent                     | When                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| [SDE2](../agents/sde2.md) | Plant mode only — introduces the bug into the codebase with a minimal, targeted code change. |

## Input

- **$ARGUMENTS**: `plant <path> <difficulty>` | `bug [description]` | `feature [description]`

```
Examples:
  /issue plant frontend easy      → Suggest plantable frontend-easy bugs, pick one, plant + file issue
  /issue plant backend hard       → Suggest plantable backend-hard bugs, pick one, plant + file issue
  /issue bug                      → File a bug issue from conversation context
  /issue bug form submits twice   → File a bug issue with inline description
  /issue feature                  → File a feature issue from conversation context
  /issue feature add dark mode    → File a feature issue with inline description
```

### Argument Reference

**Paths:** `frontend` | `backend` | `fullstack`
**Difficulties:** `easy` | `medium` | `hard`

## Flow

```
Parse $ARGUMENTS → determine mode
     │
     ▼
Phase 1: Context Gather (all modes)
  ├── Fetch open GitHub issues (gh issue list)
  └── Explore relevant codebase areas
     │
     ▼
┌─── Mode: plant ─────────────────────────────────────────┐
│                                                          │
│  Phase 2P: Explore codebase for the given path           │
│  Cross-reference against open GitHub issues              │
│  Identify areas where a bug can be realistically planted │
│  Suggest 3-5 options → WAIT for user pick                │
│                                                          │
│  Phase 3P: Spawn SDE2 → plant the bug                   │
│  Commit with innocent message                            │
│  File GitHub issue in bug format                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
     │
┌─── Mode: bug ───────────────────────────────────────────┐
│                                                          │
│  Phase 2B: Parse description from args or conversation   │
│  Check for duplicate GitHub issues                       │
│  Explore affected files → determine labels + scope       │
│  Draft issue → show to user → WAIT for approval          │
│                                                          │
│  Phase 3B: File GitHub issue in bug format               │
│                                                          │
└──────────────────────────────────────────────────────────┘
     │
┌─── Mode: feature ──────────────────────────────────────┐
│                                                          │
│  Phase 2F: Parse description from args or conversation   │
│  Check for duplicate GitHub issues                       │
│  Explore codebase → determine scope + affected files     │
│  Generate acceptance criteria                            │
│  Draft issue → show to user → WAIT for approval          │
│                                                          │
│  Phase 3F: File GitHub issue in feature format           │
│                                                          │
└──────────────────────────────────────────────────────────┘
     │
     ▼
Output: Issue URL + summary
```

---

## Execution

### Phase 1: Parse Arguments

Parse `$ARGUMENTS` to determine mode:

```
If starts with "plant"   → mode = plant, extract <path> and <difficulty>
If starts with "bug"     → mode = bug, remaining text = description (may be empty)
If starts with "feature" → mode = feature, remaining text = description (may be empty)
Otherwise                → Ask user which mode: plant, bug, or feature
```

Validate plant args:

```
path must be one of: frontend, backend, fullstack
difficulty must be one of: easy, medium, hard
If missing or invalid → ask user
```

### Phase 2: Context Gather (All Modes)

Run in parallel:

1. **Fetch open GitHub issues:**

   ```bash
   gh issue list --state open --limit 100 --json number,title,labels
   ```

   Store as `existing_issues` — used to check for duplicates and skip already-filed items.

2. **Explore the codebase** for the relevant area:

   | Path        | Explore                                     |
   | ----------- | ------------------------------------------- |
   | `frontend`  | `components/`, `app/(main)/`, `app/(auth)/` |
   | `backend`   | `lib/queries/`, `app/api/`, `lib/supabase/` |
   | `fullstack` | All of the above                            |

   For bug/feature modes: focus exploration on files relevant to the user's description.

### Issue Type Mapping

Every issue must have an issue type set. Map the `path` to the corresponding GitHub issue type:

| Path        | Issue Type | Issue Type ID         |
| ----------- | ---------- | --------------------- |
| `frontend`  | Frontend   | `IT_kwDOD9MuOc4B4m5x` |
| `backend`   | Backend    | `IT_kwDOD9MuOc4B4m5y` |
| `fullstack` | Fullstack  | `IT_kwDOD9MuOc4B4m5z` |

Since `gh issue create` does not support `--type`, set the issue type **after** creating the issue using the GraphQL API:

```bash
# Get the issue node ID from the issue number
ISSUE_NODE_ID=$(gh api graphql -f query='{ repository(owner: "{owner}", name: "{repo}") { issue(number: {number}) { id } } }' --jq '.data.repository.issue.id')

# Update the issue type
gh api graphql -f query='mutation { updateIssue(input: { id: "'"$ISSUE_NODE_ID"'", issueTypeId: "{issue_type_id}" }) { issue { id } } }'
```

This step must run immediately after every `gh issue create` call in all three modes.

---

## Mode: Plant

### Phase 2P: Suggest Options

1. Explore the codebase areas relevant to the requested `<path>`:

   | Path        | Explore these areas                                                                                                |
   | ----------- | ------------------------------------------------------------------------------------------------------------------ |
   | `frontend`  | Components, pages, layouts — look for CSS/Tailwind classes, component state, event handlers, conditional rendering |
   | `backend`   | Queries, API routes, auth logic — look for missing validations, ordering, authorization checks, error handling     |
   | `fullstack` | All of the above — look for disconnects between frontend expectations and backend behavior                         |

2. Based on the `<difficulty>`, target the right complexity:

   | Difficulty | What to look for                                                                                  |
   | ---------- | ------------------------------------------------------------------------------------------------- |
   | `easy`     | Single-file fixes — a CSS class to remove, a missing style, a broken visual                       |
   | `medium`   | Component logic — state bugs, missing event handlers, form lifecycle issues (1-2 files)           |
   | `hard`     | Data/auth bugs — query ordering, missing auth checks, filter logic, cross-layer issues (2+ files) |

3. Cross-reference against `existing_issues` — skip anything that already has an open GitHub issue.

4. Suggest 3-5 realistic, plantable bugs with specific code references:

```markdown
## Plantable Bugs — {path} / {difficulty}

1. **Build title truncation is broken**
   File: `components/feed/build-card.tsx:23`
   Current: `<h3 className="truncate font-semibold">`
   Change: Remove the `truncate` class → long titles will overflow
   Impact: Visual — card layout breaks with long titles

2. **Form input focus states are missing**
   Files: `components/builds/build-form.tsx:45`, `components/profile/profile-settings-form.tsx:31`
   Current: Inputs have `focus:ring-2 focus:ring-amber-500` classes
   Change: Remove focus ring classes → no visible focus indicator
   Impact: Accessibility — keyboard users can't see focused input

...

Which one should I plant? (number)
```

5. **WAIT for user to pick one.** Do not proceed until user selects.

If nothing suitable is found for the given path + difficulty:

```
Couldn't find good candidates for {path}/{difficulty} — the relevant code areas
either already have open issues or don't have clean spots to introduce a bug at this level.

Want to try a different path or difficulty?
```

### Phase 3P: Plant + File Issue

#### Step A — Plant the Bug

**Use the Agent tool. Do NOT plant the bug yourself.**

```
Agent(
  subagent_type: "sde2",
  description: "Plant bug: {bug title}",
  prompt: """
  You are planting an intentional bug for a teaching exercise.
  Students will later find and fix this bug.

  ## Bug to Plant
  {bug title and description as agreed with the user}

  ## Affected Files
  {list of files identified during codebase exploration}

  ## Instructions
  1. Read the affected files thoroughly
  2. Make the SMALLEST possible code change to introduce the bug
  3. The change should look like a plausible mistake — not obviously intentional
  4. Do NOT add comments hinting at the bug
  5. Do NOT break anything else — the bug must be isolated to the described behavior
  6. Commit with an innocent-looking message that does NOT mention "bug" or "plant"

  ## Commit Message Guidelines
  The message must look like a normal refactor or style commit. Examples:
  - "refactor(feed): simplify card layout styles"
  - "style(forms): update input appearance for consistency"
  - "refactor(query): streamline build list query"
  Do NOT use words like: bug, plant, break, remove, intentional, exercise

  ## Commit Format
  git add {specific files} && git commit -m "{innocent message}"

  ## Output
  Return:
  - What was changed (file:line)
  - The exact code diff (before → after)
  - The commit message used
  """
)
```

#### Step B — File the GitHub Issue

After the bug is planted and committed, create the GitHub issue:

```bash
gh issue create \
  --title "{bug title}" \
  --label "bug,{difficulty},{path}" \
  --project "Bob the Builder" \
  --body "$(cat <<'EOF'
## Bug Report

### Screenshots
<!-- Add screenshots here -->

### Expected Behavior
{expected behavior — derived from the code's intended purpose}

### Actual Behavior
{actual behavior — what the planted bug causes}

### Affected Area
- **Page/Component:** {affected files/pages}
- **Path:** {frontend | backend | fullstack}
- **Difficulty:** {easy | medium | hard}

### How to Reproduce
1. {step 1 — navigate to the relevant page}
2. {step 2 — perform the action that triggers the bug}
3. {step 3 — observe the broken behavior}

### Hints
- Look at: `{primary affected file}`
{additional hint if appropriate}
EOF
)"
```

#### Step C — Report to User

```markdown
## Bug Planted

**{bug title}**

| Field   | Value                              |
| ------- | ---------------------------------- |
| Issue   | #{number} — {url}                  |
| Commit  | `{short sha}` — "{commit message}" |
| Changed | `{file:line}`                      |
| Labels  | `bug`, `{difficulty}`, `{path}`    |

### What Changed

{brief description of the code change}

### Code Diff

{before → after snippet}
```

---

## Mode: Bug

### Phase 2B: Frame the Issue

1. **Get the description:**
   - If provided in `$ARGUMENTS` after "bug" → use that
   - Otherwise → use conversation context
   - If neither has enough detail → ask the user to describe the bug

2. **Check for duplicates:**
   Compare the description against `existing_issues` titles. If a potential duplicate exists:

   ```
   This might duplicate an existing issue:
   - #{number}: {title}

   Should I continue creating a new issue, or is this the same bug?
   ```

   **WAIT for user confirmation.**

3. **Explore affected files:**
   Based on the description, read relevant files to determine:
   - Which components/pages are affected
   - Appropriate labels (`frontend` / `backend` / `fullstack`)
   - Appropriate difficulty (`easy` / `medium` / `hard`)

4. **Draft the issue and present to user:**

   ```markdown
   ## Draft Issue

   **Title:** {suggested title}
   **Labels:** `bug`, `{difficulty}`, `{path}`

   **Expected Behavior:**
   {inferred from description}

   **Actual Behavior:**
   {from user's description}

   **Affected Area:**

   - {files/pages}

   ---

   Look good? Edit anything, or say "go" to file it.
   You can add screenshots to the issue after it's created.
   ```

5. **WAIT for user approval.** Apply any edits the user requests.

### Phase 3B: File the Issue

```bash
gh issue create \
  --title "{title}" \
  --label "bug,{difficulty},{path}" \
  --project "Bob the Builder" \
  --body "$(cat <<'EOF'
## Bug Report

### Screenshots
<!-- Add screenshots here -->

### Expected Behavior
{expected}

### Actual Behavior
{actual}

### Affected Area
- **Page/Component:** {affected files/pages}
- **Path:** {path}
- **Difficulty:** {difficulty}

### How to Reproduce
1. {step 1}
2. {step 2}
3. {step 3}
EOF
)"
```

Report the issue URL to user. Remind them they can add screenshots via the GitHub UI.

---

## Mode: Feature

### Phase 2F: Frame the Issue

1. **Get the description:**
   - If provided in `$ARGUMENTS` after "feature" → use that
   - Otherwise → use conversation context
   - If neither has enough detail → ask the user to describe the feature

2. **Check for duplicates:**
   Same duplicate check as bug mode.

3. **Explore codebase for context:**
   Based on the description, explore the codebase to determine:
   - Which existing files/pages would be affected
   - Whether any related infrastructure already exists (tables, queries, components)
   - Appropriate labels (`frontend` / `backend` / `fullstack`)
   - Appropriate difficulty (`easy` / `medium` / `hard`)

4. **Generate acceptance criteria:**
   Based on the description + codebase context, draft 4-8 concrete acceptance criteria.

5. **Draft the issue and present to user:**

   ```markdown
   ## Draft Issue

   **Title:** {suggested title}
   **Labels:** `feature`, `{difficulty}`, `{path}`

   **Description:**
   {what the feature does}

   **Acceptance Criteria:**

   - [ ] {criterion 1}
   - [ ] {criterion 2}
   - [ ] ...

   **Affected Area:**

   - {files/pages that would need changes}

   ---

   Look good? Edit anything, or say "go" to file it.
   ```

6. **WAIT for user approval.** Apply any edits the user requests.

### Phase 3F: File the Issue

```bash
gh issue create \
  --title "{title}" \
  --label "feature,{difficulty},{path}" \
  --project "Bob the Builder" \
  --body "$(cat <<'EOF'
## Feature Request

### Screenshots
<!-- Add screenshots here -->

### Description
{description}

### Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}
- [ ] ...

### Affected Area
- **Pages/Components:** {affected files}
- **Path:** {path}
- **Difficulty:** {difficulty}

### Notes
{any context from codebase exploration — existing infrastructure, related code, etc.}
EOF
)"
```

Report the issue URL to user.

---

## When to Ask User

| Situation                          | Action                                                  |
| ---------------------------------- | ------------------------------------------------------- |
| Mode unclear from arguments        | Ask: plant, bug, or feature?                            |
| Plant path or difficulty missing   | Ask for the missing value                               |
| Bug/feature description too vague  | Ask user to elaborate                                   |
| Potential duplicate issue found    | Show duplicate, ask to continue or skip                 |
| After drafting issue (bug/feature) | Show draft, WAIT for approval                           |
| After suggesting plant options     | Show options, WAIT for pick                             |
| No valid plant candidates remain   | Inform user, suggest alternative path/difficulty        |
| User wants to add screenshots      | Remind them to add via GitHub UI after issue is created |

## Do Not

- Plant a bug without user explicitly picking it from the suggestions
- File an issue without showing the draft to the user first
- Use words like "plant", "intentional", "exercise" in commit messages or git history
- Create duplicate GitHub issues — always cross-reference `existing_issues`
- Skip the codebase exploration — context matters for accurate labels and scope
- Guess labels — derive `path` and `difficulty` from actual file analysis
