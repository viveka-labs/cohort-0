'use client';

import { CameraIcon, Loader2Icon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

import { MimeType } from '@/lib/constants/mime-types';
import { AVATAR_BUCKET_NAME } from '@/lib/constants/storage';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_MIME_TYPES = Object.values(MimeType);
const ACCEPT_STRING = ACCEPTED_MIME_TYPES.join(',');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UploadApiResponse = {
  token: string;
  path: string;
};

type AvatarUploadProps = {
  /** Current avatar URL, or null if no avatar is set. */
  value: string | null;
  /** Called with the new public URL after upload, or null to clear. */
  onChange: (url: string | null) => void;
};

// ---------------------------------------------------------------------------
// AvatarUpload
// ---------------------------------------------------------------------------

export function AvatarUpload({ value, onChange }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // Upload a single file: get signed URL -> upload to storage -> get public URL
  // -------------------------------------------------------------------------

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const supabase = createClient();

    // 1. Request a signed upload URL from our API
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: file.type,
        bucket: AVATAR_BUCKET_NAME,
      }),
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
      .from(AVATAR_BUCKET_NAME)
      .uploadToSignedUrl(path, token, file, {
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // 3. Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET_NAME).getPublicUrl(path);

    return publicUrl;
  }, []);

  // -------------------------------------------------------------------------
  // Handle file selection from the input
  // -------------------------------------------------------------------------

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);

    // Validate MIME type
    if (!ACCEPTED_MIME_TYPES.includes(file.type as MimeType)) {
      setError('Only PNG, JPEG, GIF, and WebP images are allowed');
      resetInput();
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Image must be under 2 MB');
      resetInput();
      return;
    }

    setUploading(true);

    try {
      const publicUrl = await uploadFile(file);
      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
      resetInput();
    }
  }

  function resetInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Circular avatar preview with upload overlay */}
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="group relative size-24 overflow-hidden rounded-full border-2 border-muted bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Upload avatar"
      >
        {/* Current avatar or placeholder */}
        {value ? (
          <Image
            src={value}
            alt="Avatar preview"
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <UserIcon className="size-10 text-muted-foreground" />
          </div>
        )}

        {/* Hover/uploading overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-disabled:opacity-100">
          {uploading ? (
            <Loader2Icon className="size-6 animate-spin text-white" />
          ) : (
            <CameraIcon className="size-6 text-white" />
          )}
        </div>
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Select avatar image"
      />

      <p className="text-xs text-muted-foreground">
        Click to upload. Max 2 MB.
      </p>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
