import { cn } from '@/lib/utils';

import { ImagePlaceholderIcon } from './icons';

type CheckerboardPlaceholderProps = {
  className?: string;
  /** Size of the centered placeholder icon. Defaults to 32. */
  iconSize?: number;
  /** Whether to show the centered icon. Defaults to true. */
  showIcon?: boolean;
};

/**
 * A subtle checkerboard background used as a placeholder for
 * missing thumbnails or screenshots. Fills its parent container.
 */
export function CheckerboardPlaceholder({
  className,
  iconSize = 32,
  showIcon = true,
}: CheckerboardPlaceholderProps) {
  return (
    <div
      className={cn('flex size-full items-center justify-center', className)}
      style={{
        backgroundImage: `
          linear-gradient(45deg, #E4E4E7 25%, transparent 25%),
          linear-gradient(-45deg, #E4E4E7 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #E4E4E7 75%),
          linear-gradient(-45deg, transparent 75%, #E4E4E7 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        backgroundColor: '#F4F4F5',
      }}
    >
      {showIcon && <ImagePlaceholderIcon size={iconSize} />}
    </div>
  );
}
