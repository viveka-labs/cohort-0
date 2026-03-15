import { z } from 'zod';

import { MimeType } from '@/lib/constants/mime-types';
import { AVATAR_BUCKET_NAME, BUCKET_NAME } from '@/lib/constants/storage';

// ---------------------------------------------------------------------------
// Upload request — used when requesting a signed URL for file upload
// ---------------------------------------------------------------------------

const allowedMimeTypes = Object.values(MimeType) as [MimeType, ...MimeType[]];

/**
 * Allowlisted storage buckets. Only these buckets can be targeted by the
 * upload API. Defaults to 'build-screenshots' for backwards compatibility.
 */
const allowedBuckets = [BUCKET_NAME, AVATAR_BUCKET_NAME] as const;

export const uploadRequestSchema = z.object({
  contentType: z.enum(allowedMimeTypes, {
    error: 'File must be an image (png, jpeg, gif, or webp)',
  }),
  bucket: z
    .enum(allowedBuckets, {
      error: `Bucket must be one of: ${allowedBuckets.join(', ')}`,
    })
    .default(BUCKET_NAME),
});

export type UploadRequestData = z.infer<typeof uploadRequestSchema>;
