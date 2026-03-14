import Image from 'next/image';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BUILD_TYPE_LABELS } from '@/lib/constants/builds';
import { buildRoute } from '@/lib/constants/routes';
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
      ? [...screenshots].sort((a, b) => a.display_order - b.display_order)[0]
      : null;

  const visibleTools = aiTools.slice(0, MAX_VISIBLE_AI_TOOLS);
  const overflowCount = aiTools.length - MAX_VISIBLE_AI_TOOLS;

  return (
    <Link href={buildRoute(build.id)} className="group block">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {thumbnail ? (
            <Image
              src={thumbnail.url}
              alt={`Screenshot of ${build.title}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No preview
            </div>
          )}
        </div>

        {/* Title + Build Type */}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">
              {build.title}
            </CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {BUILD_TYPE_LABELS[build.build_type]}
            </Badge>
          </div>
        </CardHeader>

        {/* Description */}
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {build.description}
          </p>

          {/* AI Tool Badges */}
          {aiTools.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {visibleTools.map((tool) => (
                <Badge key={tool.id} variant="outline">
                  {tool.name}
                </Badge>
              ))}
              {overflowCount > 0 && (
                <Badge variant="outline">+{overflowCount}</Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* Builder avatar + name */}
        <CardFooter className="mt-auto">
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
              <span className="text-sm text-muted-foreground">
                {profile.display_name ?? 'Anonymous'}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Anonymous</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
