import { z } from "zod";

// ---------------------------------------------------------------------------
// Profile form — used when editing a user profile
// ---------------------------------------------------------------------------

const optionalUrl = z.string().url("Please enter a valid URL").optional().or(z.literal(""));

export const profileFormSchema = z.object({
  display_name: z.string().max(50, "Display name is too long").optional().or(z.literal("")),
  bio: z.string().max(160, "Bio must be 160 characters or fewer").optional().or(z.literal("")),
  github_url: optionalUrl,
  twitter_url: optionalUrl,
  linkedin_url: optionalUrl,
  website_url: optionalUrl,
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
