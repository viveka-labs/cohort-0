import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { HardhatIcon } from '@/components/ui/icons';
import { Routes } from '@/lib/constants/routes';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="mb-2 inline-flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <HardhatIcon size={28} />
      </div>
      <h1 className="font-display text-3xl text-foreground">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild variant="outline">
        <Link href={Routes.HOME}>Back to home</Link>
      </Button>
    </div>
  );
}
