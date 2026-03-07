import { createClient } from "@/lib/supabase/server";
import type { CommentInsert } from "@/types";

/**
 * Fetches all comments for a given build, including the author profile.
 * Results are ordered by oldest first so the conversation reads top-to-bottom.
 */
export async function getCommentsByBuildId(buildId: string) {
  const supabase = await createClient();

  return supabase
    .from("comments")
    .select(
      `
      *,
      profile:profiles(*)
    `
    )
    .eq("build_id", buildId)
    .order("created_at", { ascending: true });
}

/**
 * Creates a new comment. Returns the inserted row.
 */
export async function createComment(data: CommentInsert) {
  const supabase = await createClient();

  return supabase.from("comments").insert(data).select().single();
}

/**
 * Deletes a comment by ID. Returns the deleted row, or an error if
 * the comment was not found or RLS blocked the deletion.
 */
export async function deleteComment(id: string) {
  const supabase = await createClient();

  return supabase.from("comments").delete().eq("id", id).select().single();
}
