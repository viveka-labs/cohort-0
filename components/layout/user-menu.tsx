'use client';

import { LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { signOut } from '@/app/actions/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { profileRoute, Routes } from '@/lib/constants/routes';
import type { Profile } from '@/types';

interface UserMenuProps {
  profile: Profile | null;
}

function getAvatarFallback(profile: Profile | null): string {
  if (!profile?.display_name) {
    return 'U';
  }
  return profile.display_name.charAt(0).toUpperCase();
}

export function UserMenu({ profile }: UserMenuProps) {
  const signOutFormRef = useRef<HTMLFormElement>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Avatar>
            {profile?.avatar_url && (
              <AvatarImage
                src={profile.avatar_url}
                alt={profile.display_name ?? 'User avatar'}
              />
            )}
            <AvatarFallback>{getAvatarFallback(profile)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {profile?.display_name && (
          <>
            <DropdownMenuLabel>{profile.display_name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          {profile && (
            <DropdownMenuItem asChild>
              <Link href={profileRoute(profile.id)}>
                <User />
                Profile
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link href={Routes.PROFILE_SETTINGS}>
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => signOutFormRef.current?.requestSubmit()}
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Hidden form for the signOut server action */}
        <form ref={signOutFormRef} action={signOut} className="hidden" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
