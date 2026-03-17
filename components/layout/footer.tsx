import { HardhatIcon } from '@/components/ui/icons';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HardhatIcon size={18} />
            </div>
            <div>
              <span className="font-display text-sm text-foreground">
                Bob the Builder
              </span>
              <span className="block font-mono text-xs text-muted-foreground">
                Can we ship it? Yes we can.
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Bob the Builder. Ship real work.
          </p>
        </div>
      </div>
    </footer>
  );
}
