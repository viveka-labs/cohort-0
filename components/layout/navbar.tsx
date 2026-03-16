import type { User } from '@supabase/supabase-js';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Routes } from '@/lib/constants/routes';
import type { Profile } from '@/types';

import { UserMenu } from './user-menu';

interface NavbarProps {
  user: User | null;
  profile: Profile | null;
}

export function Navbar({ user, profile }: NavbarProps) {
  return (
    <nav className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={Routes.HOME} className="text-lg font-semibold">
            Bob the Builder
          </Link>

          <Link
            href={Routes.FEED}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Feed
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm">
            <Link href={Routes.BUILD_NEW}>
              <Plus data-icon="inline-start" />
              Submit Build
            </Link>
          </Button>

          {user ? (
            <UserMenu profile={profile} />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={Routes.LOGIN}>Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={Routes.SIGNUP}>Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
