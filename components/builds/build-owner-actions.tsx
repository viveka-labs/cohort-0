'use client';

import { Loader2Icon, PencilIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { deleteBuildAction } from '@/app/actions/builds';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { buildEditRoute } from '@/lib/constants/routes';

type BuildOwnerActionsProps = {
  buildId: string;
};

export function BuildOwnerActions({ buildId }: BuildOwnerActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBuildAction(buildId);

      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={buildEditRoute(buildId)}>
          <PencilIcon />
          Edit
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <TrashIcon />
            )}
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete build</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this build? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
