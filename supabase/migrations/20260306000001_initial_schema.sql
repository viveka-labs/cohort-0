-- =============================================================================
-- Phase 1: Core Schema (enum, tables, indexes)
-- =============================================================================

-- Build type enum
CREATE TYPE build_type AS ENUM ('app', 'feature', 'fix', 'automation', 'experiment');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- User profiles linked to auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  github_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Predefined AI tools (admin-managed)
CREATE TABLE ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Predefined tech stack tags (admin-managed)
CREATE TABLE tech_stack_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Core content table
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),  -- intentional: ON DELETE SET NULL preserves builds when users are deleted; DEFAULT auth.uid() ensures new inserts via API always have an owner
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  build_type build_type NOT NULL,
  live_url TEXT,
  repo_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Screenshots per build
CREATE TABLE build_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Junction: builds <-> ai_tools
CREATE TABLE build_ai_tools (
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  ai_tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  PRIMARY KEY (build_id, ai_tool_id)
);

-- Junction: builds <-> tech_stack_tags
CREATE TABLE build_tech_stack_tags (
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  tech_stack_tag_id UUID NOT NULL REFERENCES tech_stack_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (build_id, tech_stack_tag_id)
);

-- Comments on builds
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),  -- intentional: ON DELETE SET NULL preserves comments when users are deleted; DEFAULT auth.uid() ensures new inserts via API always have an owner
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One upvote per user per build
CREATE TABLE upvotes (
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (build_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_builds_user_id ON builds (user_id);
CREATE INDEX idx_builds_created_at ON builds (created_at DESC);
CREATE INDEX idx_builds_build_type ON builds (build_type);
CREATE INDEX idx_builds_is_featured ON builds (is_featured) WHERE is_featured = true;
CREATE INDEX idx_build_screenshots_build_id ON build_screenshots (build_id);
CREATE INDEX idx_build_ai_tools_ai_tool_id ON build_ai_tools (ai_tool_id);
CREATE INDEX idx_build_tech_stack_tags_tag_id ON build_tech_stack_tags (tech_stack_tag_id);
CREATE INDEX idx_comments_build_id ON comments (build_id);
CREATE INDEX idx_upvotes_build_id ON upvotes (build_id);

-- =============================================================================
-- Phase 2: Row Level Security (RLS) Policies
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on all tables
-- ---------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_tech_stack_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Admin helper function
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- ai_tools policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Public can view ai_tools"
  ON ai_tools FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert ai_tools"
  ON ai_tools FOR INSERT
  TO authenticated
  WITH CHECK ((select is_admin()));

CREATE POLICY "Admins can update ai_tools"
  ON ai_tools FOR UPDATE
  TO authenticated
  USING ((select is_admin()))
  WITH CHECK ((select is_admin()));

CREATE POLICY "Admins can delete ai_tools"
  ON ai_tools FOR DELETE
  TO authenticated
  USING ((select is_admin()));

-- ---------------------------------------------------------------------------
-- tech_stack_tags policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Public can view tech_stack_tags"
  ON tech_stack_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert tech_stack_tags"
  ON tech_stack_tags FOR INSERT
  TO authenticated
  WITH CHECK ((select is_admin()));

CREATE POLICY "Admins can update tech_stack_tags"
  ON tech_stack_tags FOR UPDATE
  TO authenticated
  USING ((select is_admin()))
  WITH CHECK ((select is_admin()));

CREATE POLICY "Admins can delete tech_stack_tags"
  ON tech_stack_tags FOR DELETE
  TO authenticated
  USING ((select is_admin()));

-- ---------------------------------------------------------------------------
-- builds policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Public can view builds"
  ON builds FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert builds"
  ON builds FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Note: After a user is deleted, builds.user_id becomes NULL (ON DELETE SET NULL).
-- UPDATE and DELETE policies below cannot match NULL = auth.uid(), so orphaned builds
-- become immutable via RLS and require admin (service-role) intervention to manage.
-- This is intentional: builds are preserved for the community after user deletion.

CREATE POLICY "Users can update own builds"
  ON builds FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own builds"
  ON builds FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- build_screenshots policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Public can view build_screenshots"
  ON build_screenshots FOR SELECT
  USING (true);

CREATE POLICY "Users can insert screenshots for own builds"
  ON build_screenshots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_id
        AND builds.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update screenshots for own builds"
  ON build_screenshots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_id
        AND builds.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_id
        AND builds.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete screenshots for own builds"
  ON build_screenshots FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_id
        AND builds.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- build_ai_tools policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Public can view build_ai_tools"
  ON build_ai_tools FOR SELECT
  USING (true);

CREATE POLICY "Users can insert ai_tools for own builds"
  ON build_ai_tools FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_id
        AND builds.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete ai_tools for own builds"
  ON build_ai_tools FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_id
        AND builds.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- build_tech_stack_tags policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Public can view build_tech_stack_tags"
  ON build_tech_stack_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can insert tags for own builds"
  ON build_tech_stack_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_id
        AND builds.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete tags for own builds"
  ON build_tech_stack_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_id
        AND builds.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- comments policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Public can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- upvotes policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Public can view upvotes"
  ON upvotes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert upvotes"
  ON upvotes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own upvotes"
  ON upvotes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =============================================================================
-- Phase 3: Triggers
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- Auto-update updated_at timestamp
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON builds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
