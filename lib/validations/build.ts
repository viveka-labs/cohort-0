import { z } from 'zod';

import { Constants } from '@/lib/supabase/database.types';

// ---------------------------------------------------------------------------
// Build form — used when creating or editing a build
// ---------------------------------------------------------------------------

const buildTypeValues = Constants.public.Enums.build_type;

const optionalUrl = z
  .string()
  .transform((v) => (v === '' ? undefined : v))
  .pipe(z.string().url({ error: 'Please enter a valid URL' }).optional());

/**
 * Schema for a screenshot entry in the form.
 * Stores both the public URL and the storage path so the upload component
 * can manage deletions without a separate state store.
 */
const screenshotEntrySchema = z.object({
  url: z.string().url({ error: 'Each screenshot must be a valid URL' }),
  path: z.string().min(1, { error: 'Storage path is required' }),
});

export type ScreenshotEntry = z.infer<typeof screenshotEntrySchema>;

export const buildFormSchema = z.object({
  title: z
    .string()
    .min(1, { error: 'Title is required' })
    .max(120, { error: 'Title is too long' }),
  description: z
    .string()
    .min(1, { error: 'Description is required' })
    .max(2000, { error: 'Description is too long' }),
  build_type: z.enum(buildTypeValues, {
    error: 'Please select a build type',
  }),
  live_url: optionalUrl,
  repo_url: optionalUrl,
  ai_tool_ids: z
    .array(z.string().uuid({ error: 'Each AI tool must be a valid ID' }))
    .min(1, { error: 'Select at least one AI tool' }),
  tech_stack_tag_ids: z.array(
    z.string().uuid({ error: 'Each tag must be a valid ID' })
  ),
  screenshot_urls: z
    .array(screenshotEntrySchema)
    .min(1, { error: 'At least 1 screenshot is required' })
    .max(5, { error: 'Maximum 5 screenshots allowed' }),
  removed_screenshot_urls: z.array(z.string()).optional().default([]),
});

/** What the form fields hold before Zod transforms run (e.g. empty strings). */
export type BuildFormInput = z.input<typeof buildFormSchema>;

/** What `safeParse` returns after transforms (e.g. empty strings become undefined). */
export type BuildFormData = z.infer<typeof buildFormSchema>;
