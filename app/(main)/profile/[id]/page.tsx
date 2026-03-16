import { notFound } from 'next/navigation';

import { ProfileBuildList } from '@/components/profile/profile-build-list';
import { ProfileHeader } from '@/components/profile/profile-header';
import { getUser } from '@/lib/auth';
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

  const [user, { data: profile }, { data: builds, error: buildsError }] =
    await Promise.all([getUser(), getProfileById(id), getBuildsForUser(id)]);

  if (!profile) {
    notFound();
  }

  if (buildsError) {
    throw buildsError;
  }

  const isOwner = user?.id === profile.id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="space-y-10">
        <ProfileHeader profile={profile} isOwner={isOwner} />
        <ProfileBuildList builds={builds ?? []} />
      </div>
    </div>
  );
}
