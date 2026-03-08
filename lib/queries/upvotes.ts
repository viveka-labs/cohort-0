import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Toggles an upvote for a build by a user.
 *
 * If the user has already upvoted, the upvote is removed.
 * If the user has not upvoted, an upvote is inserted.
 *
 * Returns `{ upvoted }` indicating the resulting state.
 */
export async function toggleUpvote(buildId: string, userId: string) {
  const supabase = await createClient();

  // Check if the upvote already exists
  const { data: existing, error: selectError } = await supabase
    .from("upvotes")
    .select("build_id")
    .eq("build_id", buildId)
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    return { data: null, error: selectError };
  }

  if (existing) {
    // Remove the upvote
    const { error: deleteError } = await supabase
      .from("upvotes")
      .delete()
      .eq("build_id", buildId)
      .eq("user_id", userId);

    if (deleteError) {
      return { data: null, error: deleteError };
    }

    return { data: { upvoted: false }, error: null };
  }

  // Insert the upvote
  const { error: insertError } = await supabase
    .from("upvotes")
    .insert({ build_id: buildId, user_id: userId });

  if (insertError) {
    // Handle race condition: if a concurrent request already inserted the
    // upvote, we get a 23505 unique_violation. Treat this as "already
    // upvoted" and fall through to remove it instead.
    if (insertError.code === "23505") {
      const { error: deleteError } = await supabase
        .from("upvotes")
        .delete()
        .eq("build_id", buildId)
        .eq("user_id", userId);

      if (deleteError) {
        return { data: null, error: deleteError };
      }

      return { data: { upvoted: false }, error: null };
    }

    return { data: null, error: insertError };
  }

  return { data: { upvoted: true }, error: null };
}

/**
 * Returns the total number of upvotes for a build.
 */
export async function getUpvoteCount(buildId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("upvotes")
    .select("*", { count: "exact", head: true })
    .eq("build_id", buildId);

  return { data: count ?? 0, error };
}

/**
 * Checks whether a specific user has upvoted a specific build.
 */
export async function hasUserUpvoted(buildId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("upvotes")
    .select("build_id")
    .eq("build_id", buildId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { data: false, error };
  }

  return { data: data !== null, error: null };
}
