import { ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BuildOwnerActions } from '@/components/builds/build-owner-actions';
import { ScreenshotGallery } from '@/components/builds/screenshot-gallery';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getUser } from '@/lib/auth';
import { BUILD_TYPE_LABELS } from '@/lib/constants/builds';
import { profileRoute } from '@/lib/constants/routes';
import { getBuildById } from '@/lib/queries/builds';
import { cn, isUuid } from '@/lib/utils';

const BUILD_TYPE_BADGE_CLASSES: Record<string, string> = {
  app: 'bg-sky-50 text-sky-700 border border-sky-100',
  feature: 'bg-violet-50 text-violet-700 border border-violet-100',
  fix: 'bg-rose-50 text-rose-700 border border-rose-100',
  automation: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  experiment: 'bg-amber-50 text-amber-700 border border-amber-100',
};

type BuildDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BuildDetailPage({
  params,
}: BuildDetailPageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* -- Main Content -- */}
        <div className="lg:col-span-2">
          {/* Build type badge + date + owner actions */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Badge
                className={cn(
                  'font-mono text-xs',
                  BUILD_TYPE_BADGE_CLASSES[build.build_type] ?? ''
                )}
              >
                {BUILD_TYPE_LABELS[build.build_type]}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {formattedDate}
              </span>
            </div>
            {isOwner && <BuildOwnerActions buildId={build.id} />}
          </div>

          {/* Title */}
          <h1 className="mb-6 font-display text-4xl leading-tight text-foreground">
            {build.title}
          </h1>

          {/* Builder info */}
          {profile && (
            <Link
              href={profileRoute(profile.id)}
              className="group mb-8 flex items-center gap-3"
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
              <div>
                <span className="text-sm font-semibold text-foreground group-hover:underline">
                  {profile.display_name ?? 'Anonymous'}
                </span>
              </div>
            </Link>
          )}

          {/* Description */}
          <p className="mb-8 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/80">
            {build.description}
          </p>

          {/* Screenshots */}
          {sortedScreenshots.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 font-display text-lg text-foreground">
                Screenshots
              </h2>
              <ScreenshotGallery screenshots={sortedScreenshots} />
            </div>
          )}

          {/* Links */}
          {(build.live_url || build.repo_url) && (
            <div className="mb-8 flex flex-wrap gap-3">
              {build.repo_url && (
                <a
                  href={build.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
                >
                  <ExternalLinkIcon className="size-4" />
                  View Repo
                </a>
              )}
              {build.live_url && (
                <a
                  href={build.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-zinc-300 hover:bg-muted"
                >
                  <ExternalLinkIcon className="size-4" />
                  Live Demo
                </a>
              )}
            </div>
          )}
        </div>

        {/* -- Sidebar -- */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* AI Tools card */}
          {build.ai_tools.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h4 className="mb-3 font-display text-sm text-foreground">
                AI Tools Used
              </h4>
              <div className="flex flex-wrap gap-2">
                {build.ai_tools.map((tool) => (
                  <span
                    key={tool.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
                  >
                    <span className="size-2 rounded-full bg-amber-500" />
                    {tool.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack card */}
          {build.tech_stack_tags.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h4 className="mb-3 font-display text-sm text-foreground">
                Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {build.tech_stack_tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Build Info card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h4 className="mb-3 font-display text-sm text-foreground">
              Build Info
            </h4>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd>
                  <Badge
                    className={cn(
                      'font-mono text-xs',
                      BUILD_TYPE_BADGE_CLASSES[build.build_type] ?? ''
                    )}
                  >
                    {BUILD_TYPE_LABELS[build.build_type]}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Posted</dt>
                <dd className="font-medium text-foreground">{formattedDate}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
