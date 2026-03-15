import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type {
  BuildType,
  BuildUpdate,
  BuildWithDetails,
  FeedFilters,
} from '@/types';

/**
 * Shared select string for fetching builds with all related data.
 * Uses `upvotes:upvotes(count)` to let PostgREST compute the count
 * server-side instead of fetching every upvote row.
 */
const BUILD_WITH_DETAILS_SELECT = `
  *,
  profile:profiles!builds_user_id_fkey(*),
  screenshots:build_screenshots(*),
  ai_tools:build_ai_tools(
    ...ai_tools(*)
  ),
  tech_stack_tags:build_tech_stack_tags(
    ...tech_stack_tags(*)
  ),
  upvotes:upvotes(count)
` as const;

/**
 * Select string that includes an additional `!inner` join on `build_ai_tools`
 * for filtering. The alias `filter_ai` restricts parent rows to those with
 * at least one matching AI tool, without corrupting the display join
 * (`ai_tools`) that fetches the full list of AI tools per build.
 */
const BUILD_WITH_DETAILS_AND_AI_FILTER_SELECT = `
  *,
  profile:profiles!builds_user_id_fkey(*),
  screenshots:build_screenshots(*),
  ai_tools:build_ai_tools(
    ...ai_tools(*)
  ),
  tech_stack_tags:build_tech_stack_tags(
    ...tech_stack_tags(*)
  ),
  upvotes:upvotes(count),
  filter_ai:build_ai_tools!inner(ai_tool_id)
` as const;

/** Maximum number of builds returned per page. */
const BUILDS_PAGE_SIZE = 20;

/**
 * Fetches a page of builds for the feed, including the author profile,
 * screenshots, AI tools (via junction table), tech stack tags
 * (via junction table), and upvote count.
 *
 * Results are ordered by newest first and limited to {@link BUILDS_PAGE_SIZE}.
 *
 * Optional filters narrow the results server-side:
 * - `buildTypes` — only builds whose `build_type` is in the list
 * - `aiToolIds` — only builds linked to at least one of the given AI tools
 *
 * Omitting a filter (or passing an empty array) returns all builds for
 * that dimension, so the unfiltered call path is unchanged.
 */
export async function getBuilds(filters?: FeedFilters) {
  const supabase = await createClient();

  const activeBuildTypes = filters?.buildTypes?.length
    ? filters.buildTypes
    : null;
  const activeAiToolIds = filters?.aiToolIds?.length ? filters.aiToolIds : null;

  // When filtering by AI tool we use a separate code path that includes
  // an `!inner` join alias (`filter_ai`). This keeps both select strings
  // as compile-time literal types so Supabase's PostgREST type inference
  // works correctly in each branch.
  if (activeAiToolIds) {
    let query = supabase
      .from('builds')
      .select(BUILD_WITH_DETAILS_AND_AI_FILTER_SELECT)
      .in('filter_ai.ai_tool_id', activeAiToolIds)
      .order('created_at', { ascending: false })
      .range(0, BUILDS_PAGE_SIZE - 1);

    if (activeBuildTypes) {
      query = query.in('build_type', activeBuildTypes);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    const builds: BuildWithDetails[] = (data ?? []).map((build) => {
      const { filter_ai: _filter_ai, ...rest } = build;
      return { ...rest, upvote_count: build.upvotes[0]?.count ?? 0 };
    });

    return { data: builds, error: null };
  }

  // No AI tool filter — use the standard select without the extra join.
  let query = supabase
    .from('builds')
    .select(BUILD_WITH_DETAILS_SELECT)
    .order('created_at', { ascending: false })
    .range(0, BUILDS_PAGE_SIZE - 1);

  if (activeBuildTypes) {
    query = query.in('build_type', activeBuildTypes);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  const builds: BuildWithDetails[] = (data ?? []).map((build) => {
    const { upvotes, ...rest } = build;
    return { ...rest, upvote_count: upvotes[0]?.count ?? 0 };
  });

  return { data: builds, error: null };
}

/**
 * Fetches all builds for a specific user, including the author profile,
 * screenshots, AI tools, tech stack tags, and upvote count.
 *
 * Results are ordered by newest first (no pagination — profile pages
 * show the complete list).
 */
export async function getBuildsForUser(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('builds')
    .select(BUILD_WITH_DETAILS_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error };
  }

  const builds: BuildWithDetails[] = (data ?? []).map((build) => {
    const { upvotes, ...rest } = build;
    return { ...rest, upvote_count: upvotes[0]?.count ?? 0 };
  });

  return { data: builds, error: null };
}

/**
 * Fetches a single build by ID with all related data (profile,
 * screenshots, AI tools, tech stack tags, and upvote count).
 *
 * @throws {PostgrestError} When a database error occurs (not when a row is missing — missing rows return null data).
 */
export async function getBuildById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('builds')
    .select(BUILD_WITH_DETAILS_SELECT)
    .eq('id', id)
    .maybeSingle();

  // maybeSingle() returns null data (no error) when the row doesn't exist,
  // and only errors on real DB failures — throw to bubble up to error.tsx.
  if (error) {
    throw error;
  }
  if (!data) {
    return { data: null, error: null };
  }

  const build: BuildWithDetails = {
    ...data,
    upvote_count: data.upvotes[0]?.count ?? 0,
  } as BuildWithDetails;

  return { data: build, error: null };
}

