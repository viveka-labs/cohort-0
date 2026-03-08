import { z } from "zod";

import { Constants } from "@/lib/supabase/database.types";

// ---------------------------------------------------------------------------
// Build form — used when creating or editing a build
// ---------------------------------------------------------------------------

const buildTypeValues = Constants.public.Enums.build_type;

const optionalUrl = z.string().url({ error: "Please enter a valid URL" }).optional().or(z.literal(""));

export const buildFormSchema = z.object({
  title: z.string().min(1, { error: "Title is required" }).max(120, { error: "Title is too long" }),
  description: z
    .string()
    .min(1, { error: "Description is required" })
    .max(2000, { error: "Description is too long" }),
  build_type: z.enum(buildTypeValues, {
    error: "Please select a build type",
  }),
  live_url: optionalUrl,
  repo_url: optionalUrl,
  ai_tool_ids: z
    .array(z.string().uuid({ error: "Each AI tool must be a valid ID" }))
    .min(1, { error: "Select at least one AI tool" }),
  tech_stack_tag_ids: z
    .array(z.string().uuid({ error: "Each tag must be a valid ID" })),
});

export type BuildFormData = z.infer<typeof buildFormSchema>;
