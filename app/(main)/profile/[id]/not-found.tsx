import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Routes } from '@/lib/constants/routes';

export default function ProfileNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-3xl text-foreground">
        Profile not found
      </h1>
      <p className="text-muted-foreground">
        This builder profile doesn&apos;t exist or may have been removed.
      </p>
      <Button asChild variant="outline">
        <Link href={Routes.HOME}>Back to home</Link>
      </Button>
    </div>
  );
}
