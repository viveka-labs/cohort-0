import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { BuildType, BuildUpdate, BuildWithDetails } from '@/types';

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
 * Fetches all builds for the feed, including the author profile,
 * screenshots, AI tools (via junction table), tech stack tags
 * (via junction table), and upvote count.
 *
 * Results are ordered by newest first.
 */
export async function getBuilds() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('builds')
    .select(BUILD_WITH_DETAILS_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error };
  }

  const builds: BuildWithDetails[] = (data ?? []).map(
    (build) =>
      ({
        ...build,
        upvote_count: build.upvotes[0]?.count ?? 0,
      }) as BuildWithDetails
  );

  return { data: builds, error: null };
}

/**
 * Fetches a single build by ID with all related data (profile,
 * screenshots, AI tools, tech stack tags, and upvote count).
 */
export async function getBuildById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('builds')
    .select(BUILD_WITH_DETAILS_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error };
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
