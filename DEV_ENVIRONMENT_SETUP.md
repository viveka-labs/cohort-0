# Dev Environment Setup -- Team Lead Runbook

Manual steps required to complete the dev (and prod) environment setup. These are one-time tasks that cannot be automated via code.

## Prerequisites

- Access to the GitHub OAuth App settings
- Access to the Google Cloud Console OAuth credentials
- Admin access to both Supabase projects
- Admin access to the Vercel project (`bob-the-builder` in `innovativegamers-projects`)

## Supabase Project References

| Environment | Project Ref            | Dashboard URL                                               |
| ----------- | ---------------------- | ----------------------------------------------------------- |
| Dev         | `fpbglwvzpmqmtdtrhuhc` | https://supabase.com/dashboard/project/fpbglwvzpmqmtdtrhuhc |
| Prod        | `nktwfzcadffzfthslckx` | https://supabase.com/dashboard/project/nktwfzcadffzfthslckx |

---

## Step 1: Add Dev Callback URL to GitHub OAuth App

1. Go to your GitHub OAuth App settings (Settings > Developer settings > OAuth Apps)
2. Add the following **Authorization callback URL**:
   ```
   https://fpbglwvzpmqmtdtrhuhc.supabase.co/auth/v1/callback
   ```
3. Save changes

## Step 2: Add Dev Redirect URI to Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials
2. Select your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://fpbglwvzpmqmtdtrhuhc.supabase.co/auth/v1/callback
   ```
4. Save changes

## Step 3: Add Prod Callback URL to GitHub OAuth App

1. Go to your GitHub OAuth App settings (same app as Step 1)
2. Add the following **Authorization callback URL**:
   ```
   https://nktwfzcadffzfthslckx.supabase.co/auth/v1/callback
   ```
3. Save changes

## Step 4: Add Prod Redirect URI to Google OAuth App

1. Go to Google Cloud Console > APIs & Services > Credentials (same client as Step 2)
2. Under **Authorized redirect URIs**, add:
   ```
   https://nktwfzcadffzfthslckx.supabase.co/auth/v1/callback
   ```
3. Save changes

## Step 5: Enable OAuth Providers in Dev Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/fpbglwvzpmqmtdtrhuhc
2. Navigate to **Authentication > Providers**
3. Enable **GitHub**:
   - Set Client ID and Client Secret (use the shared OAuth app credentials)
4. Enable **Google**:
   - Set Client ID and Client Secret (use the shared OAuth app credentials)
5. Navigate to **Authentication > URL Configuration**
6. Set **Site URL** to the dev Vercel URL (e.g., `https://dev.bob-the-builder.vercel.app`)
7. Add the following to **Redirect URLs**:
   - `https://dev.bob-the-builder.vercel.app/**`
   - `http://localhost:3000/**` (for local development pointing at dev Supabase)

## Step 6: Enable OAuth Providers in Prod Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/nktwfzcadffzfthslckx
2. Navigate to **Authentication > Providers**
3. Enable **GitHub**:
   - Set Client ID and Client Secret (use the shared OAuth app credentials)
4. Enable **Google**:
   - Set Client ID and Client Secret (use the shared OAuth app credentials)
5. Navigate to **Authentication > URL Configuration**
6. Set **Site URL** to `https://bob-the-builder.vercel.app`
7. Add the following to **Redirect URLs**:
   - `https://bob-the-builder.vercel.app/**`

## Step 7: Assign Stable Domain for Dev Branch in Vercel

1. Go to the Vercel dashboard for the `bob-the-builder` project
2. Navigate to **Settings > Domains**
3. Add domain: `dev.bob-the-builder.vercel.app`
4. Assign it to the **`dev`** git branch

## Step 8: Connect GitHub Repository to Vercel

1. In the Vercel dashboard for `bob-the-builder`, go to **Settings > Git**
2. Connect the GitHub repository: `viveka-labs/bob-the-builder`
3. Verify that:
   - **Production Branch** is set to `main`
   - Preview deployments trigger on pushes to `dev` and feature branches

---

## Verification Checklist

After completing all steps above, verify the setup works end-to-end:

- [ ] **Dev OAuth (GitHub):** Sign in with GitHub works on `https://dev.bob-the-builder.vercel.app`
- [ ] **Dev OAuth (Google):** Sign in with Google works on `https://dev.bob-the-builder.vercel.app`
- [ ] **Prod OAuth (GitHub):** Sign in with GitHub works on `https://bob-the-builder.vercel.app`
- [ ] **Prod OAuth (Google):** Sign in with Google works on `https://bob-the-builder.vercel.app`
- [ ] **Vercel dev deployment:** Pushing to `dev` branch triggers a deployment to `dev.bob-the-builder.vercel.app`
- [ ] **Vercel prod deployment:** Pushing to `main` branch triggers a deployment to `bob-the-builder.vercel.app`
- [ ] **Type generation:** `npm run gen-types:dev` succeeds and produces valid types
- [ ] **Local development:** `npm run dev` with dev Supabase credentials loads the app at `localhost:3000`
