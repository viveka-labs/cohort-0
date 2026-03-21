import type { BuildType } from '@/types';

/**
 * Maps build-type enum values to human-readable labels.
 *
 * Used on the build detail page, feed cards, and anywhere a
 * build type needs to be displayed as text.
 */
export const BUILD_TYPE_LABELS: Record<BuildType, string> = {
  app: 'App',
  feature: 'Feature',
  fix: 'Fix',
  automation: 'Automation',
  experiment: 'Experiment',
};

/**
 * Maps build-type enum values to semantic pastel badge classes.
 *
 * Used on feed cards, build detail, and profile build lists.
 */
export const BUILD_TYPE_BADGE_CLASSES: Record<BuildType, string> = {
  app: 'bg-sky-50 text-sky-700 border border-sky-100',
  feature: 'bg-violet-50 text-violet-700 border border-violet-100',
  fix: 'bg-rose-50 text-rose-700 border border-rose-100',
  automation: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  experiment: 'bg-amber-50 text-amber-700 border border-amber-100',
};

/** URL search param key for build type filters. */
export const BUILD_TYPE_PARAM = 'buildType';

/** URL search param key for AI tool filters. */
export const AI_TOOL_PARAM = 'aiTool';

/** URL search param key for the current page number. */
export const PAGE_PARAM = 'page';
