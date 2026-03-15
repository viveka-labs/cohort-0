import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ---------------------------------------------------------------------------
// BuildCardSkeleton
// ---------------------------------------------------------------------------

/**
 * A loading placeholder that mirrors the exact layout of BuildCard.
 *
 * Used in feed grids to prevent layout shift while builds are loading.
 * Each skeleton element matches the dimensions of its BuildCard counterpart.
 */
export function BuildCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      {/* Thumbnail — matches aspect-video container */}
      <Skeleton className="aspect-video w-full rounded-none" />

      {/* Title + Build Type badge */}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
        </div>
      </CardHeader>

      {/* Description — two lines */}
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>

        {/* AI Tool badges — 3 placeholder badges */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-18 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </CardContent>

      {/* Builder avatar + name */}
      <CardFooter className="mt-auto">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </CardFooter>
    </Card>
  );
}
