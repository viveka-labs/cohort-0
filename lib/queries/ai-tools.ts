import { createClient } from "@/lib/supabase/server";

/**
 * Fetches all AI tools, ordered alphabetically by name.
 */
export async function getAiTools() {
  const supabase = await createClient();

  return supabase.from("ai_tools").select("*").order("name");
}

/**
 * Fetches the AI tools associated with a specific build
 * through the `build_ai_tools` junction table.
 */
export async function getAiToolsByBuildId(buildId: string) {
  const supabase = await createClient();

  return supabase
    .from("build_ai_tools")
    .select(
      `
      ...ai_tools(*)
    `
    )
    .eq("build_id", buildId);
}
