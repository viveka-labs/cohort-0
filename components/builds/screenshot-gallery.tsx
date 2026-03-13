'use client';

import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { BuildScreenshot } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ScreenshotGalleryProps = {
  screenshots: BuildScreenshot[];
};

// ---------------------------------------------------------------------------
// ScreenshotGallery
// ---------------------------------------------------------------------------

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (screenshots.length === 0) {
    return null;
  }

  const mainScreenshot = screenshots[selectedIndex];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
        <Image
          src={mainScreenshot.url}
          alt={`Screenshot ${selectedIndex + 1} of ${screenshots.length}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </div>

      {/* Thumbnail strip — only shown when there are 2+ screenshots */}
      {screenshots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {screenshots.map((screenshot, index) => (
            <button
              key={screenshot.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative size-16 shrink-0 overflow-hidden rounded-md border-2 bg-muted transition-colors sm:size-20',
                index === selectedIndex
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-muted-foreground/40'
              )}
              aria-label={`View screenshot ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
            >
              <Image
                src={screenshot.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
