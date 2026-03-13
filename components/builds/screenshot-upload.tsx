'use client';

import { ImagePlusIcon, Loader2Icon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { MimeType } from '@/lib/constants/mime-types';
import { BUCKET_NAME } from '@/lib/constants/storage';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIME_TYPES = Object.values(MimeType);
const ACCEPT_STRING = ACCEPTED_MIME_TYPES.join(',');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UploadedScreenshot = {
  url: string;
  /** Storage path used for deletion. */
  path: string;
};

type UploadApiResponse = {
  token: string;
  path: string;
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ScreenshotUploadProps = {
  /** Called whenever the list of uploaded public URLs changes. */
  onUrlsChange: (urls: string[]) => void;
  /** Maximum number of screenshots allowed. Defaults to 5. */
  maxFiles?: number;
  /** Pre-existing screenshot URLs to display in edit mode. */
  initialScreenshots?: string[];
};

// ---------------------------------------------------------------------------
// ScreenshotUpload
// ---------------------------------------------------------------------------

/**
 * Derives the Supabase Storage path from a public URL.
 *
 * Public URLs follow the pattern:
 *   {SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{path}
 *
 * Returns the `{path}` portion, which is what the storage API needs
 * for operations like deletion.
 */
function deriveStoragePath(publicUrl: string): string {
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) {
    return publicUrl;
  }

  return publicUrl.slice(index + marker.length);
}

export function ScreenshotUpload({
  onUrlsChange,
  maxFiles = 5,
  initialScreenshots = [],
}: ScreenshotUploadProps) {
  const supabase = createClient();
  const [screenshots, setScreenshots] = useState<UploadedScreenshot[]>(() =>
    initialScreenshots.map((url) => ({
      url,
      path: deriveStoragePath(url),
    }))
  );
  const [uploading, setUploading] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep a stable ref to onUrlsChange so the sync effect below only fires
  // when `screenshots` actually changes — not on every parent re-render
  // (react-hook-form's field.onChange is not referentially stable).
  const onUrlsChangeRef = useRef(onUrlsChange);
  useEffect(() => {
    onUrlsChangeRef.current = onUrlsChange;
  }, [onUrlsChange]);

  const remainingSlots = maxFiles - screenshots.length - uploading.length;

  // Sync parent whenever screenshots change — avoids stale-closure issues
  // in async callbacks that would otherwise read an outdated `screenshots`.
  useEffect(() => {
    onUrlsChangeRef.current(screenshots.map((s) => s.url));
  }, [screenshots]);

  // -------------------------------------------------------------------------
  // Upload a single file: get signed URL -> upload to storage -> get public URL
  // -------------------------------------------------------------------------

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedScreenshot> => {
      // 1. Request a signed upload URL from our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? 'Failed to get upload URL');
      }

      const { token, path } = (await response.json()) as UploadApiResponse;

      // 2. Upload the file to Supabase Storage using the signed URL
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .uploadToSignedUrl(path, token, file, {
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // 3. Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

      return { url: publicUrl, path };
    },
    [supabase]
  );

  // -------------------------------------------------------------------------
  // Handle file selection from the input
  // -------------------------------------------------------------------------

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }

      setError(null);

      // Guard: no slots available
      if (remainingSlots <= 0) {
        setError('Maximum screenshots reached');
        return;
      }

      // Validate total count
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        setError(
          `You can only add ${remainingSlots} more screenshot${remainingSlots === 1 ? '' : 's'}`
        );
      }

      // Validate each file before uploading
      const validFiles: File[] = [];
      const validationErrors: string[] = [];
      for (const file of filesToProcess) {
        if (!ACCEPTED_MIME_TYPES.includes(file.type as MimeType)) {
          validationErrors.push(
            'Only PNG, JPEG, GIF, and WebP images are allowed'
          );
          continue;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          validationErrors.push(
            `"${file.name}" exceeds 5 MB. Please choose a smaller file.`
          );
          continue;
        }
        validFiles.push(file);
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
      }

      if (validFiles.length === 0) {
        // Reset input so the same file can be re-selected
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Create loading entries for each file
      const uploadingIds = validFiles.map(() => crypto.randomUUID());
      setUploading((prev) => [...prev, ...uploadingIds]);

      // Upload all valid files concurrently
      const results = await Promise.allSettled(
        validFiles.map((file) => uploadFile(file))
      );

      const newScreenshots: UploadedScreenshot[] = [];
      const errors: string[] = [];

      for (const result of results) {
        if (result.status === 'fulfilled') {
          newScreenshots.push(result.value);
        } else {
          errors.push(
            result.reason instanceof Error
              ? result.reason.message
              : 'Upload failed'
          );
        }
      }

      // Update state
      setUploading((prev) => prev.filter((id) => !uploadingIds.includes(id)));

      if (errors.length > 0) {
        setError(errors.join('. '));
      }

      if (newScreenshots.length > 0) {
        setScreenshots((prev) => [...prev, ...newScreenshots]);
      }

      // Reset input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [remainingSlots, uploadFile]
  );

  // -------------------------------------------------------------------------
  // Remove a screenshot
  // -------------------------------------------------------------------------

  const removeScreenshot = useCallback(
    async (path: string) => {
      // Delete the file from Supabase Storage to avoid orphaned files
      const { error: removeError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (removeError) {
        setError(`Failed to delete screenshot: ${removeError.message}`);
        return;
      }

      setScreenshots((prev) => prev.filter((s) => s.path !== path));
    },
    [supabase]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const isAtLimit = screenshots.length >= maxFiles;
  const isUploading = uploading.length > 0;

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {(screenshots.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.path}
              className="group relative aspect-video overflow-hidden rounded-md border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element --
                  User-uploaded images with dynamic URLs; next/image requires
                  remote domain configuration that varies per environment. */}
              <img
                src={screenshot.url}
                alt="Build screenshot"
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeScreenshot(screenshot.path)}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                aria-label="Remove screenshot"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          ))}

          {/* Loading placeholders for in-progress uploads */}
          {uploading.map((id) => (
            <div
              key={id}
              className="flex aspect-video items-center justify-center rounded-md border bg-muted"
            >
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          multiple
          onChange={handleFileChange}
          className="hidden"
          aria-label="Select screenshots to upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isAtLimit || isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ImagePlusIcon />
          )}
          {isUploading
            ? `Uploading (${uploading.length})...`
            : isAtLimit
              ? `${maxFiles} screenshots added`
              : 'Add screenshots'}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG, JPEG, GIF, or WebP. Max 5 MB each. Up to {maxFiles} screenshots.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
