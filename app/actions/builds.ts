'use server';

import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth';
import { Routes } from '@/lib/constants/routes';
import { createBuild } from '@/lib/queries/builds';
import { createClient } from '@/lib/supabase/server';
import { type BuildFormData, buildFormSchema } from '@/lib/validations/build';

/**
 * Server action that creates a new build with its associated AI tools
 * and tech stack tags.
 *
 * Steps:
 * 1. Authenticate the user (redirects to login if not signed in)
 * 2. Validate form data against the Zod schema
 * 3. Insert the build row
 * 4. Insert junction rows for AI tools and tech stack tags
 * 5. Redirect to the new build's detail page
 *
 * Returns `{ error: string }` on failure so the client can display it.
 * On success, redirects — so the caller never receives a return value.
 */
export async function createBuildAction(data: BuildFormData) {
  const user = await requireUser();

  const result = buildFormSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Invalid form data' };
  }

  const { ai_tool_ids, tech_stack_tag_ids, ...buildData } = result.data;

  let buildId: string;

  try {
    const { data: build, error: buildError } = await createBuild(
      buildData,
      user.id
    );

    if (buildError || !build) {
      return { error: buildError?.message ?? 'Failed to create build' };
    }

    buildId = build.id;

    const supabase = await createClient();

    // Insert AI tool junction rows
    if (ai_tool_ids.length > 0) {
      const aiToolRows = ai_tool_ids.map((ai_tool_id) => ({
        build_id: buildId,
        ai_tool_id,
      }));

      const { error: aiToolsError } = await supabase
        .from('build_ai_tools')
        .insert(aiToolRows);

      if (aiToolsError) {
        return { error: 'Failed to save AI tools' };
      }
    }

    // Insert tech stack tag junction rows
    if (tech_stack_tag_ids.length > 0) {
      const techStackRows = tech_stack_tag_ids.map((tech_stack_tag_id) => ({
        build_id: buildId,
        tech_stack_tag_id,
      }));

      const { error: techStackError } = await supabase
        .from('build_tech_stack_tags')
        .insert(techStackRows);

      if (techStackError) {
        return { error: 'Failed to save tech stack tags' };
      }
    }
  } catch {
    return { error: 'An unexpected error occurred' };
  }

  redirect(Routes.buildDetail(buildId));
}
