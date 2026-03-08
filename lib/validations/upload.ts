import { z } from "zod";

// ---------------------------------------------------------------------------
// Upload request — used when requesting a signed URL for file upload
// ---------------------------------------------------------------------------

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
] as const;

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1, { error: "File name is required" }),
  contentType: z.enum(ALLOWED_IMAGE_TYPES, {
    error: "File must be an image (png, jpg, jpeg, gif, or webp)",
  }),
  buildId: z.string().uuid({ error: "Build ID must be a valid UUID" }),
});

export type UploadRequestData = z.infer<typeof uploadRequestSchema>;
