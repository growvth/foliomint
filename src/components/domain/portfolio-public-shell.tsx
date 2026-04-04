import { GeistMono } from 'geist/font/mono';

import { normalizePortfolioAccent } from '@/lib/portfolio-accent';
import { cn } from '@/lib/utils';

export function PortfolioPublicShell({
  accentColor,
  children,
  embed,
}: {
  accentColor?: string | null;
  children: React.ReactNode;
  /** Nested preview: no full viewport height, rounded to sit inside editor card. */
  embed?: boolean;
}) {
  const accent = normalizePortfolioAccent(accentColor);
  return (
    <div
      className={cn(
        GeistMono.className,
        'portfolio-public-canvas bg-zinc-50 text-zinc-900 antialiased [color-scheme:light]',
        'dark:bg-[#09090b] dark:text-zinc-200 dark:[color-scheme:dark]',
        embed ? 'min-h-[min(520px,60vh)] overflow-hidden rounded-md' : 'min-h-screen',
      )}
      style={{ '--portfolio-accent': accent } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
