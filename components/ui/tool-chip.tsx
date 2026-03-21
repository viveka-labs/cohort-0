/**
 * ToolChip — icon + label chips for AI tools and tech stack tags.
 *
 * Uses simple-icons for brand logos. Unknown tools fall back to a plain
 * text chip so nothing ever breaks.
 */

import type { LucideIcon } from 'lucide-react';
import { BotIcon, ImageIcon, MicIcon, ZapIcon } from 'lucide-react';
import type { SimpleIcon } from 'simple-icons';
import {
  siClaude,
  siCursor,
  siElevenlabs,
  siFirebase,
  siFlutter,
  siGithubcopilot,
  siGo,
  siJavascript,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siReplit,
  siRust,
  siSupabase,
  siSwift,
  siTailwindcss,
  siTypescript,
  siVercel,
} from 'simple-icons';

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IconDef =
  | { kind: 'simple'; icon: SimpleIcon }
  | { kind: 'lucide'; icon: LucideIcon }
  | { kind: 'emoji'; emoji: string };

// ---------------------------------------------------------------------------
// Icon maps (keyed by slug from the database)
// ---------------------------------------------------------------------------

const AI_TOOL_ICONS: Record<string, IconDef> = {
  claude: { kind: 'simple', icon: siClaude },
  'gpt-4': { kind: 'emoji', emoji: '🤖' },
  cursor: { kind: 'simple', icon: siCursor },
  'github-copilot': { kind: 'simple', icon: siGithubcopilot },
  v0: { kind: 'simple', icon: siVercel },
  bolt: { kind: 'lucide', icon: ZapIcon },
  'replit-agent': { kind: 'simple', icon: siReplit },
  midjourney: { kind: 'lucide', icon: ImageIcon },
  'stable-diffusion': { kind: 'lucide', icon: ImageIcon },
  whisper: { kind: 'lucide', icon: MicIcon },
  elevenlabs: { kind: 'simple', icon: siElevenlabs },
  gemini: { kind: 'emoji', emoji: '✨' },
  lovable: { kind: 'emoji', emoji: '❤️' },
};

const TECH_STACK_ICONS: Record<string, IconDef> = {
  nextjs: { kind: 'simple', icon: siNextdotjs },
  react: { kind: 'simple', icon: siReact },
  python: { kind: 'simple', icon: siPython },
  typescript: { kind: 'simple', icon: siTypescript },
  javascript: { kind: 'simple', icon: siJavascript },
  tailwindcss: { kind: 'simple', icon: siTailwindcss },
  supabase: { kind: 'simple', icon: siSupabase },
  nodejs: { kind: 'simple', icon: siNodedotjs },
  postgresql: { kind: 'simple', icon: siPostgresql },
  vercel: { kind: 'simple', icon: siVercel },
  firebase: { kind: 'simple', icon: siFirebase },
  swift: { kind: 'simple', icon: siSwift },
  flutter: { kind: 'simple', icon: siFlutter },
  rust: { kind: 'simple', icon: siRust },
  go: { kind: 'simple', icon: siGo },
};

// ---------------------------------------------------------------------------
// Primitive: renders a single icon (simple-icons SVG, lucide, or emoji)
// ---------------------------------------------------------------------------

function ChipIcon({
  def,
  size = 12,
  className,
}: {
  def: IconDef;
  size?: number;
  className?: string;
}) {
  if (def.kind === 'emoji') {
    return (
      <span
        className={cn('leading-none', className)}
        style={{ fontSize: size }}
      >
        {def.emoji}
      </span>
    );
  }

  if (def.kind === 'lucide') {
    const Icon = def.icon;
    return <Icon className={className} style={{ width: size, height: size }} />;
  }

  // simple-icons SVG path
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size, fill: 'currentColor' }}
      aria-label={def.icon.title}
    >
      <path d={def.icon.path} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AiToolChip
// ---------------------------------------------------------------------------

type AiToolChipProps = {
  /** Tool name displayed as label */
  name: string;
  /** DB slug used to look up the icon — falls back gracefully if unknown */
  slug: string;
  /** Visual size variant */
  size?: 'sm' | 'md';
};

export function AiToolChip({ name, slug, size = 'md' }: AiToolChipProps) {
  const iconDef = AI_TOOL_ICONS[slug];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-medium',
        'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        size === 'sm' ? 'px-2 py-0.5 font-mono text-xs' : 'px-3 py-1.5 text-sm'
      )}
    >
      {iconDef ? (
        <ChipIcon def={iconDef} size={size === 'sm' ? 10 : 12} />
      ) : (
        <BotIcon
          style={{
            width: size === 'sm' ? 10 : 12,
            height: size === 'sm' ? 10 : 12,
          }}
        />
      )}
      {name}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TechStackChip
// ---------------------------------------------------------------------------

type TechStackChipProps = {
  name: string;
  slug: string;
  size?: 'sm' | 'md';
};

export function TechStackChip({ name, slug, size = 'md' }: TechStackChipProps) {
  const iconDef = TECH_STACK_ICONS[slug];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-mono',
        'border-border bg-muted text-muted-foreground',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      {iconDef && (
        <ChipIcon
          def={iconDef}
          size={size === 'sm' ? 10 : 11}
          className="shrink-0 opacity-70"
        />
      )}
      {name}
    </span>
  );
}
