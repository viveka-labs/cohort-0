'use client';

import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AI_TOOL_PARAM,
  BUILD_TYPE_LABELS,
  BUILD_TYPE_PARAM,
} from '@/lib/constants/builds';
import { cn } from '@/lib/utils';
import type { AiTool, BuildType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** All build type keys in display order. */
const BUILD_TYPES = Object.keys(BUILD_TYPE_LABELS) as BuildType[];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FeedFiltersProps {
  /** Available AI tools, passed from the server page component. */
  aiTools: AiTool[];
}

// ---------------------------------------------------------------------------
// FeedFilters
// ---------------------------------------------------------------------------

/**
 * Client component that renders filter controls for the home feed.
 *
 * - Build Type toggle buttons for all 5 types
 * - AI Tool multi-select using Popover + Command
 * - Active filter badges with individual dismiss buttons
 * - "Clear all" button when any filter is active
 *
 * Filter state is stored in URL search params so the server page
 * component can read them and pass to `getBuilds()`.
 */
export function FeedFilters({ aiTools }: FeedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [aiToolPopoverOpen, setAiToolPopoverOpen] = useState(false);

  // -------------------------------------------------------------------------
  // Read current filter state from URL
  // -------------------------------------------------------------------------

  const activeBuildTypes = parseBuildTypes(searchParams.get(BUILD_TYPE_PARAM));
  const activeAiToolIds = parseAiToolIds(
    searchParams.get(AI_TOOL_PARAM),
    aiTools
  );

  const hasActiveFilters =
    activeBuildTypes.length > 0 || activeAiToolIds.length > 0;

  // -------------------------------------------------------------------------
  // URL update helper
  // -------------------------------------------------------------------------

  const updateUrl = useCallback(
    (buildTypes: BuildType[], aiToolIds: string[]) => {
      const params = new URLSearchParams();

      if (buildTypes.length > 0) {
        params.set(BUILD_TYPE_PARAM, buildTypes.join(','));
      }

      if (aiToolIds.length > 0) {
        params.set(AI_TOOL_PARAM, aiToolIds.join(','));
      }

      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(url, { scroll: false });
    },
    [pathname, router]
  );

  // -------------------------------------------------------------------------
  // Build Type toggle handlers
  // -------------------------------------------------------------------------

  function toggleBuildType(type: BuildType) {
    const next = activeBuildTypes.includes(type)
      ? activeBuildTypes.filter((t) => t !== type)
      : [...activeBuildTypes, type];

    updateUrl(next, activeAiToolIds);
  }

  function removeBuildType(type: BuildType) {
    updateUrl(
      activeBuildTypes.filter((t) => t !== type),
      activeAiToolIds
    );
  }

  // -------------------------------------------------------------------------
  // AI Tool toggle handlers
  // -------------------------------------------------------------------------

  function toggleAiTool(toolId: string) {
    const next = activeAiToolIds.includes(toolId)
      ? activeAiToolIds.filter((id) => id !== toolId)
      : [...activeAiToolIds, toolId];

    updateUrl(activeBuildTypes, next);
  }

  function removeAiTool(toolId: string) {
    updateUrl(
      activeBuildTypes,
      activeAiToolIds.filter((id) => id !== toolId)
    );
  }

  // -------------------------------------------------------------------------
  // Clear all filters
  // -------------------------------------------------------------------------

  function clearAll() {
    updateUrl([], []);
  }

  // -------------------------------------------------------------------------
  // Derived data for AI Tool display
  // -------------------------------------------------------------------------

  const selectedAiTools = aiTools.filter((tool) =>
    activeAiToolIds.includes(tool.id)
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-3 pb-2">
      {/* Filter controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Build Type toggles */}
        <div className="flex flex-wrap gap-1.5">
          {BUILD_TYPES.map((type) => {
            const isActive = activeBuildTypes.includes(type);

            return (
              <Button
                key={type}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleBuildType(type)}
                aria-pressed={isActive}
              >
                {BUILD_TYPE_LABELS[type]}
              </Button>
            );
          })}
        </div>

        {/* AI Tool multi-select */}
        <Popover open={aiToolPopoverOpen} onOpenChange={setAiToolPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              aria-expanded={aiToolPopoverOpen}
              className={cn(
                'justify-between',
                activeAiToolIds.length === 0 && 'text-muted-foreground'
              )}
            >
              {activeAiToolIds.length > 0
                ? `${activeAiToolIds.length} AI tool${activeAiToolIds.length === 1 ? '' : 's'}`
                : 'AI Tools'}
              <ChevronsUpDownIcon className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search AI tools..." />
              <CommandList>
                <CommandEmpty>No AI tools found.</CommandEmpty>
                <CommandGroup>
                  {aiTools.map((tool) => {
                    const isSelected = activeAiToolIds.includes(tool.id);

                    return (
                      <CommandItem
                        key={tool.id}
                        value={tool.name}
                        onSelect={() => toggleAiTool(tool.id)}
                      >
                        <div
                          className={cn(
                            'flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-white'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <CheckIcon className="size-3 text-white stroke-[3]" />
                        </div>
                        {tool.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Clear all button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {activeBuildTypes.map((type) => (
            <Badge key={type} variant="secondary">
              {BUILD_TYPE_LABELS[type]}
              <button
                type="button"
                className="ml-1 rounded-full outline-none hover:text-foreground"
                onClick={() => removeBuildType(type)}
                aria-label={`Remove ${BUILD_TYPE_LABELS[type]} filter`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          {selectedAiTools.map((tool) => (
            <Badge key={tool.id} variant="secondary">
              {tool.name}
              <button
                type="button"
                className="ml-1 rounded-full outline-none hover:text-foreground"
                onClick={() => removeAiTool(tool.id)}
                aria-label={`Remove ${tool.name} filter`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// URL param parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parses a comma-separated `buildType` param value into valid BuildType values.
 * Invalid values are silently dropped.
 */
function parseBuildTypes(raw: string | null): BuildType[] {
  if (!raw) {
    return [];
  }

  const validTypes = new Set<string>(BUILD_TYPES);

  return raw
    .split(',')
    .filter((value): value is BuildType => validTypes.has(value));
}

/**
 * Parses a comma-separated `aiTool` param value into valid AI tool IDs.
 * IDs not found in the available tools list are silently dropped.
 */
function parseAiToolIds(
  raw: string | null,
  availableTools: AiTool[]
): string[] {
  if (!raw) {
    return [];
  }

  const validIds = new Set(availableTools.map((tool) => tool.id));

  return raw.split(',').filter((id) => validIds.has(id));
}
