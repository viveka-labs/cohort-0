import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Routes } from '@/lib/constants/routes';
import type { BuildWithDetails } from '@/types';

import { BuildCard } from './build-card';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type BuildFeedProps = {
  builds: BuildWithDetails[];
  /** Whether the feed is being filtered. Affects the empty state message. */
  hasActiveFilters?: boolean;
};

// ---------------------------------------------------------------------------
// BuildFeed
// ---------------------------------------------------------------------------

/**
 * Renders a responsive grid of build cards, or an empty state when
 * there are no builds to display.
 *
 * Grid layout: 1 column on mobile, 2 columns at `sm`, 3 columns at `lg`.
 *
 * When `hasActiveFilters` is true and there are no results, it shows a
 * "No builds match your filters" message with a link to clear filters.
 */
export function BuildFeed({
  builds,
  hasActiveFilters = false,
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {builds.map((build) => (
        <BuildCard key={build.id} build={build} />
      ))}
    </div>
  );
}
