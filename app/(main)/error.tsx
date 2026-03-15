'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Routes } from '@/lib/constants/routes';

export default function MainError({
  error: _err,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">
        An unexpected error occurred. Please try again or go back to the home
        page.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href={Routes.HOME}>Go home</Link>
        </Button>
      </div>
    </div>
  );
}
