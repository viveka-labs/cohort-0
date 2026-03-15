import { notFound } from 'next/navigation';

import { ProfileSettingsForm } from '@/components/profile/profile-settings-form';
import { requireUser } from '@/lib/auth';
import { getProfileById } from '@/lib/queries/profiles';

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  const { data: profile } = await getProfileById(user.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Profile Settings
      </h1>
      <ProfileSettingsForm initialData={profile} />
    </div>
  );
}
