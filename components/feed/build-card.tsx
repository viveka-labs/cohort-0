import Image from 'next/image';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckerboardPlaceholder } from '@/components/ui/checkerboard-placeholder';
import { AiToolChip } from '@/components/ui/tool-chip';
import {
  BUILD_TYPE_BADGE_CLASSES,
  BUILD_TYPE_LABELS,
} from '@/lib/constants/builds';
import { buildRoute } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { BuildWithDetails } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of AI tool badges shown before collapsing into "+N". */
const MAX_VISIBLE_AI_TOOLS = 3;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type BuildCardProps = {
  build: BuildWithDetails;
};

// ---------------------------------------------------------------------------
// BuildCard
// ---------------------------------------------------------------------------

export function BuildCard({ build }: BuildCardProps) {
  const { profile, screenshots, ai_tools: aiTools } = build;

  const thumbnail =
    screenshots.length > 0
      ? screenshots.reduce((lowest, s) =>
          s.display_order < lowest.display_order ? s : lowest
        )
      : null;

  const visibleTools = aiTools.slice(0, MAX_VISIBLE_AI_TOOLS);
  const overflowCount = aiTools.length - MAX_VISIBLE_AI_TOOLS;

  return (
    <Link href={buildRoute(build.id)} className="group block">
      <article className="h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-150 hover:shadow-sm hover:border-zinc-300">
        {/* Thumbnail */}
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          {thumbnail ? (
            <Image
              src={thumbnail.url}
              alt={`Screenshot of ${build.title}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <CheckerboardPlaceholder />
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Badge row: build type + AI tools inline */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <Badge
              className={cn(
                'font-mono text-xs',
                BUILD_TYPE_BADGE_CLASSES[build.build_type] ?? ''
              )}
            >
              {BUILD_TYPE_LABELS[build.build_type]}
            </Badge>
            {visibleTools.map((tool) => (
              <AiToolChip
                key={tool.id}
                name={tool.name}
                slug={tool.slug}
                size="sm"
              />
            ))}
            {overflowCount > 0 && (
              <Badge variant="outline" className="font-mono text-xs">
                +{overflowCount}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display text-lg text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-foreground/80">
            {build.title}
          </h3>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {build.description}
          </p>

          {/* Footer: avatar + name */}
          <div className="flex items-center justify-between">
            {profile ? (
              <div className="flex items-center gap-2">
                <Avatar size="sm">
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
                <span className="text-xs font-medium text-muted-foreground">
                  {profile.display_name ?? 'Anonymous'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Anonymous</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
