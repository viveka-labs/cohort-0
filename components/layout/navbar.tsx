import type { User } from '@supabase/supabase-js';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { HardhatIcon } from '@/components/ui/icons';
import { Routes } from '@/lib/constants/routes';
import type { Profile } from '@/types';

import { NavLink } from './nav-link';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

interface NavbarProps {
  user: User | null;
  profile: Profile | null;
}

export function Navbar({ user, profile }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + Tagline */}
        <div className="flex items-center gap-3">
          <Link href={Routes.HOME} className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HardhatIcon size={20} />
            </div>
            <div>
              <span className="font-display text-lg leading-none text-foreground">
                Bob the Builder
              </span>
              <span className="mt-0.5 hidden text-[11px] tracking-wide text-muted-foreground sm:block font-mono">
                Can we ship it? Yes we can.
              </span>
            </div>
          </Link>

          <NavLink href={Routes.FEED} activeOn={[Routes.HOME]} className="ml-4">
            Feed
          </NavLink>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Button asChild size="sm">
            <Link href={Routes.BUILD_NEW}>
              <Plus data-icon="inline-start" />
              Submit Build
            </Link>
          </Button>

          {user ? (
            <UserMenu profile={profile} />
          ) : (
            <Button size="sm" asChild>
              <Link href={Routes.LOGIN}>Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
