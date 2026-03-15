import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { ProfileUpdate } from '@/types';

// Fetch-by-ID contract: throws on real DB errors, returns { data: null } when not found.
// Callers can safely treat !data as "not found" and call notFound().
/**
 * Fetches a single profile by its ID.
 *
 * @throws {PostgrestError} When a database error occurs (not when a row is missing — missing rows return null data).
 */
export async function getProfileById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  // maybeSingle() returns null data (no error) when the row doesn't exist,
  // and only errors on real DB failures — throw to bubble up to error.tsx.
  if (error) {
    throw error;
  }

  return { data };
}

/**
 * Updates an existing profile by ID. Returns the updated row.
 */
export async function updateProfile(id: string, data: ProfileUpdate) {
  const supabase = await createClient();

  return supabase.from('profiles').update(data).eq('id', id).select().single();
}
