import { z } from "zod";

import { Constants } from "@/lib/supabase/database.types";

// ---------------------------------------------------------------------------
// Build form — used when creating or editing a build
// ---------------------------------------------------------------------------

const buildTypeValues = Constants.public.Enums.build_type;

const optionalUrl = z.string().url("Please enter a valid URL").optional().or(z.literal(""));

export const buildFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description is too long"),
  build_type: z.enum(buildTypeValues, {
    message: "Please select a build type",
  }),
  live_url: optionalUrl,
  repo_url: optionalUrl,
  ai_tool_ids: z
    .array(z.string().uuid("Each AI tool must be a valid ID"))
    .min(1, "Select at least one AI tool"),
  tech_stack_tag_ids: z
    .array(z.string().uuid("Each tag must be a valid ID")),
});

export type BuildFormData = z.infer<typeof buildFormSchema>;
