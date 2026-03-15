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

/** URL search param key for build type filters. */
export const BUILD_TYPE_PARAM = 'buildType';

/** URL search param key for AI tool filters. */
export const AI_TOOL_PARAM = 'aiTool';
