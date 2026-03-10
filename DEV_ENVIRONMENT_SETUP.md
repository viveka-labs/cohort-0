# Dev Environment Setup -- Team Lead Runbook

Manual steps required to complete the dev (and prod) environment setup. These are one-time tasks that cannot be automated via code.

## Prerequisites

- Access to GitHub (to create OAuth Apps)
- Access to the Google Cloud Console OAuth credentials
- Admin access to both Supabase projects
- Admin access to the Vercel project (`bob-the-builder` in `innovativegamers-projects`)

## Environment Reference

| Environment | Supabase Project Ref   | Vercel URL                                                             |
| ----------- | ---------------------- | ---------------------------------------------------------------------- |
| Local       | Docker                 | `http://localhost:3000`                                                |
| Dev         | `fpbglwvzpmqmtdtrhuhc` | `https://bob-the-builder-git-dev-innovativegamers-projects.vercel.app` |
| Prod        | `nktwfzcadffzfthslckx` | `https://bob-the-builder-zeta.vercel.app`                              |

| Environment | Supabase Dashboard                                          |
| ----------- | ----------------------------------------------------------- |
| Dev         | https://supabase.com/dashboard/project/fpbglwvzpmqmtdtrhuhc |
| Prod        | https://supabase.com/dashboard/project/nktwfzcadffzfthslckx |

---

## GitHub OAuth — Separate App Per Environment

GitHub OAuth Apps only support a **single callback URL**, so each environment needs its own OAuth App. The existing app (used for local dev) stays unchanged.

| Environment | OAuth App Name            | Callback URL                                                |
| ----------- | ------------------------- | ----------------------------------------------------------- |
| Local       | existing app (keep as-is) | `http://127.0.0.1:54321/auth/v1/callback`                   |
| Dev         | `Bob The Builder (Dev)`   | `https://fpbglwvzpmqmtdtrhuhc.supabase.co/auth/v1/callback` |
| Prod        | `Bob The Builder (Prod)`  | `https://nktwfzcadffzfthslckx.supabase.co/auth/v1/callback` |

---

## Step 1: Create GitHub OAuth App for Dev

1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**
2. Fill in:
   - **Application name:** `Bob The Builder (Dev)`
   - **Homepage URL:** `https://bob-the-builder-git-dev-innovativegamers-projects.vercel.app`
   - **Authorization callback URL:** `https://fpbglwvzpmqmtdtrhuhc.supabase.co/auth/v1/callback`
3. Click **Register application**
4. Generate a client secret and note down:
   - `Client ID`
   - `Client Secret`

## Step 2: Create GitHub OAuth App for Prod

1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**
2. Fill in:
   - **Application name:** `Bob The Builder (Prod)`
   - **Homepage URL:** `https://bob-the-builder-zeta.vercel.app`
   - **Authorization callback URL:** `https://nktwfzcadffzfthslckx.supabase.co/auth/v1/callback`
3. Click **Register application**
4. Generate a client secret and note down:
   - `Client ID`
   - `Client Secret`

## Step 3: Update Google OAuth App

Google supports multiple redirect URIs and origins in a single app, so no new app needed.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials
2. Select your existing OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   ```
   https://bob-the-builder-git-dev-innovativegamers-projects.vercel.app
   https://bob-the-builder-zeta.vercel.app
   http://localhost:3000
   http://127.0.0.1:3000
   ```
   (keep `localhost` and `127.0.0.1` origins if they already exist, or add them for local dev)
4. Under **Authorized redirect URIs**, add:
   ```
   https://fpbglwvzpmqmtdtrhuhc.supabase.co/auth/v1/callback
   https://nktwfzcadffzfthslckx.supabase.co/auth/v1/callback
   ```
5. Save changes

## Step 4: Enable OAuth Providers in Dev Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/fpbglwvzpmqmtdtrhuhc
2. Navigate to **Authentication > Providers**
3. Enable **GitHub**:
   - Client ID: from Step 1
   - Client Secret: from Step 1
4. Enable **Google**:
   - Client ID + Secret: from your existing Google OAuth app
5. Navigate to **Authentication > URL Configuration**
6. Set **Site URL** to:
   ```
   https://bob-the-builder-git-dev-innovativegamers-projects.vercel.app
   ```
7. Under **Redirect URLs**, add:
   ```
   https://bob-the-builder-git-dev-innovativegamers-projects.vercel.app/**
   http://localhost:3000/**
   ```

## Step 5: Enable OAuth Providers in Prod Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/nktwfzcadffzfthslckx
2. Navigate to **Authentication > Providers**
3. Enable **GitHub**:
   - Client ID: from Step 2
   - Client Secret: from Step 2
4. Enable **Google**:
   - Client ID + Secret: from your existing Google OAuth app
5. Navigate to **Authentication > URL Configuration**
6. Set **Site URL** to:
   ```
   https://bob-the-builder-zeta.vercel.app
   ```
7. Under **Redirect URLs**, add:
   ```
   https://bob-the-builder-zeta.vercel.app/**
   # Note: localhost is intentionally NOT added — production should never redirect to localhost.
   ```

---

## Verification Checklist

After completing all steps, verify end-to-end:

- [ ] **Dev OAuth (GitHub):** Sign in with GitHub works on the dev URL
- [ ] **Dev OAuth (Google):** Sign in with Google works on the dev URL
- [ ] **Prod OAuth (GitHub):** Sign in with GitHub works on the prod URL
- [ ] **Prod OAuth (Google):** Sign in with Google works on the prod URL
- [ ] **Vercel dev deployment:** Pushing to `dev` triggers a deployment
- [ ] **Vercel prod deployment:** Pushing to `main` triggers a deployment
- [ ] **Type generation:** `npm run gen-types:dev` produces valid types
- [ ] **Local development:** `npm run dev` loads at `localhost:3000`
