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
};

// ---------------------------------------------------------------------------
// BuildFeed
// ---------------------------------------------------------------------------

/**
 * Renders a responsive grid of build cards, or an empty state when
 * there are no builds to display.
 *
 * Grid layout: 1 column on mobile, 2 columns at `sm`, 3 columns at `lg`.
 */
export function BuildFeed({ builds }: BuildFeedProps) {
  if (builds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-muted-foreground">
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
