import { ImagePlusIcon, Loader2Icon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { MimeType } from '@/lib/constants/mime-types';
import { BUCKET_NAME } from '@/lib/constants/storage';
import { createClient } from '@/lib/supabase/client';
import type { BuildFormInput, ScreenshotEntry } from '@/lib/validations/build';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIME_TYPES = Object.values(MimeType);
const ACCEPT_STRING = ACCEPTED_MIME_TYPES.join(',');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UploadApiResponse = {
  token: string;
  path: string;
};

// ---------------------------------------------------------------------------
// Helpers
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
export function deriveStoragePath(publicUrl: string): string {
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) {
    return publicUrl;
  }

  return publicUrl.slice(index + marker.length);
}

// ---------------------------------------------------------------------------
// ScreenshotUpload
// ---------------------------------------------------------------------------

export function ScreenshotUpload({ maxFiles = 5 }: { maxFiles?: number }) {
  const { control, getValues, setValue } = useFormContext<BuildFormInput>();

  // Single source of truth — no parallel useState needed.
  const { field } = useController({
    name: 'screenshot_urls',
    control,
  });

  // Transient UI state — not part of the form data
  const [uploading, setUploading] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track the initial set of screenshot URLs at mount time so we can
  // distinguish pre-existing screenshots from newly uploaded ones.
  const initialUrlsRef = useRef(
    new Set(field.value.map((s: ScreenshotEntry) => s.url))
  );

  const screenshots = field.value;
  const remainingSlots = maxFiles - screenshots.length - uploading.length;

  // -------------------------------------------------------------------------
  // Upload a single file: get signed URL -> upload to storage -> get public URL
  // -------------------------------------------------------------------------

  const uploadFile = useCallback(
    async (file: File): Promise<ScreenshotEntry> => {
      const supabase = createClient();

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
    []
  );

  // -------------------------------------------------------------------------
  // Handle file selection from the input
  // -------------------------------------------------------------------------

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
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

    const newScreenshots: ScreenshotEntry[] = [];
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
      // Pure update — no side effect inside a state updater.
      // field.value is read from a ref, so it's always current.
      field.onChange([...field.value, ...newScreenshots]);
    }

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // -------------------------------------------------------------------------
  // Remove a screenshot
  // -------------------------------------------------------------------------

  async function removeScreenshot(path: string, url: string) {
    const isPreExisting = initialUrlsRef.current.has(url);

    if (isPreExisting) {
      // Pre-existing screenshot: do NOT delete from storage now.
      // Track the URL so the server action can delete after DB update.
      const currentRemoved = getValues('removed_screenshot_urls') ?? [];
      setValue('removed_screenshot_urls', [...currentRemoved, url]);
    } else {
      // Newly uploaded screenshot: safe to delete immediately since it
      // was uploaded during this form session and has no DB reference.
      const supabase = createClient();
      const { error: removeError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (removeError) {
        setError(`Failed to delete screenshot: ${removeError.message}`);
        return;
      }
    }

    // Read field.value directly — it's backed by a ref, always fresh even
    // after the await above (fixes the stale-closure bug).
    field.onChange(field.value.filter((s: ScreenshotEntry) => s.path !== path));
  }

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
          {screenshots.map((screenshot: ScreenshotEntry) => (
            <div
              key={screenshot.path}
              className="group relative aspect-video overflow-hidden rounded-md border bg-muted"
            >
              <Image
                src={screenshot.url}
                alt="Build screenshot"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  removeScreenshot(screenshot.path, screenshot.url)
                }
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
