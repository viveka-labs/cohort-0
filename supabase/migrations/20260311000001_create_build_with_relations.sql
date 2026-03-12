-- =============================================================================
-- Atomic build creation with junction table inserts
-- =============================================================================
-- Replaces three separate inserts (builds, build_ai_tools, build_tech_stack_tags)
-- with a single RPC call. If any insert fails, the entire transaction rolls back.

CREATE OR REPLACE FUNCTION create_build_with_relations(
  p_title TEXT,
  p_description TEXT,
  p_build_type build_type,
  p_live_url TEXT DEFAULT NULL,
  p_repo_url TEXT DEFAULT NULL,
  p_ai_tool_ids UUID[] DEFAULT '{}',
  p_tech_stack_tag_ids UUID[] DEFAULT '{}'
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

  RETURN v_build_id;
END;
$$;
