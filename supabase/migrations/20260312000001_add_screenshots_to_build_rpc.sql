-- =============================================================================
-- Add screenshot URLs to the atomic build creation RPC
-- =============================================================================
-- Replaces `create_build_with_relations` with a new version that accepts
-- `p_screenshot_urls TEXT[]`. After creating the build row and junction rows,
-- inserts one row per URL into `build_screenshots` with a 0-based
-- `display_order` matching the array position.
--
-- We must DROP the old 7-argument overload first because CREATE OR REPLACE
-- only matches functions with identical argument lists. Without the DROP,
-- PostgreSQL would create a second overloaded function instead of replacing.

DROP FUNCTION IF EXISTS create_build_with_relations(TEXT, TEXT, build_type, TEXT, TEXT, UUID[], UUID[]);

CREATE OR REPLACE FUNCTION create_build_with_relations(
  p_title TEXT,
  p_description TEXT,
  p_build_type build_type,
  p_live_url TEXT DEFAULT NULL,
  p_repo_url TEXT DEFAULT NULL,
  p_ai_tool_ids UUID[] DEFAULT '{}',
  p_tech_stack_tag_ids UUID[] DEFAULT '{}',
  p_screenshot_urls TEXT[] DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_build_id UUID;
BEGIN
  INSERT INTO public.builds (user_id, title, description, build_type, live_url, repo_url)
  VALUES (auth.uid(), p_title, p_description, p_build_type, p_live_url, p_repo_url)
  RETURNING id INTO v_build_id;

  IF array_length(p_ai_tool_ids, 1) IS NOT NULL THEN
    INSERT INTO public.build_ai_tools (build_id, ai_tool_id)
    SELECT v_build_id, unnest(p_ai_tool_ids);
  END IF;

  IF array_length(p_tech_stack_tag_ids, 1) IS NOT NULL THEN
    INSERT INTO public.build_tech_stack_tags (build_id, tech_stack_tag_id)
    SELECT v_build_id, unnest(p_tech_stack_tag_ids);
  END IF;

  IF array_length(p_screenshot_urls, 1) IS NOT NULL THEN
    INSERT INTO public.build_screenshots (build_id, url, display_order)
    SELECT v_build_id, u.url, (u.ordinality - 1)::integer
    FROM unnest(p_screenshot_urls) WITH ORDINALITY AS u(url, ordinality);
  END IF;

  RETURN v_build_id;
END;
$$;
