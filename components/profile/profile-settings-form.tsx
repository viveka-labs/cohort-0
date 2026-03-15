'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { updateProfileAction } from '@/app/actions/profile';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type ProfileFormData,
  profileFormSchema,
} from '@/lib/validations/profile';
import type { Profile } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ProfileSettingsFormProps = {
  /** Current profile data used to pre-populate the form. */
  initialData: Profile;
};

// ---------------------------------------------------------------------------
// ProfileSettingsForm
// ---------------------------------------------------------------------------

export function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  // Avatar URL is managed outside the Zod schema (same pattern as
  // screenshots in BuildForm). It's passed as a separate FormData field.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialData.avatar_url
  );

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: initialData.display_name ?? '',
      bio: initialData.bio ?? '',
      github_url: initialData.github_url ?? '',
      twitter_url: initialData.twitter_url ?? '',
      linkedin_url: initialData.linkedin_url ?? '',
      website_url: initialData.website_url ?? '',
    },
  });

  function onSubmit(data: ProfileFormData) {
    startTransition(async () => {
      const formData = new FormData();

      formData.append('display_name', data.display_name ?? '');
      formData.append('bio', data.bio ?? '');
      formData.append('github_url', data.github_url ?? '');
      formData.append('twitter_url', data.twitter_url ?? '');
      formData.append('linkedin_url', data.linkedin_url ?? '');
      formData.append('website_url', data.website_url ?? '');

      if (avatarUrl) {
        formData.append('avatar_url', avatarUrl);
      }

      const result = await updateProfileAction(formData);

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      toast.success('Profile updated!');
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <div>
          <AvatarUpload value={avatarUrl} onChange={setAvatarUrl} />
        </div>

        {/* Display Name */}
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short bio about yourself..."
                  className="min-h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* GitHub URL */}
        <FormField
          control={form.control}
          name="github_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                GitHub URL{' '}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://github.com/username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Twitter URL */}
        <FormField
          control={form.control}
          name="twitter_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Twitter URL{' '}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://twitter.com/username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LinkedIn URL */}
        <FormField
          control={form.control}
          name="linkedin_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                LinkedIn URL{' '}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website URL */}
        <FormField
          control={form.control}
          name="website_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Website URL{' '}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2Icon className="animate-spin" />}
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
