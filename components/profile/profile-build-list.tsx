import { BuildCard } from '@/components/feed/build-card';
import { Badge } from '@/components/ui/badge';
import type { BuildWithDetails } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ProfileBuildListProps = {
  builds: BuildWithDetails[];
};

// ---------------------------------------------------------------------------
// ProfileBuildList
// ---------------------------------------------------------------------------

/**
 * Renders a list of builds for a user's profile page. Shows a heading with
 * a count badge and a responsive grid of build cards, or an empty state
 * when the user has no builds.
 */
export function ProfileBuildList({ builds }: ProfileBuildListProps) {
  return (
    <section>
      {/* Heading with count badge */}
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Builds</h2>
        <Badge variant="secondary">{builds.length}</Badge>
      </div>

      {/* Build grid or empty state */}
      {builds.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No builds yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {builds.map((build) => (
            <BuildCard key={build.id} build={build} />
          ))}
        </div>
      )}
    </section>
  );
}
