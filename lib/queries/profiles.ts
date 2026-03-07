import { createClient } from "@/lib/supabase/server";
import type { ProfileUpdate } from "@/types";

/**
 * Fetches a single profile by its ID.
 */
export async function getProfileById(id: string) {
  const supabase = await createClient();

  return supabase.from("profiles").select("*").eq("id", id).single();
}

/**
 * Updates an existing profile by ID. Returns the updated row.
 */
export async function updateProfile(id: string, data: ProfileUpdate) {
  const supabase = await createClient();

  return supabase
    .from("profiles")
    .update(data)
    .eq("id", id)
    .select()
    .single();
}
