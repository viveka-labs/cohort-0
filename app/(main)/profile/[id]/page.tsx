import { notFound } from 'next/navigation';

import { ProfileBuildList } from '@/components/profile/profile-build-list';
import { ProfileHeader } from '@/components/profile/profile-header';
import { getBuildsForUser } from '@/lib/queries/builds';
import { getProfileById } from '@/lib/queries/profiles';
import { isUuid } from '@/lib/utils';

type PublicProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const [{ data: profile }, { data: builds, error: buildsError }] =
    await Promise.all([getProfileById(id), getBuildsForUser(id)]);

  if (!profile) {
    notFound();
  }

  if (buildsError) {
    throw buildsError;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="space-y-10">
        <ProfileHeader profile={profile} />
        <ProfileBuildList builds={builds ?? []} />
      </div>
    </main>
  );
}
