import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { CheckerboardPlaceholder } from '@/components/ui/checkerboard-placeholder';
import { UpvoteIcon } from '@/components/ui/icons';
import { AiToolChip } from '@/components/ui/tool-chip';
import {
  BUILD_TYPE_BADGE_CLASSES,
  BUILD_TYPE_LABELS,
} from '@/lib/constants/builds';
import { buildRoute } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { BuildWithDetails } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ProfileBuildListProps = {
  builds: BuildWithDetails[];
  displayName: string;
};

// ---------------------------------------------------------------------------
// ProfileBuildList
// ---------------------------------------------------------------------------

/**
 * Renders a list of builds for a user's profile page. Shows a heading with
 * the builder's name and a count badge, followed by horizontal row items
 * for each build, or an empty state when the user has no builds.
 */
export function ProfileBuildList({
  builds,
  displayName,
}: ProfileBuildListProps) {
  return (
    <section>
      {/* Heading with count badge */}
      <div className="flex items-center gap-2">
        <h2 className="font-display text-xl tracking-tight">
          Builds by {displayName}
        </h2>
        <Badge variant="secondary">{builds.length}</Badge>
      </div>

      {/* Build list or empty state */}
      {builds.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No builds yet.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {builds.map((build) => (
            <ProfileBuildItem key={build.id} build={build} />
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// ProfileBuildItem (internal)
// ---------------------------------------------------------------------------

function ProfileBuildItem({ build }: { build: BuildWithDetails }) {
  const { screenshots, ai_tools: aiTools } = build;

  const thumbnail =
    screenshots.length > 0
      ? screenshots.reduce((lowest, s) =>
          s.display_order < lowest.display_order ? s : lowest
        )
      : null;

  return (
    <Link href={buildRoute(build.id)} className="block">
      <div className="flex items-center gap-5 rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-zinc-300 hover:shadow-sm">
        {/* Thumbnail */}
        <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {thumbnail ? (
            <Image
              src={thumbnail.url}
              alt={`Screenshot of ${build.title}`}
              width={80}
              height={80}
              className="size-full object-cover"
            />
          ) : (
            <CheckerboardPlaceholder showIcon={false} />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Badge
              className={cn(
                'font-mono text-xs',
                BUILD_TYPE_BADGE_CLASSES[build.build_type] ?? ''
              )}
            >
              {BUILD_TYPE_LABELS[build.build_type]}
            </Badge>
            {aiTools.slice(0, 3).map((tool) => (
              <AiToolChip
                key={tool.id}
                name={tool.name}
                slug={tool.slug}
                size="sm"
              />
            ))}
            {aiTools.length > 3 && (
              <Badge variant="outline" className="font-mono text-xs">
                +{aiTools.length - 3}
              </Badge>
            )}
          </div>
          <h4 className="truncate font-display text-base text-foreground">
            {build.title}
          </h4>
          {build.description && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {build.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <UpvoteIcon size={12} />
            {build.upvote_count}
          </span>
        </div>
      </div>
    </Link>
  );
}
