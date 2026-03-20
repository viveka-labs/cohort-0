import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// text-primary-foreground on the CheckIcon is required — CommandItem applies
// [&_svg:not([class*='text-'])]:text-muted-foreground to all descendant SVGs,
// which overrides inherited color unless a text-* class is present on the icon.
export function CommandCheckbox({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary',
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'opacity-50 [&_svg]:invisible'
      )}
    >
      <CheckIcon className="size-3 stroke-[3] text-primary-foreground" />
    </div>
  );
}
