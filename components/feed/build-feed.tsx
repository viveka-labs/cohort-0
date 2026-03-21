import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Routes } from '@/lib/constants/routes';
import type { BuildWithDetails } from '@/types';

import { BuildCard } from './build-card';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  prevHref: string | null;
  nextHref: string | null;
};

type BuildFeedProps = {
  builds: BuildWithDetails[];
  /** Whether the feed is being filtered. Affects the empty state message. */
  hasActiveFilters?: boolean;
  pagination?: Pagination;
};

// ---------------------------------------------------------------------------
// BuildFeed
// ---------------------------------------------------------------------------

export function BuildFeed({
  builds,
  hasActiveFilters = false,
  pagination,
}: BuildFeedProps) {
  if (builds.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
          <p className="text-muted-foreground">No builds match your filters.</p>
          <Button asChild variant="outline">
            <Link href={Routes.HOME}>Clear filters</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <p className="font-display text-xl text-muted-foreground">
          No builds yet. Be the first to share what you&apos;ve built!
        </p>
        <Button asChild>
          <Link href={Routes.BUILD_NEW}>Create a Build</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {builds.map((build) => (
          <BuildCard key={build.id} build={build} />
        ))}
      </div>

      {pagination && (
        <div className="flex items-center justify-between border-t border-border pt-6">
          <Button asChild variant="outline" disabled={!pagination.prevHref}>
            {pagination.prevHref ? (
              <Link href={pagination.prevHref}>← Previous</Link>
            ) : (
              <span>← Previous</span>
            )}
          </Button>

          <p className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
            <span className="mx-2 text-border">·</span>
            {pagination.totalCount} build
            {pagination.totalCount !== 1 ? 's' : ''}
          </p>

          <Button asChild variant="outline" disabled={!pagination.nextHref}>
            {pagination.nextHref ? (
              <Link href={pagination.nextHref}>Next →</Link>
            ) : (
              <span>Next →</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
