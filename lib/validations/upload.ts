import { z } from 'zod';

import { MimeType } from '@/lib/constants/mime-types';

// ---------------------------------------------------------------------------
// Upload request — used when requesting a signed URL for file upload
// ---------------------------------------------------------------------------

const allowedMimeTypes = Object.values(MimeType) as [MimeType, ...MimeType[]];

export const uploadRequestSchema = z.object({
  contentType: z.enum(allowedMimeTypes, {
    error: 'File must be an image (png, jpeg, gif, or webp)',
  }),
});

export type UploadRequestData = z.infer<typeof uploadRequestSchema>;
