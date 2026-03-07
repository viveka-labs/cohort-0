import { createClient } from "@/lib/supabase/server";
import type { BuildInsert, BuildUpdate, BuildWithDetails } from "@/types";

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
    .from("builds")
    .select(
      `
      *,
      profile:profiles(*),
      screenshots:build_screenshots(*),
      ai_tools:build_ai_tools(
        ...ai_tools(*)
      ),
      tech_stack_tags:build_tech_stack_tags(
        ...tech_stack_tags(*)
      ),
      upvotes(build_id)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error };
  }

  const builds: BuildWithDetails[] = (data ?? []).map((build) => ({
    ...build,
    profile: build.profile,
    screenshots: build.screenshots,
    ai_tools: build.ai_tools,
    tech_stack_tags: build.tech_stack_tags,
    upvote_count: build.upvotes.length,
  }));

  return { data: builds, error: null };
}

/**
 * Fetches a single build by ID with all related data (profile,
 * screenshots, AI tools, tech stack tags, and upvote count).
 */
export async function getBuildById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("builds")
    .select(
      `
      *,
      profile:profiles(*),
      screenshots:build_screenshots(*),
      ai_tools:build_ai_tools(
        ...ai_tools(*)
      ),
      tech_stack_tags:build_tech_stack_tags(
        ...tech_stack_tags(*)
      ),
      upvotes(build_id)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error };
  }

  const build: BuildWithDetails = {
    ...data,
    profile: data.profile,
    screenshots: data.screenshots,
    ai_tools: data.ai_tools,
    tech_stack_tags: data.tech_stack_tags,
    upvote_count: data.upvotes.length,
  };

  return { data: build, error: null };
}

/**
 * Creates a new build. Returns the inserted row.
 *
 * Callers must set `user_id` on `data` from the authenticated session
 * (e.g. via `requireUser()`). RLS enforces ownership.
 */
export async function createBuild(data: BuildInsert) {
  const supabase = await createClient();

  return supabase.from("builds").insert(data).select().single();
}

/**
 * Updates an existing build by ID. Returns the updated row.
 *
 * Callers must ensure `user_id` on `data` matches the authenticated session.
 * RLS enforces ownership — only the build owner can update.
 */
export async function updateBuild(id: string, data: BuildUpdate) {
  const supabase = await createClient();

  return supabase.from("builds").update(data).eq("id", id).select().single();
}

/**
 * Deletes a build by ID. Returns the deleted row, or an error if
 * the build was not found or RLS blocked the deletion.
 */
export async function deleteBuild(id: string) {
  const supabase = await createClient();

  return supabase.from("builds").delete().eq("id", id).select().single();
}
