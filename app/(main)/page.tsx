import { Suspense } from 'react';

import { BuildCardSkeleton } from '@/components/feed/build-card-skeleton';
import { BuildFeed } from '@/components/feed/build-feed';
import { FeedFilters } from '@/components/feed/feed-filters';
import {
  AI_TOOL_PARAM,
  BUILD_TYPE_LABELS,
  BUILD_TYPE_PARAM,
  PAGE_PARAM,
} from '@/lib/constants/builds';
import { getAiTools } from '@/lib/queries/ai-tools';
import { getBuilds } from '@/lib/queries/builds';
import type { BuildType, FeedFilters as FeedFiltersType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of skeleton cards shown while the feed is loading. */
const SKELETON_COUNT = 6;

/** Maximum number of builds returned per page. */
const BUILDS_PAGE_SIZE = 20;

/** Set of valid build type values for validation. */
const VALID_BUILD_TYPES = new Set<string>(Object.keys(BUILD_TYPE_LABELS));

// ---------------------------------------------------------------------------
// Search param parsing helpers
// ---------------------------------------------------------------------------

function parseBuildTypes(raw: string | undefined): BuildType[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .filter((value): value is BuildType => VALID_BUILD_TYPES.has(value));
}

function parseAiToolIds(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  return raw.split(',').filter(Boolean);
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Build a URL that preserves existing search params but changes the page. */
function buildPageHref(
  rawParams: Record<string, string | string[] | undefined>,
  page: number
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(rawParams)) {
    if (key !== PAGE_PARAM && typeof value === 'string') {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set(PAGE_PARAM, String(page));
  }

  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

// ---------------------------------------------------------------------------
// Feed (async, Suspense-ready)
// ---------------------------------------------------------------------------

async function Feed({
  filters,
  currentPage,
  rawParams,
}: {
  filters?: FeedFiltersType;
  currentPage: number;
  rawParams: Record<string, string | string[] | undefined>;
}) {
  const hasActiveFilters =
    (filters?.buildTypes?.length ?? 0) > 0 ||
    (filters?.aiToolIds?.length ?? 0) > 0;

  const {
    data: builds,
    count,
    error,
  } = await getBuilds({
    ...filters,
    page: currentPage,
  });

  if (error) {
    throw error;
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / BUILDS_PAGE_SIZE));
  const prevHref =
    currentPage > 1 ? buildPageHref(rawParams, currentPage - 1) : null;
  const nextHref =
    currentPage < totalPages ? buildPageHref(rawParams, currentPage + 1) : null;

  return (
    <BuildFeed
      builds={builds ?? []}
      hasActiveFilters={hasActiveFilters}
      pagination={{
        currentPage,
        totalPages,
        totalCount,
        prevHref,
        nextHref,
      }}
    />
  );
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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const rawBuildType =
    typeof resolvedParams[BUILD_TYPE_PARAM] === 'string'
      ? resolvedParams[BUILD_TYPE_PARAM]
      : undefined;
  const rawAiTool =
    typeof resolvedParams[AI_TOOL_PARAM] === 'string'
      ? resolvedParams[AI_TOOL_PARAM]
      : undefined;
  const rawPage =
    typeof resolvedParams[PAGE_PARAM] === 'string'
      ? resolvedParams[PAGE_PARAM]
      : undefined;

  const buildTypes = parseBuildTypes(rawBuildType);
  const aiToolIds = parseAiToolIds(rawAiTool);
  const currentPage = parsePage(rawPage);

  const filters: FeedFiltersType | undefined =
    buildTypes.length > 0 || aiToolIds.length > 0
      ? {
          ...(buildTypes.length > 0 && { buildTypes }),
          ...(aiToolIds.length > 0 && { aiToolIds }),
        }
      : undefined;

  const { data: aiTools, error: aiToolsError } = await getAiTools();
  if (aiToolsError) {
    throw aiToolsError;
  }

  // Include page in the key so changing page re-triggers the skeleton.
  const suspenseKey = [
    [...buildTypes].sort().join(','),
    [...aiToolIds].sort().join(','),
    String(currentPage),
  ].join('|');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            The Feed
          </span>
        </div>
        <h1 className="font-display text-4xl text-foreground mb-2">
          What builders are shipping
        </h1>
        <p className="text-sm text-muted-foreground">
          Real work shipped with AI. No tutorials, no hype — proof of
          what&apos;s possible.
        </p>
        <div className="mt-6 border-t border-border" />
      </div>

      {/* FeedFilters uses useSearchParams() so it needs its own Suspense boundary */}
      <Suspense fallback={null}>
        <FeedFilters aiTools={aiTools ?? []} />
      </Suspense>

      <div className="mt-6">
        <Suspense key={suspenseKey} fallback={<FeedSkeleton />}>
          <Feed
            filters={filters}
            currentPage={currentPage}
            rawParams={resolvedParams}
          />
        </Suspense>
      </div>
    </div>
  );
}
