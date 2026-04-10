'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

const classicToggleClass =
  'inline-flex h-10 w-10 min-h-0 min-w-0 shrink-0 items-center justify-center rounded-none border border-zinc-300 bg-white p-0 leading-none text-zinc-700 shadow-none hover:bg-zinc-100 focus-visible:ring-0 focus-visible:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800';

/** Neubrutalism public pages: match nav pill energy without duplicating full pill styles. */
const neuToggleClass =
  '!rounded-none border-4 border-zinc-900 bg-white text-zinc-900 shadow-[4px_4px_0_0_rgb(24_24_27)] hover:bg-zinc-50 dark:border-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[4px_4px_0_0_rgb(228_228_231)] dark:hover:bg-zinc-900';

export function PortfolioPublicThemeToggle({
  variant = 'classic',
  className,
}: {
  variant?: 'classic' | 'neu';
  className?: string;
}) {
  return (
    <ThemeToggle
      className={cn(variant === 'neu' ? neuToggleClass : classicToggleClass, 'shrink-0', className)}
    />
  );
}