/**
 * Creates a new build along with its AI tool and tech stack tag
 * associations in a single atomic database transaction.
 *
 * Uses a PostgreSQL function (`create_build_with_relations`) so that
 * all inserts succeed or fail together -- no orphaned rows.
 *
 * The function uses `auth.uid()` internally to set the build owner,
 * so the caller must be authenticated.
 */
export async function createBuildWithRelations(params: {
  title: string;
  description: string;
  buildType: BuildType;
  liveUrl?: string | null;
  repoUrl?: string | null;
  aiToolIds: string[];
  techStackTagIds: string[];
  screenshotUrls?: string[];
}) {
  const supabase = await createClient();

  return supabase.rpc('create_build_with_relations', {
    p_title: params.title,
    p_description: params.description,
    p_build_type: params.buildType,
    p_live_url: params.liveUrl ?? undefined,
    p_repo_url: params.repoUrl ?? undefined,
    p_ai_tool_ids: params.aiToolIds,
    p_tech_stack_tag_ids: params.techStackTagIds,
    p_screenshot_urls: params.screenshotUrls ?? [],
  });
}

/**
 * Updates an existing build along with its AI tool, tech stack tag,
 * and screenshot associations in a single atomic database transaction.
 *
 * Uses a PostgreSQL function (`update_build_with_relations`) that
 * deletes and re-inserts all junction/child rows, so the caller
 * doesn't need to diff what changed -- just pass the full new state.
 *
 * The function uses `auth.uid()` internally to verify ownership,
 * so the caller must be authenticated.
 */
export async function updateBuildWithRelations(params: {
  buildId: string;
  title: string;
  description: string;
  buildType: BuildType;
  liveUrl?: string | null;
  repoUrl?: string | null;
  aiToolIds: string[];
  techStackTagIds: string[];
  screenshotUrls?: string[];
}) {
  const supabase = await createClient();

  return supabase.rpc('update_build_with_relations', {
    p_build_id: params.buildId,
    p_title: params.title,
    p_description: params.description,
    p_build_type: params.buildType,
    // `?? undefined` omits the key from the JSON payload, which triggers the
    // SQL function's `DEFAULT NULL` — the same result as sending explicit null.
    // This matches the pattern used by `createBuildWithRelations`.
    p_live_url: params.liveUrl ?? undefined,
    p_repo_url: params.repoUrl ?? undefined,
    p_ai_tool_ids: params.aiToolIds,
    p_tech_stack_tag_ids: params.techStackTagIds,
    p_screenshot_urls: params.screenshotUrls ?? [],
  });
}

/**
 * Updates an existing build by ID. Returns the updated row.
 *
 * Callers must ensure `user_id` on `data` matches the authenticated session.
 * RLS enforces ownership — only the build owner can update.
 */
export async function updateBuild(id: string, data: BuildUpdate) {
  const supabase = await createClient();

  return supabase.from('builds').update(data).eq('id', id).select().single();
}

/**
 * Deletes a build by ID. Returns the deleted row, or an error if
 * the build was not found or RLS blocked the deletion.
 */
export async function deleteBuild(id: string) {
  const supabase = await createClient();

  return supabase.from('builds').delete().eq('id', id).select().single();
}
