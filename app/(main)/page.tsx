import { Suspense } from 'react';

import { BuildCardSkeleton } from '@/components/feed/build-card-skeleton';
import { BuildFeed } from '@/components/feed/build-feed';
import { FeedFilters } from '@/components/feed/feed-filters';
import { BUILD_TYPE_LABELS } from '@/lib/constants/builds';
import { getAiTools } from '@/lib/queries/ai-tools';
import { getBuilds } from '@/lib/queries/builds';
import type { BuildType, FeedFilters as FeedFiltersType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of skeleton cards shown while the feed is loading. */
const SKELETON_COUNT = 6;

/** URL search param key for build type filters. */
const BUILD_TYPE_PARAM = 'buildType';

/** URL search param key for AI tool filters. */
const AI_TOOL_PARAM = 'aiTool';

/** Set of valid build type values for validation. */
const VALID_BUILD_TYPES = new Set<string>(Object.keys(BUILD_TYPE_LABELS));

// ---------------------------------------------------------------------------
// Search param parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parses a comma-separated `buildType` param into valid BuildType values.
 * Invalid values are silently dropped.
 */
function parseBuildTypes(raw: string | undefined): BuildType[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .filter((value): value is BuildType => VALID_BUILD_TYPES.has(value));
}

/**
 * Parses a comma-separated `aiTool` param into an array of IDs.
 * Returns the raw split — server-side validation happens in the query
 * (non-matching IDs simply return no results).
 */
function parseAiToolIds(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw.split(',').filter(Boolean);
}

// ---------------------------------------------------------------------------
// Feed (async, Suspense-ready)
// ---------------------------------------------------------------------------

/**
 * Async server component that fetches and renders the build feed.
 * Wrapped in a Suspense boundary by the parent page so Next.js can
 * stream the skeleton fallback while data loads.
 *
 * Accepts optional filters that are forwarded to `getBuilds()`.
 */
async function Feed({ filters }: { filters?: FeedFiltersType }) {
  const hasActiveFilters =
    (filters?.buildTypes?.length ?? 0) > 0 ||
    (filters?.aiToolIds?.length ?? 0) > 0;

  const { data: builds, error } = await getBuilds(filters);

  if (error) {
    throw error;
  }

  return <BuildFeed builds={builds} hasActiveFilters={hasActiveFilters} />;
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
 * Public home page that displays the build feed with filter controls.
 *
 * Auth note: This page is accessible to both authenticated and anonymous
 * users. The `builds` table has a public SELECT RLS policy, so the feed
 * query works without authentication. The `(main)` layout provides shared
 * navigation but does not enforce auth.
 *
 * Filters are read from URL search params and applied server-side:
 * - `?buildType=app,feature` — comma-separated build types
 * - `?aiTool=uuid1,uuid2` — comma-separated AI tool IDs
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  // Parse filter values from URL search params.
  // Values can be string | string[] | undefined — we only handle strings.
  const rawBuildType =
    typeof resolvedParams[BUILD_TYPE_PARAM] === 'string'
      ? resolvedParams[BUILD_TYPE_PARAM]
      : undefined;
  const rawAiTool =
    typeof resolvedParams[AI_TOOL_PARAM] === 'string'
      ? resolvedParams[AI_TOOL_PARAM]
      : undefined;

  const buildTypes = parseBuildTypes(rawBuildType);
  const aiToolIds = parseAiToolIds(rawAiTool);

  // Build the filters object. Only include non-empty arrays.
  const filters: FeedFiltersType | undefined =
    buildTypes.length > 0 || aiToolIds.length > 0
      ? {
          ...(buildTypes.length > 0 && { buildTypes }),
          ...(aiToolIds.length > 0 && { aiToolIds }),
        }
      : undefined;

  // Fetch AI tools for the filter controls (server-side).
  const { data: aiTools } = await getAiTools();

  // Serialize search params into a stable key so changing filters
  // triggers a new Suspense boundary and re-shows the skeleton.
  const suspenseKey = [
    buildTypes.sort().join(','),
    aiToolIds.sort().join(','),
  ].join('|');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Builds</h1>

      {/* FeedFilters uses useSearchParams() so it needs its own Suspense boundary */}
      <Suspense fallback={null}>
        <FeedFilters aiTools={aiTools ?? []} />
      </Suspense>

      <div className="mt-6">
        <Suspense key={suspenseKey} fallback={<FeedSkeleton />}>
          <Feed filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
