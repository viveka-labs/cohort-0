import 'server-only';

import { createClient } from '@/lib/supabase/server';

/**
 * Fetches all tech stack tags, ordered alphabetically by name.
 */
export async function getTechStackTags() {
  const supabase = await createClient();

  return supabase.from('tech_stack_tags').select('*').order('name');
}
