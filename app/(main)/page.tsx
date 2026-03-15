import { Suspense } from 'react';

import { BuildCardSkeleton } from '@/components/feed/build-card-skeleton';
import { BuildFeed } from '@/components/feed/build-feed';
import { getBuilds } from '@/lib/queries/builds';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of skeleton cards shown while the feed is loading. */
const SKELETON_COUNT = 6;

// ---------------------------------------------------------------------------
// Feed (async, Suspense-ready)
// ---------------------------------------------------------------------------

/**
 * Async server component that fetches and renders the build feed.
 * Wrapped in a Suspense boundary by the parent page so Next.js can
 * stream the skeleton fallback while data loads.
 */
async function Feed() {
  const { data: builds, error } = await getBuilds();

  if (error) {
    throw error;
  }

  return <BuildFeed builds={builds} />;
}

// ---------------------------------------------------------------------------
// FeedSkeleton
// ---------------------------------------------------------------------------

function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <BuildCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HomePage
// ---------------------------------------------------------------------------

/**
 * Public home page that displays the build feed.
 *
 * Auth note: This page is accessible to both authenticated and anonymous
 * users. The `builds` table has a public SELECT RLS policy, so the feed
 * query works without authentication. The `(main)` layout provides shared
 * navigation but does not enforce auth.
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Builds</h1>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />
      </Suspense>
    </div>
  );
}
