'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

type NavLinkProps = {
  href: string;
  /** Additional pathnames that should also mark this link as active. */
  activeOn?: string[];
  children: React.ReactNode;
  className?: string;
};

/**
 * A client-side nav link that highlights itself when the current
 * pathname matches `href` or any of the `activeOn` entries.
 *
 * Extracted as a Client Component so the Navbar can remain a
 * Server Component while still getting accurate active-link styling.
 */
export function NavLink({
  href,
  activeOn = [],
  children,
  className,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || activeOn.includes(pathname);

  return (
    <Link
      href={href}
      className={cn(
        'text-sm transition-colors hover:text-foreground',
        isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
        className
      )}
    >
      {children}
    </Link>
  );
}
