'use server';

import { requireUser } from '@/lib/auth';
import { AVATAR_BUCKET_NAME } from '@/lib/constants/storage';
import { clientEnv } from '@/lib/env.client';
import { getProfileById, updateProfile } from '@/lib/queries/profiles';
import { createClient } from '@/lib/supabase/server';
import { profileFormSchema } from '@/lib/validations/profile';

/**
 * Builds the expected URL prefix for avatars uploaded by a given user.
 * Any avatar_url that starts with this prefix was uploaded by us (not
 * an OAuth provider like Google or GitHub).
 */
function avatarStoragePrefix(userId: string): string {
  return `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET_NAME}/${userId}/`;
}

/**
 * Extracts the storage path from a full avatar URL.
 * Returns null if the URL does not belong to our avatars bucket.
 */
function extractAvatarStoragePath(url: string, userId: string): string | null {
  const prefix = avatarStoragePrefix(userId);

  if (!url.startsWith(prefix)) {
    return null;
  }

  return url.slice(prefix.length);
}

/**
 * Server action that updates the authenticated user's profile.
 *
 * Steps:
 * 1. Authenticate the user (redirects to login if not signed in)
 * 2. Validate form data against the Zod schema
 * 3. If an avatar_url is provided, validate it belongs to this user
 * 4. If the profile has an existing avatar from our storage, delete it
 * 5. Call updateProfile with the validated data
 *
 * Returns `{ error: string }` on failure or `{ success: true }` on success.
 */
export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();

  // Parse form fields into a plain object for Zod validation
  const rawData = {
    display_name: formData.get('display_name') ?? '',
    bio: formData.get('bio') ?? '',
    github_url: formData.get('github_url') ?? '',
    twitter_url: formData.get('twitter_url') ?? '',
    linkedin_url: formData.get('linkedin_url') ?? '',
    website_url: formData.get('website_url') ?? '',
  };

  const result = profileFormSchema.safeParse(rawData);

  if (!result.success) {
    return { error: 'Invalid form data' };
  }

  // avatar_url is handled outside the Zod schema (like screenshots in
  // the build form). It's passed as a separate FormData field.
  const avatarUrl = formData.get('avatar_url');
  const avatarUrlString =
    typeof avatarUrl === 'string' && avatarUrl.length > 0 ? avatarUrl : null;

  // Validate that the avatar URL belongs to the authenticated user's
  // storage folder. This prevents injection of arbitrary external URLs.
  if (avatarUrlString) {
    const allowedPrefix = avatarStoragePrefix(user.id);

    if (!avatarUrlString.startsWith(allowedPrefix)) {
      return { error: 'Invalid avatar URL' };
    }
  }

  // Convert empty strings to null for clean database storage
  const profileData = {
    display_name: result.data.display_name || null,
    bio: result.data.bio || null,
    github_url: result.data.github_url || null,
    twitter_url: result.data.twitter_url || null,
    linkedin_url: result.data.linkedin_url || null,
    website_url: result.data.website_url || null,
    avatar_url: avatarUrlString,
  };

  try {
    // Fetch the current profile to check for an existing avatar that
    // needs cleanup from storage.
    const { data: currentProfile } = await getProfileById(user.id);

    if (!currentProfile) {
      return { error: 'Profile not found' };
    }

    // Delete the old avatar from storage if:
    // 1. There is an existing avatar_url on the profile
    // 2. It came from our avatars bucket (not an OAuth provider avatar)
    // 3. It's different from the new avatar_url (user changed their avatar)
    const oldAvatarUrl = currentProfile.avatar_url;

    if (oldAvatarUrl && oldAvatarUrl !== avatarUrlString) {
      const storagePath = extractAvatarStoragePath(oldAvatarUrl, user.id);

      if (storagePath) {
        const supabase = await createClient();
        const { error: storageError } = await supabase.storage
          .from(AVATAR_BUCKET_NAME)
          .remove([storagePath]);

        if (storageError) {
          // Best-effort cleanup — log but don't fail the action since
          // the profile update hasn't happened yet and we still want
          // to proceed with saving the new data.
          console.error(
            'Failed to delete old avatar from storage:',
            storageError
          );
        }
      }
    }

    const { error } = await updateProfile(user.id, profileData);

    if (error) {
      return { error: error.message ?? 'Failed to update profile' };
    }

    return { success: true as const };
  } catch (error) {
    console.error('updateProfileAction failed:', error);
    return { error: 'An unexpected error occurred' };
  }
}
