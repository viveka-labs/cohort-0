import { Github, Globe, Linkedin } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Profile } from '@/types';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

/** Inline X (formerly Twitter) logo — lucide-react removed brand icons. */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ProfileHeaderProps = {
  profile: Profile;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Social link configuration — maps a profile field to an icon and label.
 * Each entry is only rendered when the corresponding URL is non-null.
 */
const SOCIAL_LINKS = [
  { key: 'github_url', icon: Github, label: 'GitHub' },
  { key: 'twitter_url', icon: XIcon, label: 'X (Twitter)' },
  { key: 'linkedin_url', icon: Linkedin, label: 'LinkedIn' },
  { key: 'website_url', icon: Globe, label: 'Website' },
] as const;

// ---------------------------------------------------------------------------
// ProfileHeader
// ---------------------------------------------------------------------------

/**
 * Renders the profile header section: avatar, display name, bio, join date,
 * and social links. All social/display fields are nullable — fields are
 * hidden rather than showing empty placeholders.
 */
export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const displayName = profile.display_name ?? 'Anonymous';

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {/* Avatar — size-20 override via className */}
      <Avatar className="size-20">
        {profile.avatar_url && (
          <AvatarImage src={profile.avatar_url} alt={displayName} />
        )}
        <AvatarFallback className="text-2xl">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Display name */}
      <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>

      {/* Bio — only shown when present */}
      {profile.bio && (
        <p className="max-w-md text-muted-foreground">{profile.bio}</p>
      )}

      {/* Join date */}
      <p className="text-sm text-muted-foreground">Joined {joinDate}</p>

      {/* Social links — only rendered when at least one URL is present */}
      <SocialLinks profile={profile} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SocialLinks (internal)
// ---------------------------------------------------------------------------

function SocialLinks({ profile }: { profile: Profile }) {
  const links = SOCIAL_LINKS.filter((link) => profile[link.key] !== null);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {links.map(({ key, icon: Icon, label }) => (
        <a
          key={key}
          href={profile[key]!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label={label}
        >
          <Icon className="size-5" />
        </a>
      ))}
    </div>
  );
}
