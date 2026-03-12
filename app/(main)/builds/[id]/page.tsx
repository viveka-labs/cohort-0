import { ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getUser } from '@/lib/auth';
import { BUILD_TYPE_LABELS } from '@/lib/constants/builds';
import { profileRoute } from '@/lib/constants/routes';
import { getBuildById } from '@/lib/queries/builds';

type BuildDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BuildDetailPage({
  params,
}: BuildDetailPageProps) {
  const { id } = await params;
  const [{ data: build }, user] = await Promise.all([
    getBuildById(id),
    getUser(),
  ]);

  if (!build) {
    notFound();
  }

  const isOwner = user?.id === build.user_id;
  const profile = build.profile;

  const sortedScreenshots = [...build.screenshots].sort(
    (a, b) => a.display_order - b.display_order
  );

  const formattedDate = new Date(build.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header: title + build type badge */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{build.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {BUILD_TYPE_LABELS[build.build_type]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* TODO: BuildOwnerActions — Task 4 */}
        {isOwner && <div />}
      </div>

      {/* Builder info */}
      {profile && (
        <Link
          href={profileRoute(profile.id)}
          className="mt-6 flex items-center gap-3"
        >
          <Avatar size="lg">
            {profile.avatar_url && (
              <AvatarImage
                src={profile.avatar_url}
                alt={profile.display_name ?? 'Builder'}
              />
            )}
            <AvatarFallback>
              {(profile.display_name ?? 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hover:underline">
            {profile.display_name ?? 'Anonymous'}
          </span>
        </Link>
      )}

      {/* Description */}
      <p className="mt-6 whitespace-pre-wrap text-muted-foreground leading-relaxed">
        {build.description}
      </p>

      {/* Screenshots */}
      {/* TODO: ScreenshotGallery — Task 3 */}
      {sortedScreenshots.length > 0 && (
        <div
          className="mt-8"
          data-screenshots={JSON.stringify(sortedScreenshots)}
        />
      )}

      {/* AI tools */}
      {build.ai_tools.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            AI Tools
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {build.ai_tools.map((tool) => (
              <Badge key={tool.id} variant="outline">
                {tool.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tech stack tags */}
      {build.tech_stack_tags.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Tech Stack
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {build.tech_stack_tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {(build.live_url || build.repo_url) && (
        <div className="mt-8 flex flex-wrap gap-4">
          {build.live_url && (
            <a
              href={build.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLinkIcon className="size-4" />
              Live Demo
            </a>
          )}
          {build.repo_url && (
            <a
              href={build.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLinkIcon className="size-4" />
              Source Code
            </a>
          )}
        </div>
      )}
    </div>
  );
}
