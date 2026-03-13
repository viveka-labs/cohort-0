-- =============================================================================
-- Atomic build update with junction table delete-and-reinsert
-- =============================================================================
-- Mirrors `create_build_with_relations` but for updates. Accepts the build ID
-- plus all editable fields. Updates the `builds` row, then deletes and
-- re-inserts rows in the three child/junction tables (`build_ai_tools`,
-- `build_tech_stack_tags`, `build_screenshots`) within a single transaction.
--
-- Defense-in-depth: verifies `auth.uid()` matches the build's `user_id`
-- before proceeding, alongside RLS policies on the underlying tables.

CREATE OR REPLACE FUNCTION update_build_with_relations(
  p_build_id UUID,
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
  v_owner_id UUID;
BEGIN
  -- Verify the caller owns this build
  SELECT user_id INTO v_owner_id
  FROM public.builds
  WHERE id = p_build_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Build not found: %', p_build_id;
  END IF;

  IF v_owner_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: you do not own this build';
  END IF;

  -- Update the builds row
  UPDATE public.builds
  SET
    title = p_title,
    description = p_description,
    build_type = p_build_type,
    live_url = p_live_url,
    repo_url = p_repo_url
  WHERE id = p_build_id;

  -- Delete-and-reinsert AI tool associations
  DELETE FROM public.build_ai_tools WHERE build_id = p_build_id;

  IF array_length(p_ai_tool_ids, 1) IS NOT NULL THEN
    INSERT INTO public.build_ai_tools (build_id, ai_tool_id)
    SELECT p_build_id, unnest(p_ai_tool_ids);
  END IF;

  -- Delete-and-reinsert tech stack tag associations
  DELETE FROM public.build_tech_stack_tags WHERE build_id = p_build_id;

  IF array_length(p_tech_stack_tag_ids, 1) IS NOT NULL THEN
    INSERT INTO public.build_tech_stack_tags (build_id, tech_stack_tag_id)
    SELECT p_build_id, unnest(p_tech_stack_tag_ids);
  END IF;

  -- Delete-and-reinsert screenshots
  DELETE FROM public.build_screenshots WHERE build_id = p_build_id;

  IF array_length(p_screenshot_urls, 1) IS NOT NULL THEN
    INSERT INTO public.build_screenshots (build_id, url, display_order)
    SELECT p_build_id, u.url, (u.ordinality - 1)::integer
    FROM unnest(p_screenshot_urls) WITH ORDINALITY AS u(url, ordinality);
  END IF;

  RETURN p_build_id;
END;
$$;
